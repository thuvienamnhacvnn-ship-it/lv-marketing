/**
 * Dữ liệu khởi tạo cho môi trường phát triển.
 *
 * Chạy: `npm run db:seed`
 *
 * Hai phần tách bạch:
 * 1. Gói dịch vụ (`Plan`) — dữ liệu THẬT của sản phẩm, môi trường nào cũng cần.
 * 2. Một tổ chức demo kèm dữ liệu mẫu — chỉ để có cái mà nhìn khi dựng giao diện.
 *    Mọi bản ghi demo đều gắn `isDemo: true` để lọc ra được sau này.
 *
 * Toàn bộ dùng `upsert` theo khoá tự nhiên nên chạy lại nhiều lần vẫn cho cùng
 * một kết quả — không nhân bản dữ liệu.
 */
// Bắt buộc và phải đứng đầu: `tsx prisma/seed.ts` là script Node thuần, không
// đi qua Next hay prisma.config.ts nên không có ai nạp `.env` hộ.
import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import type { LeadStatus, Platform } from "../src/generated/prisma/enums";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL chưa được cấu hình — xem .env.example");
}

// Không dùng lại `src/lib/prisma.ts`: file đó có `import "server-only"` nên chỉ
// chạy được trong Next, không chạy được từ script Node thuần như seed.
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const DEMO_EMAIL = "demo@lv-groups.com";
const DEMO_PASSWORD = "demo12345";
const DEMO_SLUG = "nha-hang-sen";

/** Lùi lại `days` ngày so với bây giờ. Dữ liệu demo cần trải theo thời gian. */
function daysAgo(days: number, hour = 12): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d;
}

function daysAhead(days: number, hour = 10): Date {
  return daysAgo(-days, hour);
}

async function seedPlans() {
  const plans = [
    {
      key: "STARTER" as const,
      name: "Starter",
      description: "Dành cho tiểu thương mới bắt đầu.",
      monthlyCents: 4900,
      maxBrands: 1,
      maxChannels: 2,
      maxUsers: 2,
      aiCreditsMonth: 100,
      features: ["1 thương hiệu", "AI Content cơ bản", "Content Calendar", "2 kênh social", "Báo cáo tháng"],
      position: 0,
    },
    {
      key: "GROWTH" as const,
      name: "Growth",
      description: "Dành cho nhà hàng, nail salon và spa.",
      monthlyCents: 12900,
      maxBrands: 1,
      maxChannels: 6,
      maxUsers: 5,
      aiCreditsMonth: 500,
      features: [
        "1 thương hiệu",
        "Nhiều kênh social",
        "AI Content nâng cao",
        "CRM khách hàng",
        "Review Management",
        "Campaign Builder",
        "Booking integration",
      ],
      position: 1,
    },
    {
      key: "PRO" as const,
      name: "Pro",
      description: "Dành cho doanh nghiệp cần đội ngũ hỗ trợ.",
      monthlyCents: 29900,
      maxBrands: 3,
      maxChannels: 12,
      maxUsers: 15,
      aiCreditsMonth: 2000,
      features: [
        "Nhiều chi nhánh",
        "Approval workflow",
        "Marketing automation",
        "Advanced analytics",
        "Quản lý đội nhóm",
        "Hỗ trợ từ LV GROUP",
      ],
      position: 2,
    },
    {
      key: "ENTERPRISE" as const,
      name: "Enterprise",
      // null = báo giá theo nhu cầu, trang bảng giá hiển thị "Liên hệ" thay vì con số.
      description: "Dành cho chuỗi và hệ thống nhiều thương hiệu.",
      monthlyCents: null,
      maxBrands: 50,
      maxChannels: 100,
      maxUsers: 200,
      aiCreditsMonth: 20000,
      features: ["Tùy chỉnh hệ thống", "White-label", "API", "Nhiều thương hiệu", "SLA", "Tư vấn và triển khai riêng"],
      position: 3,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({ where: { key: plan.key }, create: plan, update: plan });
  }
  return plans.length;
}

async function seedDemoOrganization() {
  const passwordHash = await hash(DEMO_PASSWORD, 12);

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    create: {
      email: DEMO_EMAIL,
      name: "Nguyễn Văn Sen",
      passwordHash,
      systemRole: "CUSTOMER",
      locale: "vi",
    },
    // Không ghi đè `passwordHash` khi chạy lại: nếu ai đó đã đổi mật khẩu tài
    // khoản demo trên môi trường chung thì seed không được lặng lẽ đặt lại.
    update: { name: "Nguyễn Văn Sen" },
  });

  const organization = await prisma.organization.upsert({
    where: { slug: DEMO_SLUG },
    create: {
      name: "Nhà hàng Sen",
      slug: DEMO_SLUG,
      industry: "RESTAURANT",
      city: "Berlin",
      isDemo: true,
    },
    update: {},
  });

  await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: organization.id, userId: user.id } },
    create: {
      organizationId: organization.id,
      userId: user.id,
      role: "TENANT_OWNER",
      acceptedAt: new Date(),
    },
    update: {},
  });

  // Gắn gói Growth để màn hình Tổng quan có hạn mức mà hiển thị.
  const growth = await prisma.plan.findUnique({ where: { key: "GROWTH" } });
  if (growth) {
    await prisma.subscription.upsert({
      where: { organizationId: organization.id },
      create: {
        organizationId: organization.id,
        planId: growth.id,
        status: "ACTIVE",
        renewsAt: daysAhead(21),
      },
      update: {},
    });
  }

  return { user, organization };
}

async function seedBrandAndPipeline(organizationId: string) {
  const existingBrand = await prisma.brandProfile.findFirst({ where: { organizationId } });
  if (!existingBrand) {
    await prisma.brandProfile.create({
      data: {
        organizationId,
        brandName: "Nhà hàng Sen",
        primaryColor: "#ff6a1a",
        toneOfVoice: "Ấm áp, thân thiện, tự hào về ẩm thực Việt",
        addressLine: "Kantstraße 12",
        postalCode: "10623",
        city: "Berlin",
        phone: "+49 30 12345678",
        contentLanguage: "BOTH",
        services: ["Ăn tại chỗ", "Mang đi", "Đặt tiệc", "Giao hàng"],
        products: ["Phở bò", "Bún bò Huế", "Bánh mì", "Cà phê sữa đá", "Gỏi cuốn"],
        targetAudience: "Dân văn phòng và gia đình sống quanh Charlottenburg, 25–55 tuổi",
        usp: "Nước dùng ninh 12 tiếng, công thức gia truyền ba đời",
        bannedWords: ["rẻ nhất", "số 1 thế giới"],
      },
    });
  }

  const stages: { key: LeadStatus; name: string }[] = [
    { key: "NEW", name: "Khách mới" },
    { key: "CONTACTED", name: "Đã liên hệ" },
    { key: "QUALIFIED", name: "Đủ điều kiện" },
    { key: "APPOINTMENT", name: "Đã hẹn" },
    { key: "PROPOSAL", name: "Đã báo giá" },
    { key: "WON", name: "Chốt đơn" },
    { key: "LOST", name: "Không thành" },
  ];

  for (const [position, stage] of stages.entries()) {
    await prisma.pipelineStage.upsert({
      where: { organizationId_key: { organizationId, key: stage.key } },
      create: { organizationId, key: stage.key, name: stage.name, position },
      update: { name: stage.name, position },
    });
  }
}

async function seedChannels(organizationId: string) {
  const channels: { platform: Platform; name: string; handle: string; followers: number }[] = [
    { platform: "FACEBOOK", name: "Nhà hàng Sen Berlin", handle: "nhahangsen.berlin", followers: 3480 },
    { platform: "INSTAGRAM", name: "@sen.berlin", handle: "sen.berlin", followers: 5210 },
    { platform: "GOOGLE_BUSINESS", name: "Sen — Kantstraße", handle: "sen-kantstrasse", followers: 0 },
  ];

  const created = [];
  for (const channel of channels) {
    // Không có khoá tự nhiên duy nhất trên SocialChannel → tìm trước rồi mới tạo.
    const existing = await prisma.socialChannel.findFirst({
      where: { organizationId, platform: channel.platform },
    });
    created.push(
      existing ??
        (await prisma.socialChannel.create({ data: { organizationId, ...channel } })),
    );
  }
  return created;
}

async function seedContentAndPosts(
  organizationId: string,
  authorId: string,
  channelIds: string[],
) {
  if ((await prisma.contentItem.count({ where: { organizationId } })) > 0) return;

  const items = [
    { title: "Phở bò đặc biệt — món tuần này", status: "PUBLISHED" as const, type: "INSTAGRAM_CAPTION" as const, offset: -6 },
    { title: "Combo trưa 9,90 € từ thứ Hai", status: "PUBLISHED" as const, type: "FACEBOOK_POST" as const, offset: -4 },
    { title: "Bún bò Huế — cay đúng điệu", status: "PUBLISHED" as const, type: "INSTAGRAM_CAPTION" as const, offset: -2 },
    { title: "Giới thiệu món mới: Gỏi cuốn tôm thịt", status: "WAITING_APPROVAL" as const, type: "FACEBOOK_POST" as const, offset: 1 },
    { title: "Khung giờ vàng cuối tuần — đặt bàn sớm", status: "APPROVED" as const, type: "GOOGLE_BUSINESS_POST" as const, offset: 2 },
    { title: "Câu chuyện nước dùng ninh 12 tiếng", status: "SCHEDULED" as const, type: "TIKTOK_SCRIPT" as const, offset: 4 },
    { title: "Ý tưởng: menu Tết Nguyên đán", status: "IDEA" as const, type: "PROMOTION" as const, offset: 12 },
  ];

  for (const [index, item] of items.entries()) {
    const content = await prisma.contentItem.create({
      data: {
        organizationId,
        authorId,
        title: item.title,
        type: item.type,
        status: item.status,
        language: "BOTH",
        body: `${item.title}\n\nNội dung mẫu dùng để dựng giao diện. Thay bằng nội dung thật trước khi đăng.`,
        hashtags: ["#nhahangsen", "#berlin", "#amthucviet"],
        callToAction: "Đặt bàn ngay",
        targetDate: item.offset < 0 ? daysAgo(-item.offset) : daysAhead(item.offset),
      },
    });

    if (item.status === "PUBLISHED") {
      await prisma.publishedPost.create({
        data: {
          organizationId,
          contentItemId: content.id,
          channelId: channelIds[index % channelIds.length],
          publishedAt: daysAgo(-item.offset),
          reach: 1800 + index * 640,
          impressions: 2400 + index * 810,
          engagements: 120 + index * 45,
          clicks: 40 + index * 18,
          isDemo: true,
        },
      });
    }
  }
}

async function seedCrm(organizationId: string) {
  if ((await prisma.customer.count({ where: { organizationId } })) > 0) return;

  const customers = [
    { fullName: "Anna Weber", email: "anna.weber@example.de", phone: "+49 170 1234567", visits: 8 },
    { fullName: "Trần Minh", email: "tran.minh@example.com", phone: "+49 171 2345678", visits: 14 },
    { fullName: "Michael Schneider", email: "m.schneider@example.de", phone: "+49 172 3456789", visits: 3 },
    { fullName: "Lê Thu Hà", email: "le.thuha@example.com", phone: "+49 173 4567890", visits: 21 },
  ];

  for (const [index, c] of customers.entries()) {
    await prisma.customer.create({
      data: {
        organizationId,
        fullName: c.fullName,
        email: c.email,
        phone: c.phone,
        language: index % 2 === 0 ? "de" : "vi",
        marketingConsent: true,
        consentAt: daysAgo(60 - index * 5),
        lastVisitAt: daysAgo(index * 7 + 2),
        totalVisits: c.visits,
        totalSpentCents: c.visits * 2850,
      },
    });
  }

  const newStage = await prisma.pipelineStage.findUnique({
    where: { organizationId_key: { organizationId, key: "NEW" } },
  });

  const leads = [
    { fullName: "Sabine Krüger", need: "Đặt tiệc sinh nhật 20 khách", value: 68000, status: "NEW" as const },
    { fullName: "Công ty TNHH Vinaco", need: "Đặt cơm trưa văn phòng hàng tuần", value: 145000, status: "CONTACTED" as const },
    { fullName: "Thomas Bauer", need: "Tiệc công ty cuối năm 45 khách", value: 220000, status: "APPOINTMENT" as const },
  ];

  for (const [index, lead] of leads.entries()) {
    await prisma.lead.create({
      data: {
        organizationId,
        stageId: newStage?.id ?? null,
        fullName: lead.fullName,
        need: lead.need,
        source: "Google Business",
        expectedValueCents: lead.value,
        status: lead.status,
        consent: true,
        nextFollowUpAt: daysAhead(index + 1),
      },
    });
  }
}

async function seedInboxAndReviews(organizationId: string) {
  if ((await prisma.conversation.count({ where: { organizationId } })) === 0) {
    const threads = [
      { contactName: "Anna Weber", channel: "INSTAGRAM" as const, unread: 2, body: "Chào anh chị, tối thứ Bảy còn bàn cho 4 người không ạ?" },
      { contactName: "Trần Minh", channel: "WHATSAPP" as const, unread: 1, body: "Cho mình hỏi giá đặt tiệc 20 người với ạ." },
      { contactName: "Michael Schneider", channel: "FACEBOOK" as const, unread: 0, body: "Danke für das leckere Essen gestern!" },
    ];

    for (const [index, thread] of threads.entries()) {
      const conversation = await prisma.conversation.create({
        data: {
          organizationId,
          channel: thread.channel,
          status: thread.unread > 0 ? "OPEN" : "RESOLVED",
          priority: index === 0 ? "HIGH" : "NORMAL",
          contactName: thread.contactName,
          language: thread.channel === "FACEBOOK" ? "de" : "vi",
          unreadCount: thread.unread,
          lastMessageAt: daysAgo(index, 18),
        },
      });

      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          direction: "INBOUND",
          body: thread.body,
          sentAt: daysAgo(index, 18),
        },
      });
    }
  }

  if ((await prisma.review.count({ where: { organizationId } })) === 0) {
    const reviews = [
      { authorName: "Anna Weber", rating: 5, body: "Phở ngon nhất Berlin, phục vụ nhanh và thân thiện.", sentiment: "POSITIVE" as const },
      { authorName: "Michael Schneider", rating: 5, body: "Sehr authentisch, wir kommen wieder.", sentiment: "POSITIVE" as const },
      { authorName: "Julia Hoffmann", rating: 4, body: "Essen top, aber am Freitag lange Wartezeit.", sentiment: "NEUTRAL" as const },
      { authorName: "Kevin B.", rating: 2, body: "Zu laut und der Service war überfordert.", sentiment: "NEGATIVE" as const },
    ];

    for (const [index, review] of reviews.entries()) {
      await prisma.review.create({
        data: {
          organizationId,
          source: "GOOGLE",
          authorName: review.authorName,
          rating: review.rating,
          body: review.body,
          language: index === 0 ? "vi" : "de",
          sentiment: review.sentiment,
          topics: index === 3 ? ["phục vụ", "không gian"] : ["món ăn"],
          postedAt: daysAgo(index * 3 + 1),
          isDemo: true,
        },
      });
    }
  }
}

async function seedCampaigns(organizationId: string) {
  if ((await prisma.campaign.count({ where: { organizationId } })) > 0) return;

  const campaigns = [
    { name: "Combo trưa mùa hè", templateKey: "LUNCH_OFFER" as const, status: "RUNNING" as const, budget: 30000 },
    { name: "Khai trương khu vườn ngoài trời", templateKey: "GRAND_OPENING" as const, status: "COMPLETED" as const, budget: 80000 },
    { name: "Menu Tết Nguyên đán", templateKey: "SEASONAL" as const, status: "DRAFT" as const, budget: null },
  ];

  for (const [index, campaign] of campaigns.entries()) {
    const created = await prisma.campaign.create({
      data: {
        organizationId,
        name: campaign.name,
        templateKey: campaign.templateKey,
        status: campaign.status,
        objective: "Tăng lượt đặt bàn",
        budgetCents: campaign.budget,
        startsAt: daysAgo(20 - index * 6),
        endsAt: daysAhead(10 + index * 5),
      },
    });

    if (campaign.status !== "DRAFT") {
      for (let day = 1; day <= 7; day++) {
        await prisma.campaignMetric.create({
          data: {
            campaignId: created.id,
            date: daysAgo(day),
            reach: 900 + day * 120,
            impressions: 1400 + day * 190,
            clicks: 60 + day * 9,
            engagements: 95 + day * 12,
            leads: day % 3,
            bookings: day % 4,
            spendCents: 3200,
            revenueCents: 18000 + day * 2400,
          },
        });
      }
    }
  }
}

/**
 * Chương trình tích điểm mẫu.
 *
 * Mô hình lấy theo PTC-Loyalty: hạng thành viên theo điểm tích luỹ trọn đời,
 * sổ cái ghi từng lần cộng/trừ, voucher tách mẫu và bản đã phát.
 *
 * Điểm quan trọng: điểm dư của khách KHÔNG được đặt tay. Nó là kết quả cộng dồn
 * của sổ cái — đặt tay rồi sau này lệch với sổ thì không ai biết bên nào đúng.
 */
async function seedLoyalty(organizationId: string) {
  if ((await prisma.loyaltyProgram.count({ where: { organizationId } })) > 0) return;

  await prisma.loyaltyProgram.create({
    data: {
      organizationId,
      name: "Thẻ thành viên Sen",
      type: "SPEND_BASED",
      isActive: true,
      // 1 điểm cho mỗi euro, làm tròn xuống.
      config: { pointsPerEuro: 1, roundingMode: "floor" },
      rules: {
        create: [
          { name: "Tặng điểm khi đăng ký", kind: "signup", value: 50 },
          { name: "Quà sinh nhật", kind: "birthday", value: 100 },
          { name: "Giới thiệu bạn", kind: "referral", value: 75 },
          { name: "Nhân đôi điểm thứ Ba", kind: "double_points", value: 2, config: { weekday: 2 } },
        ],
      },
    },
  });

  const tierData = [
    { name: "Đồng", level: 1, minPoints: 0, pointsMultiplier: 1.0, color: "#a16207", perks: "Tích điểm mọi hoá đơn" },
    { name: "Bạc", level: 2, minPoints: 500, pointsMultiplier: 1.1, color: "#94a3b8", perks: "Ưu tiên đặt bàn cuối tuần" },
    { name: "Vàng", level: 3, minPoints: 1500, pointsMultiplier: 1.25, color: "#eab308", perks: "Món khai vị tặng kèm, sinh nhật giảm 20%" },
    { name: "Bạch kim", level: 4, minPoints: 4000, pointsMultiplier: 1.5, color: "#6366f1", perks: "Bàn riêng, đặt tiệc ưu tiên, quà cuối năm" },
  ];
  const tiers = [];
  for (const tier of tierData) {
    tiers.push(await prisma.membershipTier.create({ data: { organizationId, ...tier } }));
  }

  const rewards = [
    { name: "Cà phê sữa đá", pointsCost: 120, stock: null, description: "Đổi bất kỳ lúc nào" },
    { name: "Gỏi cuốn tôm thịt", pointsCost: 250, stock: 40, description: "Hai cuốn, dùng tại chỗ" },
    { name: "Giảm 10 € hoá đơn", pointsCost: 600, stock: null, description: "Áp dụng cho hoá đơn từ 40 €" },
    { name: "Set ăn hai người", pointsCost: 1800, stock: 10, description: "Khai vị, hai món chính, tráng miệng" },
  ];
  for (const reward of rewards) {
    await prisma.reward.create({ data: { organizationId, status: "ACTIVE", ...reward } });
  }

  const voucher = await prisma.voucher.create({
    data: {
      organizationId,
      code: "SINHNHAT20",
      title: "Giảm 20% dịp sinh nhật",
      description: "Tự phát trước sinh nhật khách 7 ngày, dùng trong 30 ngày.",
      discountType: "PERCENT",
      discountValue: 20,
      pointsCost: 0,
      perCustomerLimit: 1,
      autoBirthday: true,
      status: "ACTIVE",
      expiresAt: daysAhead(180),
    },
  });

  await prisma.voucher.create({
    data: {
      organizationId,
      code: "DOI500",
      title: "Voucher 5 € đổi bằng điểm",
      description: "Đổi 500 điểm lấy phiếu giảm 5 €.",
      discountType: "FIXED",
      discountValue: 5,
      pointsCost: 500,
      quantity: 200,
      perCustomerLimit: 4,
      status: "ACTIVE",
    },
  });

  // Bốn khách đã seed ở seedCrm. Mỗi người một mức độ gắn bó khác nhau để màn
  // hình có đủ các hạng, chứ không phải ai cũng giống ai.
  const customers = await prisma.customer.findMany({
    where: { organizationId },
    orderBy: { createdAt: "asc" },
  });

  /** Kịch bản chi tiêu: mỗi phần tử là một hoá đơn, tính bằng xu. */
  const scripts: number[][] = [
    [4200, 3800, 5600, 2900, 6100, 4400, 3200, 5900],
    [8900, 12400, 7600, 9800, 11200, 6400, 8100, 13500, 7200, 9100, 10400, 8800, 6900, 12100],
    [3400, 2800, 4100],
    [15600, 18200, 14100, 16800, 19400, 13200, 17500, 15900, 12800, 16100,
     18900, 14700, 17200, 15300, 19800, 13600, 16400, 18100, 14900, 17800, 15100],
  ];

  for (const [index, customer] of customers.entries()) {
    const invoices = scripts[index] ?? scripts[0];
    const memberCode = `SEN${String(index + 1).padStart(4, "0")}`;

    const account = await prisma.loyaltyAccount.create({
      data: {
        organizationId,
        customerId: customer.id,
        memberCode,
        joinedAt: daysAgo(120 - index * 20),
      },
    });

    let balance = 0;
    let earned = 0;
    let redeemed = 0;

    // Điểm thưởng lúc đăng ký — đúng như luật "signup" khai ở trên.
    const signup = 50;
    balance += signup;
    earned += signup;
    await prisma.pointTransaction.create({
      data: {
        organizationId,
        customerId: customer.id,
        type: "BONUS",
        points: signup,
        balanceBefore: 0,
        balanceAfter: balance,
        note: "Điểm chào mừng thành viên mới",
        createdAt: account.joinedAt,
      },
    });

    for (const [i, amountCents] of invoices.entries()) {
      const points = Math.floor(amountCents / 100);
      const before = balance;
      balance += points;
      earned += points;
      await prisma.pointTransaction.create({
        data: {
          organizationId,
          customerId: customer.id,
          type: "EARN",
          amountCents,
          points,
          balanceBefore: before,
          balanceAfter: balance,
          receiptRef: `${memberCode}-R${String(i + 1).padStart(3, "0")}`,
          createdAt: daysAgo(Math.max(1, 110 - index * 18 - i * 4)),
        },
      });
    }

    // Khách gắn bó lâu thì đã đổi quà vài lần.
    if (index === 1 || index === 3) {
      const spend = index === 3 ? 600 : 250;
      const before = balance;
      balance -= spend;
      redeemed += spend;
      await prisma.pointTransaction.create({
        data: {
          organizationId,
          customerId: customer.id,
          type: "REDEEM",
          points: -spend,
          balanceBefore: before,
          balanceAfter: balance,
          note: index === 3 ? "Đổi voucher giảm 10 €" : "Đổi gỏi cuốn tôm thịt",
          createdAt: daysAgo(6 + index),
        },
      });
    }

    // Số dư ghi vào tài khoản là KẾT QUẢ của sổ cái, không phải số đặt tay.
    await prisma.loyaltyAccount.update({
      where: { id: account.id },
      data: { points: balance, totalEarned: earned, totalRedeemed: redeemed },
    });

    // Hạng xét theo điểm tích luỹ trọn đời, không theo số dư hiện tại — khách
    // đổi quà nhiều không vì thế mà bị tụt hạng.
    const tier = [...tiers].reverse().find((t) => earned >= t.minPoints) ?? tiers[0];
    await prisma.customerMembership.create({
      data: { organizationId, customerId: customer.id, tierId: tier.id, status: "ACTIVE" },
    });

    if (index < 2) {
      await prisma.issuedVoucher.create({
        data: {
          organizationId,
          voucherId: voucher.id,
          customerId: customer.id,
          code: `${voucher.code}-${memberCode}`,
          status: index === 0 ? "ISSUED" : "REDEEMED",
          redeemedAt: index === 1 ? daysAgo(4) : null,
          expiresAt: daysAhead(30),
        },
      });
    }
  }

  await prisma.voucher.update({
    where: { id: voucher.id },
    data: { issuedCount: Math.min(2, customers.length) },
  });
}

async function main() {
  console.log("Bắt đầu seed…");

  const planCount = await seedPlans();
  console.log(`  ${planCount} gói dịch vụ`);

  const { user, organization } = await seedDemoOrganization();
  await seedBrandAndPipeline(organization.id);
  const channels = await seedChannels(organization.id);
  await seedContentAndPosts(organization.id, user.id, channels.map((c) => c.id));
  await seedCrm(organization.id);
  await seedInboxAndReviews(organization.id);
  await seedCampaigns(organization.id);
  await seedLoyalty(organization.id);

  console.log(`  tổ chức demo "${organization.name}" (/${organization.slug})`);
  console.log("");
  console.log("Tài khoản demo:");
  console.log(`  email:    ${DEMO_EMAIL}`);
  console.log(`  mật khẩu: ${DEMO_PASSWORD}`);
  console.log("");
  console.log("Xong.");
}

main()
  .catch((error) => {
    console.error("Seed thất bại:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
