const PageContent = require('../../models/pageContentModel');

class PageController {
    // Lấy nội dung công khai của trang (Landing, etc.)
    static async getPageContent(req, res) {
        try {
            const { slug } = req.params;
            let page = await PageContent.findOne({ slug: slug || 'landing' });
            if (!page) {
                page = await PageContent.create({ slug: slug || 'landing' });
            }
            return res.json({ success: true, page });
        } catch (err) {
            return res.status(500).json({ error: 'Lỗi lấy nội dung trang: ' + err.message });
        }
    }
}

module.exports = PageController;
