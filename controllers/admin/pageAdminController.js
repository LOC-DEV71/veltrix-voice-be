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

class PageAdminController {
    // Lấy nội dung trang theo slug (ví dụ: landing)
    static async getPageContent(req, res) {
        try {
            const { slug } = req.params;
            let page = await PageContent.findOne({ slug });
            if (!page) {
                page = await PageContent.create({ slug: slug || 'landing', faqs: DEFAULT_FAQS });
            } else if (!page.faqs || page.faqs.length === 0) {
                page.faqs = DEFAULT_FAQS;
                await page.save();
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

            // Gán các trường chuẩn
            const allowedFields = Object.keys(PageContent.schema.paths);
            allowedFields.forEach(field => {
                if (req.body[field] !== undefined && field !== '_id' && field !== 'slug' && field !== 'faqs') {
                    page[field] = req.body[field];
                }
            });

            // Gán mảng faqs động nếu được truyền vào
            if (Array.isArray(req.body.faqs)) {
                page.faqs = req.body.faqs;
            }

            await page.save();
            return res.json({ success: true, message: `Cập nhật nội dung trang [${slug}] thành công!`, page });
        } catch (err) {
            return res.status(500).json({ error: 'Lỗi cập nhật nội dung trang: ' + err.message });
        }
    }
}

module.exports = PageAdminController;
