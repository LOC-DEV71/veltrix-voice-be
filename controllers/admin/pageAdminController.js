const PageContent = require('../../models/pageContentModel');

const DEFAULT_TRANSLATIONS = {
    vi: {
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
        footer: '© 2026 Veltrix Voice Platform. Tất cả quyền được bảo lưu. Phát triển trên nền tảng React & Node.js MVC.'
    },
    en: {
        heroBadge: 'Top-tier AI Text-to-Speech Technology',
        heroTitle: 'Create AI Voices',
        heroTitleHl1: 'Vivid',
        heroTitleHl2: 'Natural as Human',
        heroSubtitle: 'Veltrix Voice platform helps you turn any text into high-quality MP3 audio in seconds. Perfect for YouTube, TikTok, Audiobooks & Ads.',
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
        footer: '© 2026 Veltrix Voice Platform. All rights reserved. Built with React & Node.js.'
    }
};

class PageAdminController {
    // Lấy nội dung trang theo slug
    static async getPageContent(req, res) {
        try {
            const { slug } = req.params;
            let page = await PageContent.findOne({ slug });
            
            if (!page) {
                page = new PageContent({ slug: slug || 'landing', translations: DEFAULT_TRANSLATIONS });
                await page.save();
            } else {
                let translationsObj = page.translations ? (page.translations instanceof Map ? Object.fromEntries(page.translations) : page.translations) : {};
                if (!translationsObj.vi) translationsObj.vi = DEFAULT_TRANSLATIONS.vi;
                if (!translationsObj.en) translationsObj.en = DEFAULT_TRANSLATIONS.en;
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
            let page = await PageContent.findOne({ slug });
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
