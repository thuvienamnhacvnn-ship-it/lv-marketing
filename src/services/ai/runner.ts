import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getEnv } from "@/lib/env";
import { AiOutputInvalidError, AiRequestError, getAnthropic } from "./client";
import { estimateCostMicroCents } from "./pricing";
import { toJsonSchema } from "./schemas";
import { PROMPTS, type PromptName } from "./prompts";

type Effort = "low" | "medium" | "high" | "xhigh" | "max";

export type RunOptions<TSchema extends z.ZodType> = {
  prompt: PromptName;
  schema: TSchema;
  /** Dữ liệu nghiệp vụ gửi cho Claude — luôn được ghi lại vào AiGeneration.input. */
  input: Record<string, unknown>;
  organizationId: string;
  userId?: string | null;
  effort?: Effort;
  /** Thay model mặc định cho một tác vụ cụ thể. */
  model?: string;
};

export type RunResult<T> = {
  data: T;
  generationId: string;
  usage: { inputTokens: number; outputTokens: number; costMicroCents: number; latencyMs: number };
};

/** Giới hạn số lượt gọi AI mỗi phút cho một tenant, tránh một workspace chiếm hết quota. */
const RATE_LIMIT_PER_MINUTE = 20;
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

export class AiRateLimitError extends Error {
  readonly code = "AI_RATE_LIMITED";
  constructor(readonly retryAfterSeconds: number) {
    super(`Bạn đang gửi quá nhiều yêu cầu AI. Vui lòng thử lại sau ${retryAfterSeconds} giây.`);
    this.name = "AiRateLimitError";
  }
}

function checkRateLimit(organizationId: string) {
  const now = Date.now();
  const bucket = rateBuckets.get(organizationId);

  if (!bucket || now >= bucket.resetAt) {
    rateBuckets.set(organizationId, { count: 1, resetAt: now + 60_000 });
    return;
  }
  if (bucket.count >= RATE_LIMIT_PER_MINUTE) {
    throw new AiRateLimitError(Math.ceil((bucket.resetAt - now) / 1000));
  }
  bucket.count += 1;
}

function isRetryable(error: unknown): boolean {
  if (error instanceof Anthropic.APIConnectionError) return true;
  if (error instanceof Anthropic.APIError) {
    const status = error.status ?? 0;
    return status === 408 || status === 409 || status === 429 || status >= 500;
  }
  return false;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractText(message: Anthropic.Message): string {
  return message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();
}

/**
 * Luồng chuẩn: Server Action → runAiTask → Claude → validate Zod → ghi AiGeneration → trả kết quả.
 * Không có đường nào gọi thẳng Claude từ client.
 */
export async function runAiTask<TSchema extends z.ZodType>(
  options: RunOptions<TSchema>,
): Promise<RunResult<z.infer<TSchema>>> {
  const env = getEnv();
  const definition = PROMPTS[options.prompt];
  const model = options.model ?? env.ANTHROPIC_MODEL;

  checkRateLimit(options.organizationId);

  const generation = await prisma.aiGeneration.create({
    data: {
      organizationId: options.organizationId,
      userId: options.userId ?? null,
      taskType: definition.taskType,
      model,
      promptKey: definition.key,
      promptVersion: definition.version,
      input: options.input as object,
      status: "PENDING",
    },
    select: { id: true },
  });

  const startedAt = Date.now();
  const client = getAnthropic();
  // max_tokens bao gồm cả phần suy luận nội bộ, nên luôn để dư đầu.
  const maxTokens = Math.min(Math.max(definition.maxTokens, 4_000), env.ANTHROPIC_MAX_TOKENS * 8);

  let lastError: unknown = null;

  for (let attempt = 0; attempt <= env.AI_MAX_RETRIES; attempt += 1) {
    try {
      const message = await client.messages.create({
        model,
        max_tokens: maxTokens,
        system: definition.system,
        output_config: {
          effort: options.effort ?? "medium",
          format: {
            type: "json_schema",
            schema: toJsonSchema(options.schema),
          },
        },
        messages: [
          {
            role: "user",
            content: JSON.stringify(options.input, null, 2),
          },
        ],
      });

      const latencyMs = Date.now() - startedAt;
      const inputTokens = message.usage.input_tokens ?? 0;
      const outputTokens = message.usage.output_tokens ?? 0;
      const costMicroCents = estimateCostMicroCents(model, inputTokens, outputTokens);

      if (message.stop_reason === "refusal") {
        await markFailed(generation.id, "Claude từ chối xử lý yêu cầu này.", {
          inputTokens,
          outputTokens,
          costMicroCents,
          latencyMs,
        });
        throw new AiRequestError("Yêu cầu bị từ chối vì lý do an toàn nội dung.");
      }

      const raw = extractText(message);
      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(raw);
      } catch {
        await markInvalid(generation.id, raw, { inputTokens, outputTokens, costMicroCents, latencyMs });
        throw new AiOutputInvalidError("Kết quả trả về không phải JSON hợp lệ.", raw);
      }

      const validated = options.schema.safeParse(parsedJson);
      if (!validated.success) {
        await markInvalid(generation.id, raw, { inputTokens, outputTokens, costMicroCents, latencyMs });
        throw new AiOutputInvalidError(
          `Kết quả không khớp schema: ${validated.error.issues.map((i) => i.path.join(".")).join(", ")}`,
          raw,
        );
      }

      await prisma.aiGeneration.update({
        where: { id: generation.id },
        data: {
          status: "SUCCEEDED",
          output: validated.data as object,
          inputTokens,
          outputTokens,
          costMicroCents,
          latencyMs,
        },
      });

      return {
        data: validated.data as z.infer<TSchema>,
        generationId: generation.id,
        usage: { inputTokens, outputTokens, costMicroCents, latencyMs },
      };
    } catch (error) {
      lastError = error;
      if (error instanceof AiOutputInvalidError || error instanceof AiRequestError) throw error;

      if (isRetryable(error) && attempt < env.AI_MAX_RETRIES) {
        await sleep(500 * 2 ** attempt);
        continue;
      }
      break;
    }
  }

  const status = lastError instanceof Anthropic.APIError ? lastError.status : undefined;
  const messageText =
    lastError instanceof Error ? lastError.message : "Không gọi được Claude API.";

  await markFailed(generation.id, messageText, {
    inputTokens: 0,
    outputTokens: 0,
    costMicroCents: 0,
    latencyMs: Date.now() - startedAt,
  });

  throw new AiRequestError(messageText, status ?? undefined);
}

type UsageFields = {
  inputTokens: number;
  outputTokens: number;
  costMicroCents: number;
  latencyMs: number;
};

async function markFailed(id: string, error: string, usage: UsageFields) {
  await prisma.aiGeneration.update({
    where: { id },
    data: { status: "FAILED", error: error.slice(0, 1000), ...usage },
  });
}

async function markInvalid(id: string, raw: string, usage: UsageFields) {
  await prisma.aiGeneration.update({
    where: { id },
    data: {
      status: "INVALID_OUTPUT",
      error: raw.slice(0, 1000),
      ...usage,
    },
  });
}
