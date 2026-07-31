const User = require('../../models/userModel');

class StatsAdminController {
    static async getDashboardStats(req, res) {
        try {
            const totalUsers = await User.countDocuments();
            const totalProUsers = await User.countDocuments({ role: 'ROLE_PRO' });
            const totalAdminUsers = await User.countDocuments({ role: 'ROLE_ADMIN' });
            
            const tokenStats = await User.aggregate([
                { $group: { _id: null, totalTokens: { $sum: "$tokens" } } }
            ]);

            const sumTokens = tokenStats.length > 0 ? tokenStats[0].totalTokens : 0;

            return res.json({
                stats: {
                    totalUsers,
                    totalProUsers,
                    totalAdminUsers,
                    totalTokensAvailable: sumTokens,
                    systemStatus: "Healthy"
                }
            });
        } catch (err) {
            return res.status(500).json({ error: 'Lỗi lấy thống kê: ' + err.message });
        }
    }
}

module.exports = StatsAdminController;
