import { z } from "zod";

/**
 * Schema đầu ra của từng nghiệp vụ AI.
 * Mỗi kết quả trả về từ Claude đều phải qua Zod trước khi ghi database.
 */

export const contentVariantSchema = z.object({
  headline: z.string().min(1).max(200),
  body: z.string().min(1),
  callToAction: z.string().max(160),
  hashtags: z.array(z.string()).max(15),
  toneNote: z.string().max(200),
});

export const contentResultSchema = z.object({
  variants: z.array(contentVariantSchema).min(1).max(4),
  complianceNotes: z.array(z.string()).max(6),
  imagePrompt: z.string().max(600),
});

export type ContentResult = z.infer<typeof contentResultSchema>;
export type ContentVariant = z.infer<typeof contentVariantSchema>;

export const strategyResultSchema = z.object({
  brandSummary: z.string().min(1),
  personas: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        needs: z.array(z.string()).max(6),
        channels: z.array(z.string()).max(6),
      }),
    )
    .min(1)
    .max(4),
  goals: z
    .array(z.object({ title: z.string(), metric: z.string(), horizon: z.string() }))
    .min(1)
    .max(6),
  contentPillars: z
    .array(z.object({ name: z.string(), description: z.string(), sampleTopics: z.array(z.string()).max(5) }))
    .min(2)
    .max(6),
  recommendedChannels: z.array(z.object({ channel: z.string(), reason: z.string() })).max(7),
  seasonalCampaigns: z
    .array(z.object({ month: z.string(), idea: z.string(), objective: z.string() }))
    .max(12),
  localIdeas: z.array(z.string()).max(8),
  competitorPositioning: z.string(),
  campaignIdeas: z
    .array(z.object({ name: z.string(), objective: z.string(), hook: z.string() }))
    .max(8),
});

export type StrategyResult = z.infer<typeof strategyResultSchema>;

export const calendarResultSchema = z.object({
  summary: z.string(),
  items: z
    .array(
      z.object({
        date: z.string().describe("YYYY-MM-DD"),
        channel: z.string(),
        contentType: z.string(),
        title: z.string(),
        outline: z.string(),
        callToAction: z.string(),
      }),
    )
    .min(1)
    .max(40),
});

export type CalendarResult = z.infer<typeof calendarResultSchema>;

export const replyResultSchema = z.object({
  reply: z.string().min(1),
  language: z.enum(["vi", "de"]),
  tone: z.string(),
  escalate: z.boolean(),
  escalationReason: z.string().max(300),
});

export type ReplyResult = z.infer<typeof replyResultSchema>;

export const conversationSummarySchema = z.object({
  summary: z.string(),
  intent: z.string(),
  sentiment: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"]),
  isLead: z.boolean(),
  isComplaint: z.boolean(),
  nextActions: z.array(z.string()).max(5),
});

export type ConversationSummary = z.infer<typeof conversationSummarySchema>;

export const dailyBriefSchema = z.object({
  greeting: z.string().max(200),
  recommendations: z
    .array(
      z.object({
        title: z.string().max(120),
        detail: z.string().max(400),
        priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
        module: z.string().max(40),
      }),
    )
    .min(3)
    .max(5),
});

export type DailyBrief = z.infer<typeof dailyBriefSchema>;

export const analyticsSummarySchema = z.object({
  whatChanged: z.string(),
  bestContent: z.string(),
  whyChanged: z.string(),
  nextSteps: z.array(z.string()).min(1).max(5),
});

export type AnalyticsSummary = z.infer<typeof analyticsSummarySchema>;

/**
 * Chuyển Zod schema sang JSON Schema cho `output_config.format`.
 * Zod v4 đã tự sinh `additionalProperties: false` và `required` — đúng yêu cầu structured output.
 */
export function toJsonSchema(schema: z.ZodType): Record<string, unknown> {
  const json = z.toJSONSchema(schema, { target: "draft-2020-12" }) as Record<string, unknown>;
  delete json.$schema;
  return json;
}
