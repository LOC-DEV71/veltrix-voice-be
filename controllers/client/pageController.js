const PageContent = require('../../models/pageContentModel');

const DEFAULT_FAQS = [
    {
        qVi: 'Giọng đọc AI tại đây có bản quyền không?',
        qEn: 'Are AI generated voices royalty-free?',
        aVi: 'Tất cả các file âm thanh được tạo ra tại Veltrix Voice đều thuộc quyền sở hữu của bạn. Bạn hoàn toàn có thể sử dụng làm video thương mại trên YouTube, TikTok, Facebook mà không lo vi phạm bản quyền.',
        aEn: 'All audio files generated on Veltrix Voice belong entirely to you. You can use them freely on commercial videos for YouTube, TikTok, Facebook without copyright issues.'
    },
    {
        qVi: 'Cách tính hạn mức sử dụng như thế nào?',
        qEn: 'How does the daily character limit work?',
        aVi: 'Mỗi tài khoản miễn phí sẽ được cấp hạn mức 2,000 ký tự mỗi ngày. Hạn mức sẽ tự động được làm mới lại 2,000 ký tự vào 00:00 đêm hàng ngày.',
        aEn: 'Every free account is granted 2,000 characters daily. The character limit is automatically reset to 2,000 characters at 00:00 UTC daily.'
    }
];

class PageController {
    // Lấy nội dung công khai của trang (Landing, etc.)
    static async getPageContent(req, res) {
        try {
            const { slug } = req.params;
            let page = await PageContent.findOne({ slug: slug || 'landing' });
            if (!page) {
                page = await PageContent.create({ slug: slug || 'landing', faqs: DEFAULT_FAQS });
            } else if (!page.faqs || page.faqs.length === 0) {
                page.faqs = DEFAULT_FAQS;
            }
            return res.json({ success: true, page });
        } catch (err) {
            return res.status(500).json({ error: 'Lỗi lấy nội dung trang: ' + err.message });
        }
    }
}

module.exports = PageController;
