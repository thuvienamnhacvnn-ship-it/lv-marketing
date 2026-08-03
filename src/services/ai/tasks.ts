import "server-only";
import { prisma } from "@/lib/prisma";
import { runAiTask } from "./runner";
import {
  analyticsSummarySchema,
  calendarResultSchema,
  contentResultSchema,
  conversationSummarySchema,
  dailyBriefSchema,
  replyResultSchema,
  strategyResultSchema,
} from "./schemas";

/** Ngữ cảnh thương hiệu gửi kèm mọi tác vụ AI — nguồn duy nhất để Claude hiểu doanh nghiệp. */
export async function loadBrandContext(organizationId: string) {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      name: true,
      industry: true,
      city: true,
      timezone: true,
      brandProfiles: {
        take: 1,
        orderBy: { createdAt: "asc" },
        select: {
          brandName: true,
          toneOfVoice: true,
          services: true,
          products: true,
          targetAudience: true,
          serviceArea: true,
          usp: true,
          bannedWords: true,
          contentLanguage: true,
          city: true,
          openingHours: true,
          website: true,
        },
      },
    },
  });

  if (!organization) throw new Error("Không tìm thấy doanh nghiệp.");

  const profile = organization.brandProfiles[0];
  return {
    organizationName: organization.name,
    industry: organization.industry,
    city: profile?.city ?? organization.city ?? "Berlin",
    timezone: organization.timezone,
    brandName: profile?.brandName ?? organization.name,
    toneOfVoice: profile?.toneOfVoice ?? "Chuyên nghiệp, thân thiện, gần gũi",
    services: profile?.services ?? [],
    products: profile?.products ?? [],
    targetAudience: profile?.targetAudience ?? null,
    serviceArea: profile?.serviceArea ?? null,
    usp: profile?.usp ?? null,
    bannedWords: profile?.bannedWords ?? [],
    contentLanguage: profile?.contentLanguage ?? "VI",
    website: profile?.website ?? null,
    openingHours: profile?.openingHours ?? null,
  };
}

export type BrandContext = Awaited<ReturnType<typeof loadBrandContext>>;

type Actor = { organizationId: string; userId?: string | null };

export type ContentBrief = {
  goal: string;
  channel: string;
  contentType: string;
  language: "vi" | "de" | "both";
  tone: string;
  length: "short" | "medium" | "long";
  product?: string;
  promotion?: string;
  publishDate?: string;
  location?: string;
  callToAction?: string;
  extraNotes?: string;
  variantCount: number;
};

export async function generateContent(actor: Actor, brief: ContentBrief) {
  const brand = await loadBrandContext(actor.organizationId);
  return runAiTask({
    prompt: "content",
    schema: contentResultSchema,
    organizationId: actor.organizationId,
    userId: actor.userId,
    effort: "medium",
    input: { task: "Viết nội dung marketing", brand, brief },
  });
}

export async function generateStrategy(actor: Actor, notes?: string) {
  const brand = await loadBrandContext(actor.organizationId);
  return runAiTask({
    prompt: "strategy",
    schema: strategyResultSchema,
    organizationId: actor.organizationId,
    userId: actor.userId,
    effort: "high",
    input: { task: "Xây dựng chiến lược marketing 3 tháng", brand, notes: notes ?? null },
  });
}

export type CalendarBrief = {
  startDate: string;
  days: 7 | 30;
  postsPerWeek: number;
  channels: string[];
  goals: string[];
  recentTopics: string[];
  promotions?: string;
};

export async function generateCalendar(actor: Actor, brief: CalendarBrief) {
  const brand = await loadBrandContext(actor.organizationId);
  return runAiTask({
    prompt: "calendar",
    schema: calendarResultSchema,
    organizationId: actor.organizationId,
    userId: actor.userId,
    effort: "high",
    input: { task: "Lập lịch nội dung", brand, brief },
  });
}

export async function draftReviewReply(
  actor: Actor,
  review: { authorName: string; rating: number; body: string | null; language: string; source: string },
) {
  const brand = await loadBrandContext(actor.organizationId);
  return runAiTask({
    prompt: "reviewReply",
    schema: replyResultSchema,
    organizationId: actor.organizationId,
    userId: actor.userId,
    effort: "low",
    input: { task: "Soạn phản hồi đánh giá", brand, review },
  });
}

export async function draftCustomerReply(
  actor: Actor,
  conversation: { channel: string; contactName: string; language: string; messages: { direction: string; body: string }[] },
) {
  const brand = await loadBrandContext(actor.organizationId);
  return runAiTask({
    prompt: "customerReply",
    schema: replyResultSchema,
    organizationId: actor.organizationId,
    userId: actor.userId,
    effort: "low",
    input: { task: "Soạn nháp trả lời khách hàng", brand, conversation },
  });
}

export async function summarizeConversation(
  actor: Actor,
  conversation: { channel: string; contactName: string; messages: { direction: string; body: string }[] },
) {
  return runAiTask({
    prompt: "conversationSummary",
    schema: conversationSummarySchema,
    organizationId: actor.organizationId,
    userId: actor.userId,
    effort: "low",
    input: { task: "Tóm tắt hội thoại", conversation },
  });
}

export type WorkspaceSnapshot = {
  date: string;
  publishedLast7Days: number;
  waitingApproval: number;
  scheduledThisWeek: number;
  unreadConversations: number;
  newCustomers30Days: number;
  newReviews7Days: number;
  averageRating: number | null;
  negativeReviewsOpen: number;
  runningCampaigns: number;
  newLeads: number;
  overdueFollowUps: number;
};

export async function buildDailyBrief(actor: Actor, snapshot: WorkspaceSnapshot) {
  const brand = await loadBrandContext(actor.organizationId);
  return runAiTask({
    prompt: "dailyBrief",
    schema: dailyBriefSchema,
    organizationId: actor.organizationId,
    userId: actor.userId,
    effort: "low",
    input: { task: "Hôm nay cần làm gì", brand, snapshot },
  });
}

export async function summarizeAnalytics(actor: Actor, report: Record<string, unknown>) {
  const brand = await loadBrandContext(actor.organizationId);
  return runAiTask({
    prompt: "analyticsSummary",
    schema: analyticsSummarySchema,
    organizationId: actor.organizationId,
    userId: actor.userId,
    effort: "medium",
    input: { task: "Diễn giải báo cáo marketing", brand, report },
  });
}
