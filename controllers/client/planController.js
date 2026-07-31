const Plan = require('../../models/planModel');

class ClientPlanController {
    // Lấy tất cả các gói dịch vụ (đang active)
    static async getPlans(req, res) {
        try {
            const plans = await Plan.find({ status: 'ACTIVE' });
            
            // Xếp đúng thứ tự FREE -> BASIC -> CREATOR -> PRO -> CUSTOM
            const order = ['FREE', 'BASIC', 'CREATOR', 'PRO', 'CUSTOM'];
            plans.sort((a, b) => {
                const indexA = order.indexOf(a.code);
                const indexB = order.indexOf(b.code);
                // Đẩy những gói không có trong list xuống cuối
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA - indexB;
            });

            return res.json({ success: true, plans });
        } catch (error) {
            console.error('Lỗi lấy danh sách gói:', error);
            return res.status(500).json({ error: 'Lỗi server khi lấy danh sách gói' });
        }
    }
}

module.exports = ClientPlanController;
