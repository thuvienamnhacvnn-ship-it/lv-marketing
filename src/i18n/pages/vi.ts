/**
 * Nội dung các trang phụ. Tách khỏi `dictionaries/vi.ts` để mỗi file không quá dài.
 * File tiếng Việt là nguồn chuẩn về cấu trúc — `pages/de.ts` phải khớp shape này.
 */
export const pagesVi = {
  solutions: {
    eyebrow: "Giải pháp",
    title: "Chín giải pháp, một nền tảng.",
    titleAccent: "một nền tảng",
    lead: "Bạn không phải mua từng công cụ rời rạc. Tất cả nằm trong cùng một workspace, dùng chung dữ liệu thương hiệu và khách hàng.",
    ctaTitle: "Chưa rõ nên bắt đầu từ đâu?",
    ctaText: "Gửi thông tin doanh nghiệp, đội ngũ LV GROUP sẽ đề xuất đúng nhóm giải pháp cho ngành của bạn.",
  },

  industries: {
    eyebrow: "Ngành nghề",
    title: "Cấu hình sẵn theo đặc thù từng ngành.",
    titleAccent: "từng ngành",
    lead: "Chu kỳ chăm sóc khách, giọng nội dung, mẫu chiến dịch và chỉ số theo dõi đều khác nhau giữa nhà hàng, tiệm nail và spa.",
    featureTitle: "Có sẵn trong workspace",
  },

  features: {
    eyebrow: "Tính năng",
    title: "Mười bảy module vận hành marketing hằng ngày.",
    titleAccent: "vận hành marketing",
    lead: "Từ khai báo thương hiệu tới báo cáo cuối tháng. Mỗi module dùng chung dữ liệu, không phải nhập lại.",
    groups: [
      {
        name: "Nội dung",
        items: [
          { name: "AI Strategy", text: "Claude phân tích doanh nghiệp và đề xuất content pillar, mục tiêu, chiến dịch theo mùa." },
          { name: "AI Content Studio", text: "Sinh caption, script TikTok, bài blog, tin nhắn WhatsApp. Nhiều phương án, rewrite, dịch VN/DE." },
          { name: "Content Calendar", text: "Lịch tháng, tuần, danh sách, kanban. Kéo thả, trạng thái duyệt, AI tự lập lịch 7 hoặc 30 ngày." },
          { name: "Publishing Center", text: "Chọn nhiều kênh, xem trước theo từng nền tảng, đặt lịch theo giờ Berlin, nhật ký đăng bài." },
          { name: "Asset Library", text: "Thư mục, thẻ, tìm kiếm, theo dõi lượt dùng. Logo, ảnh món, mẫu nail, video, menu, bảng giá." },
        ],
      },
      {
        name: "Khách hàng",
        items: [
          { name: "Customer Inbox", text: "Facebook, Instagram, WhatsApp, chat web, form liên hệ gom về một hộp thư. AI tóm tắt và gợi ý trả lời." },
          { name: "CRM & Lead Pipeline", text: "Bảy giai đoạn từ khách mới tới chốt đơn. Người phụ trách, lịch hẹn, giá trị dự kiến, consent." },
          { name: "Review Management", text: "Tổng hợp đánh giá, phân tích cảm xúc, cảnh báo review tiêu cực, tạo QR mời đánh giá." },
          { name: "Automations", text: "Trigger theo hành vi khách. Có consent, opt-out, audit log, chạy thử trước khi bật." },
          { name: "Loyalty & Promotion", text: "Điểm thưởng, QR thành viên, voucher, quà sinh nhật, giới thiệu bạn bè." },
        ],
      },
      {
        name: "Kênh và đo lường",
        items: [
          { name: "Social Channels", text: "Kết nối OAuth, theo dõi trạng thái token, cảnh báo khi sắp hết hạn hoặc thiếu quyền." },
          { name: "Campaign Builder", text: "Mười bốn mẫu chiến dịch. Mục tiêu, đối tượng, ngân sách, KPI, landing page." },
          { name: "Landing Pages", text: "Mẫu theo ngành. AI viết headline, nội dung, FAQ và SEO metadata." },
          { name: "Analytics", text: "Reach, tương tác, lead, booking, doanh thu quy đổi. Báo cáo bằng ngôn ngữ tự nhiên." },
        ],
      },
      {
        name: "Doanh nghiệp",
        items: [
          { name: "Brand Workspace", text: "Logo, màu, font, tone of voice, dịch vụ, USP, từ cấm. Hỗ trợ nhiều chi nhánh." },
          { name: "LV Services", text: "Đặt dịch vụ thiết kế, chụp ảnh, in ấn, thi công ngay trong dashboard." },
          { name: "Team & phân quyền", text: "Mười vai trò từ chủ doanh nghiệp tới người chỉ xem báo cáo." },
        ],
      },
    ],
  },

  pricing: {
    eyebrow: "Bảng giá",
    title: "Trả theo quy mô thật của bạn.",
    titleAccent: "quy mô thật",
    lead: "Chúng tôi không niêm yết giá cố định vì chi phí phụ thuộc số thương hiệu, số kênh và mức độ đội ngũ LV GROUP tham gia.",
    faqTitle: "Câu hỏi thường gặp",
    faq: [
      {
        q: "Vì sao không có giá niêm yết?",
        a: "Một tiệm nail một chi nhánh và một chuỗi nhà hàng ba cơ sở có khối lượng công việc rất khác nhau. Báo giá theo nhu cầu thật công bằng hơn cho cả hai phía.",
      },
      {
        q: "Có phải ký hợp đồng dài hạn không?",
        a: "Không bắt buộc. Chúng tôi khuyến nghị chạy thử ba tháng vì marketing cần thời gian mới thấy kết quả, nhưng bạn có thể dừng bất cứ lúc nào.",
      },
      {
        q: "Chi phí quảng cáo có nằm trong gói không?",
        a: "Không. Ngân sách quảng cáo trả trực tiếp cho Meta hoặc Google. Gói dịch vụ chỉ tính phần nền tảng và công đội ngũ.",
      },
      {
        q: "Tôi đã có website rồi thì sao?",
        a: "Vẫn dùng được. Nền tảng kết nối với website hiện có qua form và mã theo dõi, không bắt bạn làm lại từ đầu.",
      },
      {
        q: "Dữ liệu khách hàng của tôi có bị dùng chung không?",
        a: "Không. Mỗi doanh nghiệp có workspace riêng, dữ liệu tách biệt hoàn toàn ở tầng cơ sở dữ liệu.",
      },
    ],
  },

  projects: {
    eyebrow: "Dự án",
    title: "Từ mặt bằng trống tới quán đông khách.",
    titleAccent: "quán đông khách",
    lead: "LV GROUP làm phần thi công và nhận diện trước, phần marketing tiếp nối. Dưới đây là các nhóm dự án đã thực hiện.",
    disclaimer:
      "Ảnh minh hoạ đang dùng ảnh tư liệu. Ảnh dự án thật sẽ được cập nhật sau khi có xác nhận của chủ đầu tư.",
    groups: [
      {
        name: "Nhà hàng",
        text: "Thi công trọn gói, biển hiệu, menu, bộ ảnh món và vận hành kênh social.",
        items: ["Thiết kế và thi công không gian", "Biển hiệu mặt tiền", "Menu in và menu digital", "Bộ ảnh món ăn", "Vận hành Facebook và Instagram"],
      },
      {
        name: "Tiệm nail",
        text: "Cải tạo không gian, nhận diện thương hiệu và chương trình giữ khách cũ.",
        items: ["Cải tạo nội thất", "Bộ nhận diện", "Bảng giá dịch vụ", "Gallery mẫu nail", "Nhắc lịch tự động"],
      },
      {
        name: "Spa và thẩm mỹ",
        text: "Không gian trị liệu, ấn phẩm dịch vụ và quy trình chăm sóc khách sau liệu trình.",
        items: ["Thi công phòng trị liệu", "Ấn phẩm gói dịch vụ", "Voucher và thẻ thành viên", "Quy trình nhắc tái khám", "Quản lý đánh giá Google"],
      },
      {
        name: "Showroom và bán lẻ",
        text: "Trưng bày vật liệu, landing page bộ sưu tập và thu thập lead dự án.",
        items: ["Thiết kế khu trưng bày", "Cung cấp vật liệu trang trí", "Landing page bộ sưu tập", "Form yêu cầu báo giá", "CRM theo dõi lead"],
      },
    ],
  },

  about: {
    eyebrow: "Về chúng tôi",
    title: "Chúng tôi bắt đầu từ công trường, không phải từ agency.",
    titleAccent: "từ công trường",
    lead: "LV GROUP làm đấu thầu xây dựng, thi công nội thất và tổng kho vật liệu tại Berlin. Trong nhiều năm làm việc với chủ nhà hàng, tiệm nail và spa, chúng tôi thấy cùng một vấn đề lặp lại.",
    storyTitle: "Vì sao có LV Marketing Hub",
    story: [
      "Khách hàng của chúng tôi đầu tư rất nhiều tiền vào mặt bằng, nội thất và biển hiệu. Nhưng sau ngày khai trương, việc marketing thường dừng lại ở vài bài đăng rời rạc rồi bỏ dở vì không có thời gian và không biết viết gì.",
      "Chúng tôi thử làm marketing thủ công cho vài khách quen. Kết quả tốt nhưng không nhân rộng được — mỗi quán cần nội dung riêng, ngôn ngữ riêng, chu kỳ chăm sóc khách riêng.",
      "LV Marketing Hub sinh ra để giải quyết đúng chỗ nghẽn đó: phần lặp đi lặp lại thì để hệ thống làm, phần cần con người thì đội ngũ LV GROUP làm.",
    ],
    valuesTitle: "Cách chúng tôi làm việc",
    values: [
      { name: "Nói thật về số liệu", text: "Số nào là dữ liệu demo, chúng tôi ghi rõ là demo. Không tô vẽ kết quả." },
      { name: "Không khoá chân khách", text: "Bạn sở hữu dữ liệu, tài khoản và nội dung của mình. Muốn dừng thì xuất dữ liệu mang đi." },
      { name: "Làm được rồi mới hứa", text: "Tính năng chưa chạy thật thì ghi là chưa có, không đưa vào bảng bán hàng." },
      { name: "Hiểu cả hai phía", text: "Chủ doanh nghiệp nói tiếng Việt, khách hàng cuối nói tiếng Đức. Chúng tôi làm việc được cả hai." },
    ],
    factsTitle: "Thông tin công ty",
  },

  contact: {
    eyebrow: "Liên hệ",
    title: "Kể cho chúng tôi về quán của bạn.",
    titleAccent: "quán của bạn",
    lead: "Điền thông tin bên dưới hoặc gọi trực tiếp. Chúng tôi phản hồi trong vòng một ngày làm việc.",
    formTitle: "Gửi yêu cầu tư vấn",
    fields: {
      name: "Họ và tên",
      business: "Tên doanh nghiệp",
      industry: "Ngành nghề",
      email: "Email",
      phone: "Số điện thoại",
      message: "Bạn đang cần gì?",
      messagePlaceholder: "Ví dụ: quán mở tháng sau, cần biển hiệu, menu và chạy Instagram.",
    },
    industries: ["Nhà hàng", "Tiệm nail", "Spa và thẩm mỹ", "Café", "Cửa hàng bán lẻ", "Showroom", "Khác"],
    submit: "Gửi yêu cầu",
    submitting: "Đang gửi",
    successTitle: "Đã nhận được yêu cầu",
    successText: "Chúng tôi sẽ liên hệ trong vòng một ngày làm việc. Nếu gấp, gọi thẳng số bên cạnh.",
    errorTitle: "Chưa gửi được",
    errorText: "Vui lòng thử lại, hoặc gọi trực tiếp số bên cạnh — chúng tôi luôn nghe máy trong giờ làm việc.",
    directTitle: "Liên hệ trực tiếp",
    hoursTitle: "Giờ làm việc",
    hours: ["Thứ Hai – Thứ Sáu: 09:00 – 18:00", "Thứ Bảy: 10:00 – 15:00", "Chủ Nhật: nghỉ"],
    consent: "Tôi đồng ý cho LV GROUP lưu và dùng thông tin này để liên hệ tư vấn.",
  },

  legal: {
    reviewNotice:
      "Nội dung pháp lý dưới đây là bản dự thảo phục vụ giai đoạn phát triển. Trước khi đưa website vào vận hành thật, cần luật sư tại Đức rà soát và bổ sung thông tin đăng ký doanh nghiệp.",
    privacy: {
      eyebrow: "Pháp lý",
      title: "Chính sách bảo mật",
      updated: "Cập nhật lần cuối",
      sections: [
        {
          h: "1. Đơn vị chịu trách nhiệm",
          p: "LV GROUP, Berlin, Cộng hoà Liên bang Đức. Liên hệ về dữ liệu qua số điện thoại và email ghi ở phần Impressum.",
        },
        {
          h: "2. Dữ liệu chúng tôi xử lý",
          p: "Thông tin bạn chủ động gửi qua form liên hệ (tên, doanh nghiệp, email, điện thoại, nội dung). Với khách hàng đang dùng nền tảng: dữ liệu thương hiệu, nội dung marketing, thông tin khách hàng của chính bạn nhập vào hệ thống.",
        },
        {
          h: "3. Mục đích và cơ sở pháp lý",
          p: "Xử lý để phản hồi yêu cầu tư vấn và thực hiện hợp đồng dịch vụ, theo Điều 6(1)(b) GDPR. Với hoạt động marketing gửi tới bạn, cơ sở là sự đồng ý theo Điều 6(1)(a) GDPR và bạn có thể rút lại bất cứ lúc nào.",
        },
        {
          h: "4. Thời gian lưu trữ",
          p: "Dữ liệu liên hệ được lưu tối đa hai mươi bốn tháng kể từ lần trao đổi cuối, trừ khi nghĩa vụ kế toán tại Đức yêu cầu lưu lâu hơn.",
        },
        {
          h: "5. Bên xử lý dữ liệu thay mặt chúng tôi",
          p: "Hạ tầng máy chủ và cơ sở dữ liệu; dịch vụ mô hình ngôn ngữ của Anthropic dùng để tạo và phân tích nội dung marketing. Chúng tôi ký hợp đồng xử lý dữ liệu với các bên này.",
        },
        {
          h: "6. Nội dung do AI tạo ra",
          p: "Nội dung marketing bạn nhập có thể được gửi tới mô hình ngôn ngữ để sinh bản nháp. Không gửi dữ liệu định danh khách hàng cuối trừ khi bạn chủ động đưa vào. Mọi bản nháp đều cần người duyệt trước khi đăng.",
        },
        {
          h: "7. Quyền của bạn",
          p: "Bạn có quyền truy cập, chỉnh sửa, xoá, hạn chế xử lý, phản đối và mang dữ liệu đi nơi khác theo Điều 15–21 GDPR. Bạn cũng có quyền khiếu nại với cơ quan bảo vệ dữ liệu tại Đức.",
        },
        {
          h: "8. Cookie",
          p: "Website dùng cookie kỹ thuật để ghi nhớ ngôn ngữ và giao diện bạn chọn. Không dùng cookie theo dõi quảng cáo khi chưa có sự đồng ý của bạn.",
        },
      ],
    },
    terms: {
      eyebrow: "Pháp lý",
      title: "Điều khoản sử dụng",
      updated: "Cập nhật lần cuối",
      sections: [
        { h: "1. Phạm vi", p: "Điều khoản này áp dụng cho việc sử dụng nền tảng LV Marketing Hub và các dịch vụ đi kèm do LV GROUP cung cấp." },
        { h: "2. Tài khoản", p: "Bạn chịu trách nhiệm bảo mật thông tin đăng nhập và mọi hoạt động phát sinh dưới tài khoản của mình. Thông báo cho chúng tôi ngay khi nghi ngờ bị truy cập trái phép." },
        { h: "3. Nội dung của bạn", p: "Bạn giữ toàn bộ quyền với nội dung, hình ảnh và dữ liệu khách hàng bạn đưa lên. Bạn cấp cho chúng tôi quyền xử lý kỹ thuật cần thiết để vận hành dịch vụ." },
        { h: "4. Nội dung do AI tạo ra", p: "Bản nháp do AI sinh ra là gợi ý, không phải nội dung đã kiểm duyệt. Bạn chịu trách nhiệm rà soát trước khi đăng, đặc biệt với thông tin giá, thành phần món ăn, dị ứng và các tuyên bố về hiệu quả dịch vụ." },
        { h: "5. Kết nối kênh bên thứ ba", p: "Việc đăng bài lên Facebook, Instagram, TikTok, Google phụ thuộc API chính thức của các nền tảng đó và chính sách của họ. Chúng tôi không bảo đảm tính khả dụng liên tục của các kết nối này." },
        { h: "6. Hành vi bị cấm", p: "Không dùng nền tảng để gửi thư rác, quảng cáo sai sự thật, nội dung vi phạm pháp luật Đức hoặc xâm phạm quyền của bên thứ ba." },
        { h: "7. Giới hạn trách nhiệm", p: "Chúng tôi chịu trách nhiệm theo quy định pháp luật đối với thiệt hại do cố ý hoặc sơ suất nghiêm trọng. Với sơ suất thông thường, trách nhiệm giới hạn ở thiệt hại điển hình và có thể lường trước." },
        { h: "8. Chấm dứt", p: "Hai bên có thể chấm dứt theo thời hạn thoả thuận trong hợp đồng dịch vụ. Sau khi chấm dứt, bạn có ba mươi ngày để xuất dữ liệu của mình." },
        { h: "9. Luật áp dụng", p: "Áp dụng pháp luật Cộng hoà Liên bang Đức. Nơi giải quyết tranh chấp là Berlin, trong phạm vi pháp luật cho phép thoả thuận." },
      ],
    },
    imprint: {
      eyebrow: "Pháp lý",
      title: "Impressum",
      intro: "Thông tin bắt buộc theo § 5 TMG (Luật Truyền thông điện tử Đức).",
      pendingLabel: "Cần bổ sung trước khi vận hành",
      pending: [
        "Tên pháp lý đầy đủ và loại hình công ty",
        "Địa chỉ đăng ký kinh doanh",
        "Toà án đăng ký và số đăng ký thương mại (Handelsregister)",
        "Mã số thuế giá trị gia tăng (USt-IdNr.) theo § 27a UStG",
        "Người đại diện theo pháp luật",
        "Người chịu trách nhiệm nội dung theo § 18 Abs. 2 MStV",
      ],
      disputeTitle: "Giải quyết tranh chấp trực tuyến",
      disputeText:
        "Uỷ ban châu Âu cung cấp nền tảng giải quyết tranh chấp trực tuyến. Chúng tôi không có nghĩa vụ và không tham gia thủ tục hoà giải trước ban trọng tài tiêu dùng.",
    },
  },

  auth: {
    backHome: "Về trang chủ",
    loginTitle: "Đăng nhập",
    loginLead: "Truy cập workspace marketing của doanh nghiệp bạn.",
    registerTitle: "Tạo tài khoản",
    registerLead: "Khởi tạo workspace đầu tiên. Mất khoảng hai phút.",
    name: "Họ và tên",
    email: "Email",
    password: "Mật khẩu",
    passwordHint: "Tối thiểu 8 ký tự",
    orgName: "Tên doanh nghiệp",
    industry: "Ngành nghề",
    submitLogin: "Đăng nhập",
    submitRegister: "Tạo tài khoản",
    working: "Đang xử lý",
    toRegister: "Chưa có tài khoản?",
    toRegisterLink: "Tạo tài khoản",
    toLogin: "Đã có tài khoản?",
    toLoginLink: "Đăng nhập",
    invalid: "Email hoặc mật khẩu không đúng.",
    emailTaken: "Email này đã được đăng ký.",
    genericError: "Chưa xử lý được. Vui lòng thử lại.",
    dbOffline:
      "Chưa kết nối được cơ sở dữ liệu. Kiểm tra DATABASE_URL trong .env rồi thử lại.",
    sideTitle: "Một nền tảng cho toàn bộ hoạt động marketing",
    sidePoints: [
      "Nội dung hai ngôn ngữ Việt và Đức",
      "Lịch đăng bài cho mọi kênh",
      "Hộp thư khách hàng gom về một chỗ",
      "Đặt dịch vụ LV GROUP ngay trong dashboard",
    ],
  },
};

export type PagesDictionary = typeof pagesVi;
