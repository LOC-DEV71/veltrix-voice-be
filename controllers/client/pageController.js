const PageContent = require('../../models/pageContentModel');

const DEFAULT_TRANSLATIONS = {
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
        heroSubtitle: 'Nền tảng Veltrix Voice giúp bạn biến mọi văn bản thành file âm thanh MP3 chất lượng cao chỉ trong vài giây.',
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
        faqTag: 'GIẢI ĐÁP THẮC MẮC',
        faqTitle: 'Câu Hỏi Thường Gặp (FAQ)',
        faqs: [],
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
        faqTag: 'FREQUENTLY ASKED QUESTIONS',
        faqTitle: 'Frequently Asked Questions (FAQ)',
        faqs: [],
        footer: '© 2026 Veltrix Voice Platform. All rights reserved.'
    },
    ja: {
        navHome: 'ホーム',
        navDashboard: 'ダッシュボード',
        navFeatures: '機能',
        navVoices: 'AI音声',
        navPricing: '料金プラン',
        navFaq: 'よくある質問',
        navDonate: '寄付ボタン ☕',
        navStudio: 'Studioへ 🚀',
        navLogout: 'ログアウト'
    },
    ko: {
        navHome: '홈',
        navDashboard: '대시보드',
        navFeatures: '기능',
        navVoices: 'AI 음성',
        navPricing: '요금제',
        navFaq: '자주 묻는 질문',
        navDonate: '커피 후원 ☕',
        navStudio: '스튜디오 시작 🚀',
        navLogout: '로그아웃'
    },
    zh: {
        navHome: '首页',
        navDashboard: '仪表板',
        navFeatures: '功能特点',
        navVoices: 'AI 语音',
        navPricing: '价格方案',
        navFaq: '常见问题',
        navDonate: '赞助咖啡 ☕',
        navStudio: '进入 Studio 🚀',
        navLogout: '退出登录'
    },
    fr: {
        navHome: 'Accueil',
        navDashboard: 'Tableau de bord',
        navFeatures: 'Fonctionnalités',
        navVoices: 'Voix IA',
        navPricing: 'Tarifs',
        navFaq: 'FAQ',
        navDonate: 'Offrir un café ☕',
        navStudio: 'Lancer Studio 🚀',
        navLogout: 'Déconnexion'
    }
};

class ClientPageController {
    static async getPageContent(req, res) {
        try {
            const { slug } = req.params;
            let page = await PageContent.findOne({ slug: slug || 'landing' });
            if (!page) {
                page = await PageContent.create({ slug: slug || 'landing', translations: DEFAULT_TRANSLATIONS });
            } else {
                let translationsObj = page.translations ? (page.translations instanceof Map ? Object.fromEntries(page.translations) : page.translations) : {};
                Object.keys(DEFAULT_TRANSLATIONS).forEach(lang => {
                    if (!translationsObj[lang]) {
                        translationsObj[lang] = DEFAULT_TRANSLATIONS[lang];
                    } else {
                        translationsObj[lang] = {
                            ...DEFAULT_TRANSLATIONS[lang],
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
}

module.exports = ClientPageController;
