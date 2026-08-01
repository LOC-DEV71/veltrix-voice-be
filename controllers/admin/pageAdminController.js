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
        faqTag: 'FREQUENTLY ASKED QUESTIONS',
        faqTitle: 'Frequently Asked Questions (FAQ)',
        faqs: [
            {
                q: 'Are AI generated voices royalty-free?',
                a: 'All audio files generated on Veltrix Voice belong entirely to you. You can use them freely on commercial videos for YouTube, TikTok, Facebook without copyright issues.'
            },
            {
                q: 'How does the daily character limit work?',
                a: 'Every free account is granted 2,000 characters daily. The character limit is automatically reset to 2,000 characters at 00:00 UTC daily.'
            }
        ],
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
        navLogout: 'ログアウト',
        heroBadge: '最先端のAIテキスト読み上げ技術',
        heroTitle: 'AI声を生成',
        heroTitleHl1: '活き活きとした',
        heroTitleHl2: '人間のように自然な',
        heroSubtitle: 'Veltrix Voiceプラットフォームは、あらゆるテキストをわずか数秒で高品質なMP3音声ファイルに変換します。',
        heroCtaMain: '今すぐ試す',
        heroCtaSecondary: 'サンプルを聴く',
        featuresTag: '優れた機能',
        featuresTitle: 'Veltrix Voiceを選ぶ理由',
        card1Title: 'ニューラルAI音声',
        card1Desc: '高度なディープラーニングモデルが自然な感情の抑揚を99%維持して正確に発音します。',
        card2Title: '超高速処理',
        card2Desc: '強力なクラウドサーバーシステムにより、1,000文字のテキストを2秒未満でMP3に変換します。',
        card3Title: '商用利用権',
        card3Desc: '生成されたMP3ファイルは著作権を気にせずYouTubeやTikTok広告で使用できます。',
        faqTag: 'よくある質問',
        faqTitle: 'よくある質問 (FAQ)',
        faqs: [
            {
                q: 'AI音声は商用利用可能ですか？',
                a: 'はい。Veltrix Voiceで作成されたすべての音声ファイルの所有権はあなたにあります。商用動画でご自由にお使いいただけます。'
            }
        ],
        footer: '© 2026 Veltrix Voice Platform. All rights reserved.'
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
        navLogout: '로그아웃',
        heroBadge: '최고 수준의 AI 텍스트 음성 변환 기술',
        heroTitle: 'AI 음성 생성',
        heroTitleHl1: '생생하고',
        heroTitleHl2: '사람처럼 자연스러운',
        heroSubtitle: 'Veltrix Voice 플랫폼은 몇 초 만에 모든 텍스트를 고품질 MP3 오디오로 변환해 드립니다.',
        heroCtaMain: '지금 무료로 시작하기',
        heroCtaSecondary: '샘플 음성 듣기',
        featuresTag: '뛰어난 기능',
        featuresTitle: '왜 Veltrix Voice인가요?',
        card1Title: '뉴럴 AI 음성',
        card1Desc: '고급 딥러닝 모델이 99% 사람과 동일한 자연스러운 감정 억양을 구현합니다.',
        card2Title: '초고속 변환',
        card2Desc: '강력한 클라우드 서버로 1,000자 텍스트를 2초 이내에 MP3로 변환합니다.',
        card3Title: '상업적 사용 권한',
        card3Desc: '생성된 MP3 파일은 유튜브, TikTok 광고 등 상업적 프로젝트에 저작권 걱정 없이 사용 가능합니다.',
        faqTag: '자주 묻는 질문',
        faqTitle: '자주 묻는 질문 (FAQ)',
        faqs: [],
        footer: '© 2026 Veltrix Voice Platform. All rights reserved.'
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
        navLogout: '退出登录',
        heroBadge: '顶尖 AI 文本转语音技术',
        heroTitle: '生成 AI 语音',
        heroTitleHl1: '生动逼真',
        heroTitleHl2: '媲美真人自然发音',
        heroSubtitle: 'Veltrix Voice 平台帮助您在几秒钟内将任何文本转换为高质量 MP3 音频。',
        heroCtaMain: '立即免费体验',
        heroCtaSecondary: '试听试听试听',
        featuresTag: '卓越功能',
        featuresTitle: '为什么选择 Veltrix Voice？',
        card1Title: '神经网络 AI 语音',
        card1Desc: '先进的深度学习模型精确发音与停顿，保持 99% 真人般的自然情感语调。',
        card2Title: '极速转换',
        card2Desc: '强大的云服务器系统，2 秒内将 1,000 字文本转换为 MP3。',
        card3Title: '商业授权',
        card3Desc: '生成的 MP3 文件可自由用于 YouTube、TikTok 变现广告项目，无版权忧虑。',
        faqTag: '常见问题',
        faqTitle: '常见问题 (FAQ)',
        faqs: [],
        footer: '© 2026 Veltrix Voice Platform. All rights reserved.'
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
        navLogout: 'Déconnexion',
        heroBadge: 'Technologie de synthèse vocale IA de pointe',
        heroTitle: 'Créer des Voix IA',
        heroTitleHl1: 'Vivid',
        heroTitleHl2: 'Naturelles comme l\'humain',
        heroSubtitle: 'La plateforme Veltrix Voice vous aide à transformer n\'importe quel texte en audio MP3 de haute qualité en quelques secondes.',
        heroCtaMain: 'Essayer maintenant',
        heroCtaSecondary: 'Écouter des échantillons',
        featuresTag: 'CARACTÉRISTIQUES EXCEPTIONNELLES',
        featuresTitle: 'Pourquoi choisir Veltrix Voice ?',
        card1Title: 'Voix IA Neurales',
        card1Desc: 'Les modèles d\'apprentissage profond avancés se prononcent avec précision.',
        card2Title: 'Ultra Rapide',
        card2Desc: 'Convertit 1 000 caractères de texte en MP3 en moins de 2 secondes.',
        card3Title: 'Droits commerciaux',
        card3Desc: 'Utilisez les fichiers MP3 pour vos projets monétisés sans souci de droit d\'auteur.',
        faqTag: 'FOIRE AUX QUESTIONS',
        faqTitle: 'Foire Aux Questions (FAQ)',
        faqs: [],
        footer: '© 2026 Veltrix Voice Platform. Tous droits réservés.'
    }
};

class PageAdminController {
    // Lấy nội dung trang theo slug
    static async getPageContent(req, res) {
        try {
            const { slug } = req.params;
            let page = await PageContent.findOne({ slug: slug || 'landing' });
            
            if (!page) {
                page = new PageContent({ slug: slug || 'landing', translations: DEFAULT_TRANSLATIONS });
                await page.save();
            } else {
                let translationsObj = page.translations ? (page.translations instanceof Map ? Object.fromEntries(page.translations) : page.translations) : {};
                // Tự động bổ sung bối cảnh default cho các ngôn ngữ còn thiếu
                Object.keys(DEFAULT_TRANSLATIONS).forEach(lang => {
                    if (!translationsObj[lang]) {
                        translationsObj[lang] = DEFAULT_TRANSLATIONS[lang];
                    } else {
                        // Merge các trường header nếu còn thiếu
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

    // Cập nhật nội dung trang theo slug
    static async updatePageContent(req, res) {
        try {
            const { slug } = req.params;
            let page = await PageContent.findOne({ slug: slug || 'landing' });
            if (!page) {
                page = new PageContent({ slug: slug || 'landing' });
            }

            // Gán object translations động
            if (req.body.translations) {
                page.translations = req.body.translations;
            }

            // Gán các trường legacy flat nếu được gửi lên
            const allowedFields = Object.keys(PageContent.schema.paths);
            allowedFields.forEach(field => {
                if (req.body[field] !== undefined && field !== '_id' && field !== 'slug' && field !== 'translations') {
                    page[field] = req.body[field];
                }
            });

            await page.save();
            return res.json({ success: true, message: `Cập nhật nội dung trang [${slug}] thành công!`, page });
        } catch (err) {
            return res.status(500).json({ error: 'Lỗi cập nhật nội dung trang: ' + err.message });
        }
    }
}

module.exports = PageAdminController;
