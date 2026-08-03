import { z } from "zod";

/**
 * Validate biến môi trường một lần, phía server.
 * Không import file này từ component chạy trên client.
 */
const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL chưa được cấu hình"),
  AUTH_SECRET: z.string().min(16, "AUTH_SECRET cần tối thiểu 16 ký tự"),
  AUTH_URL: z.string().url().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().default("claude-sonnet-5"),
  ANTHROPIC_MAX_TOKENS: z.coerce.number().int().positive().default(2048),
  AI_TIMEOUT_MS: z.coerce.number().int().positive().default(60_000),
  AI_MAX_RETRIES: z.coerce.number().int().min(0).max(5).default(2),
  CRON_SECRET: z.string().optional(),
  UPLOAD_DRIVER: z.enum(["local", "cloudinary", "uploadthing"]).default("local"),
  CLOUDINARY_URL: z.string().optional(),
  UPLOADTHING_TOKEN: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverSchema>;

let cached: ServerEnv | null = null;

export function getEnv(): ServerEnv {
  if (cached) return cached;

  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Biến môi trường không hợp lệ:\n${issues}`);
  }

  cached = parsed.data;
  return cached;
}

/** AI chỉ hoạt động khi có API key — nếu không, UI phải báo rõ thay vì giả lập kết quả. */
export function isAiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}
