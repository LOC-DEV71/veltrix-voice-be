const PageContent = require('../../models/pageContentModel');

const LANDING_DEFAULT_TRANSLATIONS = {
    vi: {
        navHome: 'Trang chủ',
        navDashboard: 'Dashboard',
        navFeatures: 'Tính năng',
        navVoices: 'Giọng đọc AI',
        navPricing: 'Bảng giá',
        navFaq: 'Hỏi đáp',
        navDonate: 'Donate Cà Phê ☕',
        navStudio: 'Vào Studio 🚀',
        navLogout: 'Đăng xuất',
        heroBadge: 'Công Nghệ Chuyển Văn Bản Thành Giọng Nói AI Đỉnh Cao',
        heroTitle: 'Tạo Giọng Đọc AI',
        heroTitleHl1: 'Sống Động',
        heroTitleHl2: 'Tự Nhiên Như Người Thật',
        heroSubtitle: 'Nền tảng Veltrix Voice giúp bạn biến mọi văn bản thành file âm thanh MP3 chất lượng cao chỉ trong vài giây. Phù hợp làm video YouTube, TikTok, Đọc sách nói & Quảng cáo.',
        heroCtaMain: 'Dùng Thử Ngay Bây Giờ',
        heroCtaSecondary: 'Nghe Mẫu Giọng Đọc',
        featuresTag: 'TÍNH NĂNG VƯỢT TRỘI',
        featuresTitle: 'Tại Sao Nên Chọn Veltrix Voice?',
        card1Title: 'Giọng Đọc Neural AI',
        card1Desc: 'Mô hình học sâu tiên tiến phát âm chuẩn ngắt nghỉ, giữ ngữ điệu cảm xúc tự nhiên 99% như giọng người thật.',
        card2Title: 'Xử Lý Siêu Tốc',
        card2Desc: 'Hệ thống Server Cloud mạnh mẽ giúp chuyển đổi văn bản 1,000 ký tự thành MP3 chỉ trong chưa đầy 2 giây.',
        card3Title: 'Bản Quyền Thương Mại',
        card3Desc: 'Sử dụng file MP3 tạo ra cho các dự án kiếm tiền YouTube, TikTok Ads mà không lo bị vi phạm bản quyền.',
        voicesTitle: 'Khám Phá Các Giọng Đọc Đầy Cảm Xúc',
        pricingTag: 'BẢNG GIÁ MINH BẠCH',
        pricingTitle: 'Lựa Chọn Gói Phù Hợp Với Bạn',
        faqTag: 'GIẢI ĐÁP THẮC MẮC',
        faqTitle: 'Câu Hỏi Thường Gặp (FAQ)',
        faqs: [
            {
                q: 'Giọng đọc AI tại đây có bản quyền không?',
                a: 'Tất cả các file âm thanh được tạo ra tại Veltrix Voice đều thuộc quyền sở hữu của bạn. Bạn hoàn toàn có thể sử dụng làm video thương mại trên YouTube, TikTok, Facebook mà không lo vi phạm bản quyền.'
            },
            {
                q: 'Cách tính hạn mức sử dụng như thế nào?',
                a: 'Mỗi tài khoản miễn phí sẽ được cấp hạn mức 2,000 ký tự mỗi ngày. Hạn mức sẽ tự động được làm mới lại 2,000 ký tự vào 00:00 đêm hàng ngày.'
            }
        ],
        footer: '© 2026 Veltrix Voice Platform. Tất cả quyền được bảo lưu.'
    },
    en: {
        navHome: 'Home',
        navDashboard: 'Dashboard',
        navFeatures: 'Features',
        navVoices: 'AI Voices',
        navPricing: 'Pricing',
        navFaq: 'FAQ',
        navDonate: 'Buy me a Coffee ☕',
        navStudio: 'Try Studio 🚀',
        navLogout: 'Logout',
        heroBadge: 'Top-tier AI Text-to-Speech Technology',
        heroTitle: 'Create AI Voices',
        heroTitleHl1: 'Vivid',
        heroTitleHl2: 'Natural as Human',
        heroSubtitle: 'Veltrix Voice platform helps you turn any text into high-quality MP3 audio in seconds.',
        heroCtaMain: 'Try It Now',
        heroCtaSecondary: 'Listen to Samples',
        featuresTag: 'OUTSTANDING FEATURES',
        featuresTitle: 'Why Choose Veltrix Voice?',
        card1Title: 'Neural AI Voices',
        card1Desc: 'Advanced deep learning models pronounce accurately with pauses, maintaining 99% natural emotional intonation like human voices.',
        card2Title: 'Lightning Fast',
        card2Desc: 'Powerful Cloud Server system converts 1,000 characters of text into MP3 in less than 2 seconds.',
        card3Title: 'Commercial Rights',
        card3Desc: 'Use the generated MP3 files for monetized YouTube and TikTok Ads projects without worrying about copyright infringement.',
        voicesTitle: 'Discover Emotional AI Voices',
        pricingTag: 'TRANSPARENT PRICING',
        pricingTitle: 'Choose The Right Plan For You',
        faqTag: 'FREQUENTLY ASKED QUESTIONS',
        faqTitle: 'Frequently Asked Questions (FAQ)',
        faqs: [
            {
                q: 'Are AI generated voices royalty-free?',
                a: 'All audio files generated on Veltrix Voice belong entirely to you. You can use them freely on commercial videos for YouTube, TikTok, Facebook without copyright issues.'
            },
            {
                q: 'How does the daily character limit work?',
                a: 'Every free account is granted 2,000 characters daily. The character limit is automatically reset to 00:00 UTC daily.'
            }
        ],
        footer: '© 2026 Veltrix Voice Platform. All rights reserved.'
    }
};

const PRICING_DEFAULT_TRANSLATIONS = {
    vi: {
        navHome: 'Trang chủ',
        navDashboard: 'Dashboard',
        navFeatures: 'Tính năng',
        navVoices: 'Giọng đọc AI',
        navPricing: 'Bảng giá',
        navFaq: 'Hỏi đáp',
        navDonate: 'Donate Cà Phê ☕',
        navStudio: 'Vào Studio 🚀',
        navLogout: 'Đăng xuất',
        heroTitle: 'Nâng cấp để làm nhiều hơn',
        heroTitleHl1: 'làm nhiều hơn',
        heroSubtitle: 'Chọn gói dịch vụ phù hợp để tối ưu hóa quy trình sản xuất nội dung của bạn với công nghệ AI hàng đầu.',
        cycleMonthly: 'Theo tháng',
        cycleYearly: 'Theo năm',
        discountBadge: 'Tiết kiệm đến 70%',
        faqTitle: 'Câu hỏi thường gặp',
        faqs: [
            {
                q: 'Tôi có thể hủy gói đăng ký bất cứ lúc nào không?',
                a: 'Có, bạn có thể hủy gói đăng ký bất cứ lúc nào trong phần cài đặt tài khoản. Sau khi hủy, bạn vẫn có quyền truy cập vào các tính năng Pro cho đến hết chu kỳ thanh toán hiện tại.'
            },
            {
                q: 'Phút / Ký tự lượt đọc có được cộng dồn sang tháng sau không?',
                a: 'Hạn mức Token của các gói trả phí sẽ được làm mới hàng tháng và không cộng dồn. Với gói Miễn Phí, hạn mức 2,000 ký tự sẽ được tự động làm mới vào 00:00 đêm mỗi ngày.'
            },
            {
                q: 'Chính sách hoàn tiền của Veltrix Voice như thế nào?',
                a: 'Chúng tôi hỗ trợ hoàn tiền 100% trong vòng 7 ngày đầu tiên nếu bạn không hài lòng với chất lượng dịch vụ và chưa sử dụng quá 10% hạn mức Token của gói.'
            },
            {
                q: 'Tôi có thể xuất file dưới định dạng nào?',
                a: 'Tất cả các gói đều hỗ trợ xuất file định dạng âm thanh MP3 chuẩn HD sắc nét (up to 320kbps) và file nén ZIP cho bài đọc dài.'
            }
        ],
        footer: '© 2026 Veltrix Voice Platform. Tất cả quyền được bảo lưu.'
    },
    en: {
        navHome: 'Home',
        navDashboard: 'Dashboard',
        navFeatures: 'Features',
        navVoices: 'AI Voices',
        navPricing: 'Pricing',
        navFaq: 'FAQ',
        navDonate: 'Buy me a Coffee ☕',
        navStudio: 'Try Studio 🚀',
        navLogout: 'Logout',
        heroTitle: 'Upgrade to do more',
        heroTitleHl1: 'do more',
        heroSubtitle: 'Choose the right plan to optimize your content production workflow with leading AI technology.',
        cycleMonthly: 'Monthly',
        cycleYearly: 'Yearly',
        discountBadge: 'Save up to 70%',
        faqTitle: 'Frequently Asked Questions',
        faqs: [
            {
                q: 'Can I cancel my subscription at any time?',
                a: 'Yes, you can cancel your subscription anytime in your account settings. After cancellation, you still have access to Pro features until the end of the current billing cycle.'
            },
            {
                q: 'Do unused tokens roll over to the next month?',
                a: 'Token quotas for paid plans are refreshed monthly and do not roll over. For the Free plan, the 2,000 character limit is automatically refreshed at 00:00 every day.'
            },
            {
                q: 'What is the refund policy?',
                a: 'We offer a 100% refund within the first 7 days if you are not satisfied with the service quality and have not used more than 10% of your plan token quota.'
            },
            {
                q: 'What file formats can I export?',
                a: 'All plans support exporting HD MP3 audio files (up to 320kbps) and ZIP compressed files for long readings.'
            }
        ],
        footer: '© 2026 Veltrix Voice Platform. All rights reserved.'
    }
};

const STUDIO_DEFAULT_TRANSLATIONS = {
    vi: {
        hubTitle: 'Developer Integration Hub & Web SDK',
        hubSubtitle: 'Tích hợp trực tiếp công cụ tạo giọng đọc AI Veltrix Voice vào Website, Blog, CMS (WordPress) hoặc App của bạn với 1 dòng mã.',
        createKeyBtn: 'Tạo API Key Mới',
        noKeysTitle: 'Chưa có API Key nào được khởi tạo',
        noKeysDesc: 'Khởi tạo API Key để cấp quyền truy cập dịch vụ giọng đọc AI cho các website và ứng dụng của bạn.',
        tabCdn: 'Tích hợp CDN Script',
        tabJs: 'Khởi tạo JS SDK',
        tabRest: 'Gọi REST API Direct',
        subHistoryTitle: 'Lịch Sử Gói Cước & Nạp Hạn Mức',
        audioHistoryTitle: 'Lịch Sử Bài Đọc MP3'
    },
    en: {
        hubTitle: 'Developer Integration Hub & Web SDK',
        hubSubtitle: 'Integrate Veltrix Voice AI Text-to-Speech tool into your Website, Blog, CMS (WordPress) or App with a single line of code.',
        createKeyBtn: 'Create New API Key',
        noKeysTitle: 'No API Keys Created Yet',
        noKeysDesc: 'Create an API Key to grant access to AI voice synthesis services for your websites and applications.',
        tabCdn: 'CDN Script Integration',
        tabJs: 'JS SDK Initialization',
        tabRest: 'Call REST API Direct',
        subHistoryTitle: 'Subscription & Quota History',
        audioHistoryTitle: 'MP3 Audio History'
    }
};

class PageAdminController {
    // Lấy nội dung trang theo slug ('landing' | 'pricing' | 'studio')
    static async getPageContent(req, res) {
        try {
            const { slug } = req.params;
            const targetSlug = slug || 'landing';
            let defaultTranslations = LANDING_DEFAULT_TRANSLATIONS;
            if (targetSlug === 'pricing') defaultTranslations = PRICING_DEFAULT_TRANSLATIONS;
            if (targetSlug === 'studio') defaultTranslations = STUDIO_DEFAULT_TRANSLATIONS;

            let page = await PageContent.findOne({ slug: targetSlug });
            
            if (!page) {
                page = new PageContent({ slug: targetSlug, translations: defaultTranslations });
                await page.save();
            } else {
                let translationsObj = page.translations ? (page.translations instanceof Map ? Object.fromEntries(page.translations) : page.translations) : {};
                Object.keys(defaultTranslations).forEach(lang => {
                    if (!translationsObj[lang]) {
                        translationsObj[lang] = defaultTranslations[lang];
                    } else {
                        translationsObj[lang] = {
                            ...defaultTranslations[lang],
                            ...translationsObj[lang]
                        };
                    }
                });
                page.translations = translationsObj;
            }

            return res.json({ success: true, page });
        } catch (err) {
            return res.status(500).json({ error: 'Lỗi lấy nội dung trang: ' + err.message });
        }
    }

    // Cập nhật nội dung trang theo slug
    static async updatePageContent(req, res) {
        try {
            const { slug } = req.params;
            const targetSlug = slug || 'landing';
            let page = await PageContent.findOne({ slug: targetSlug });
            if (!page) {
                page = new PageContent({ slug: targetSlug });
            }

            if (req.body.translations) {
                page.translations = req.body.translations;
            }

            const allowedFields = Object.keys(PageContent.schema.paths);
            allowedFields.forEach(field => {
                if (req.body[field] !== undefined && field !== '_id' && field !== 'slug' && field !== 'translations') {
                    page[field] = req.body[field];
                }
            });

            await page.save();
            return res.json({ success: true, message: `Cập nhật nội dung trang [${targetSlug}] thành công!`, page });
        } catch (err) {
            return res.status(500).json({ error: 'Lỗi cập nhật nội dung trang: ' + err.message });
        }
    }
}

module.exports = PageAdminController;
