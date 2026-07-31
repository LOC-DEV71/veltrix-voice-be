const Plan = require('../models/planModel');

/**
 * Voice Validator — Kiểm tra quyền truy cập giọng đọc theo Hạng Gói Dịch Vụ
 * Logic ĐỘNG: Lấy priority từ Plan Collection trong MongoDB Atlas
 * Không hardcode bất kỳ tên gói nào (PRO, VIP, CREATOR...)
 */

// Cache Plan hierarchy trong bộ nhớ (refresh mỗi 5 phút)
let planCache = null;
let planCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 phút

/**
 * Lấy bảng xếp hạng gói từ MongoDB Atlas (có cache)
 * @returns {Object} Map { 'FREE': 0, 'BASIC': 10, 'CREATOR': 20, 'PRO': 30, 'CUSTOM': 99 }
 */
async function getPlanHierarchy() {
    const now = Date.now();
    if (planCache && (now - planCacheTime) < CACHE_TTL) {
        return planCache;
    }

    const plans = await Plan.find({ status: 'ACTIVE' }).select('code priority').lean();
    const hierarchy = {};
    for (const plan of plans) {
        hierarchy[plan.code] = plan.priority || 0;
    }

    // Fallback: Nếu DB chưa có priority thì dùng giá tiền để tính
    if (Object.values(hierarchy).every(v => v === 0) && plans.length > 1) {
        const allPlans = await Plan.find({ status: 'ACTIVE' }).select('code monthlyPrice').lean().sort({ monthlyPrice: 1 });
        allPlans.forEach((p, idx) => {
            hierarchy[p.code] = idx * 10;
        });
    }

    planCache = hierarchy;
    planCacheTime = now;
    return hierarchy;
}

/**
 * Kiểm tra user có đủ quyền truy cập voice với requiredRole cho trước không
 * @param {string} userTier - Hạng gói hiện tại của user (VD: 'FREE', 'PRO')
 * @param {string} requiredRole - Hạng gói tối thiểu yêu cầu của voice (VD: 'PRO', 'CREATOR')
 * @returns {Promise<boolean>} true = bị khóa, false = được phép
 */
async function isVoiceLocked(userTier, requiredRole) {
    // FREE voice → ai cũng dùng được
    if (!requiredRole || requiredRole === 'FREE' || requiredRole === 'ROLE_USER') {
        return false;
    }

    // Chưa đăng nhập hoặc FREE user → khóa tất cả non-FREE voice
    if (!userTier || userTier === 'FREE') {
        return true;
    }

    const hierarchy = await getPlanHierarchy();
    const userPriority = hierarchy[userTier] ?? 0;
    const requiredPriority = hierarchy[requiredRole] ?? 0;

    // User có priority >= required → ĐƯỢC PHÉP (userPriority cao = gói cao hơn)
    return userPriority < requiredPriority;
}

/**
 * Xóa cache Plan hierarchy (gọi khi Admin cập nhật Plans)
 */
function clearPlanCache() {
    planCache = null;
    planCacheTime = 0;
}

module.exports = {
    getPlanHierarchy,
    isVoiceLocked,
    clearPlanCache
};
