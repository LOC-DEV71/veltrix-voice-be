const User = require('../../models/userModel');

class UserAdminController {
    // 1. Lấy danh sách toàn bộ người dùng trong MongoDB
    static async getAllUsers(req, res) {
        try {
            const users = await User.find().select('-password').sort({ createdAt: -1 });
            return res.json({ users });
        } catch (err) {
            return res.status(500).json({ error: 'Lỗi lấy danh sách User: ' + err.message });
        }
    }

    // 2. Cập nhật số Token hoặc Gói dịch vụ (Role) cho User
    static async updateUser(req, res) {
        try {
            const { userId } = req.params;
            const { tokens, role } = req.body;

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'Không tìm thấy người dùng!' });
            }

            if (req.body.tier !== undefined) {
                user.tier = req.body.tier;
                // Lấy thông tin gói tương ứng để update các giới hạn
                const Plan = require('../../models/planModel');
                const plan = await Plan.findOne({ code: req.body.tier });
                if (plan) {
                    user.maxCharsPerRequest = plan.maxCharsPerRequest;
                    user.dailyTokenLimit = plan.tokensPerMonth;
                    // Tự động cộng/nâng token lên bằng dung lượng gói mới nếu chưa đạt
                    if (tokens === undefined || Number(tokens) < plan.tokensPerMonth) {
                        user.tokens = plan.tokensPerMonth;
                    }
                }
            }
            if (tokens !== undefined && (req.body.tier === undefined || Number(tokens) > user.tokens)) {
                user.tokens = Number(tokens);
                if (!user.dailyTokenLimit || user.dailyTokenLimit < Number(tokens)) {
                    user.dailyTokenLimit = Number(tokens);
                }
            }
            if (req.body.status !== undefined) user.status = req.body.status;

            await user.save();

            return res.json({
                message: `Đã cập nhật tài khoản [${user.email}] thành công!`,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    tokens: user.tokens
                }
            });
        } catch (err) {
            return res.status(500).json({ error: 'Lỗi cập nhật User: ' + err.message });
        }
    }

    // 3. Xóa người dùng
    static async deleteUser(req, res) {
        try {
            const { userId } = req.params;
            await User.findByIdAndDelete(userId);
            return res.json({ message: 'Đã xóa tài khoản thành công!' });
        } catch (err) {
            return res.status(500).json({ error: 'Lỗi xóa User: ' + err.message });
        }
    }
}

module.exports = UserAdminController;
