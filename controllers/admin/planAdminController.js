const Plan = require('../../models/planModel');

class PlanAdminController {
    // 1. Get all plans
    static async getPlans(req, res) {
        try {
            const plans = await Plan.find().sort({ createdAt: -1 });
            return res.json({ success: true, plans });
        } catch (error) {
            console.error('Lỗi lấy danh sách gói:', error);
            return res.status(500).json({ error: 'Lỗi server khi lấy danh sách gói' });
        }
    }

    // 2. Create plan
    static async createPlan(req, res) {
        try {
            const newPlan = new Plan(req.body);
            await newPlan.save();
            return res.json({ success: true, plan: newPlan, message: 'Thêm gói thành công' });
        } catch (error) {
            console.error('Lỗi thêm gói:', error);
            return res.status(500).json({ error: 'Lỗi server khi thêm gói' });
        }
    }

    // 3. Update plan
    static async updatePlan(req, res) {
        try {
            const planId = req.params.id;
            const updatedPlan = await Plan.findByIdAndUpdate(planId, req.body, { new: true });
            if (!updatedPlan) {
                return res.status(404).json({ error: 'Không tìm thấy gói' });
            }
            return res.json({ success: true, plan: updatedPlan, message: 'Cập nhật gói thành công' });
        } catch (error) {
            console.error('Lỗi cập nhật gói:', error);
            return res.status(500).json({ error: 'Lỗi server khi cập nhật gói' });
        }
    }

    // 4. Delete plan
    static async deletePlan(req, res) {
        try {
            const planId = req.params.id;
            const deletedPlan = await Plan.findByIdAndDelete(planId);
            if (!deletedPlan) {
                return res.status(404).json({ error: 'Không tìm thấy gói' });
            }
            return res.json({ success: true, message: 'Xóa gói thành công' });
        } catch (error) {
            console.error('Lỗi xóa gói:', error);
            return res.status(500).json({ error: 'Lỗi server khi xóa gói' });
        }
    }
}

module.exports = PlanAdminController;
