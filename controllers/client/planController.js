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

    // Kích hoạt lại / Chuyển đổi sang gói người dùng ĐÃ SỞ HỮU trước đó
    static async switchPlan(req, res) {
        try {
            const { planCode } = req.body;
            const user = req.user;

            if (!planCode) {
                return res.status(400).json({ error: 'Thiếu mã gói cần chuyển đổi' });
            }

            const targetCode = String(planCode).toUpperCase();
            const isFree = targetCode === 'FREE';

            // Kiểm tra xem người dùng đã từng sở hữu/kích hoạt gói này trong lịch sử chưa
            const isOwned = isFree || user.tier === targetCode || user.subscriptionHistory?.some(
                item => item.tier?.toUpperCase() === targetCode
            );

            if (!isOwned) {
                return res.status(400).json({
                    error: `Bạn chưa từng kích hoạt gói [${targetCode}]. Vui lòng thanh toán hoặc tham gia sự kiện TikTok Promo để nâng gói!`
                });
            }

            const plan = await Plan.findOne({ code: targetCode });
            if (!plan && !isFree) {
                return res.status(404).json({ error: 'Gói dịch vụ không tồn tại trên hệ thống' });
            }

            // Cập nhật thông tin gói mới cho user
            user.tier = targetCode;
            if (plan) {
                user.maxCharsPerRequest = plan.maxCharsPerRequest;
                user.dailyTokenLimit = Math.max(user.dailyTokenLimit || 0, plan.tokensPerMonth);
                if (user.tokens < plan.tokensPerMonth) {
                    user.tokens = plan.tokensPerMonth;
                }
            } else if (isFree) {
                user.dailyTokenLimit = 2000;
                user.maxCharsPerRequest = 1000;
                if (user.tokens < 2000) {
                    user.tokens = 2000;
                }
            }

            await user.save();

            return res.json({
                message: `Đã kích hoạt thành công gói [${plan ? plan.name : 'Miễn phí'}]!`,
                user
            });
        } catch (err) {
            console.error('Lỗi chuyển đổi gói sở hữu:', err);
            return res.status(500).json({ error: 'Lỗi server khi chuyển đổi gói: ' + err.message });
        }
    }
}

module.exports = ClientPlanController;
