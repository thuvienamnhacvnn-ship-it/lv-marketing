import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { getEnv, isAiConfigured } from "@/lib/env";

let cached: Anthropic | null = null;

/**
 * Client Anthropic dùng chung, chỉ tồn tại phía server.
 * API key không bao giờ được gửi xuống client.
 */
export function getAnthropic(): Anthropic {
  if (!isAiConfigured()) {
    throw new AiNotConfiguredError();
  }
  if (cached) return cached;

  const env = getEnv();
  cached = new Anthropic({
    apiKey: env.ANTHROPIC_API_KEY,
    timeout: env.AI_TIMEOUT_MS,
    // Retry do tầng runner tự xử lý để ghi log và đếm token chính xác.
    maxRetries: 0,
  });
  return cached;
}

export class AiNotConfiguredError extends Error {
  readonly code = "AI_NOT_CONFIGURED";
  constructor() {
    super("Chưa cấu hình ANTHROPIC_API_KEY — tính năng AI đang tắt.");
    this.name = "AiNotConfiguredError";
  }
}

export class AiOutputInvalidError extends Error {
  readonly code = "AI_OUTPUT_INVALID";
  constructor(
    message: string,
    readonly raw: string,
  ) {
    super(message);
    this.name = "AiOutputInvalidError";
  }
}

export class AiRequestError extends Error {
  readonly code = "AI_REQUEST_FAILED";
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "AiRequestError";
  }
}

export { isAiConfigured };
