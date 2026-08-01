const PageContent = require('../../models/pageContentModel');

class PageAdminController {
    // Lấy nội dung trang theo slug (ví dụ: landing)
    static async getPageContent(req, res) {
        try {
            const { slug } = req.params;
            let page = await PageContent.findOne({ slug });
            if (!page) {
                page = await PageContent.create({ slug: slug || 'landing' });
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

            // Gán dữ liệu thay đổi từ req.body
            const allowedFields = Object.keys(PageContent.schema.paths);
            allowedFields.forEach(field => {
                if (req.body[field] !== undefined && field !== '_id' && field !== 'slug') {
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
