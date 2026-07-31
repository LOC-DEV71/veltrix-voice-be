const { isVoiceLocked } = require('../validators/voiceValidator');

/**
 * Tier Middleware — Kiểm tra quyền truy cập tài nguyên theo Hạng Gói Dịch Vụ
 * Sử dụng Plan.priority ĐỘNG từ MongoDB Atlas
 */

/**
 * Middleware kiểm tra user có đủ tier để dùng voice đang chọn không
 * Dùng cho route POST /tts/generate và POST /tts/preview
 */
function checkVoiceAccess(req, res, next) {
    // Không cần check tier cho preview/generate vì voice locked đã check ở FE
    // Middleware này chỉ enforce ở BE để tránh bypass
    const { voice } = req.body;
    
    if (!voice) {
        return next(); // Để controller xử lý validation
    }

    // Voice access sẽ được check trong controller vì cần query Voice model
    // Middleware này chỉ inject tier info vào req
    req.userTier = req.user ? (req.user.tier || 'FREE') : 'FREE';
    next();
}

/**
 * Factory middleware: Yêu cầu user phải có tier >= minimumTier
 * @param {string} minimumTier - Mã gói tối thiểu (VD: 'PRO', 'CREATOR')
 * @returns {Function} Express middleware
 */
function requireTier(minimumTier) {
    return async (req, res, next) => {
        try {
            const userTier = req.user ? (req.user.tier || 'FREE') : 'FREE';
            const locked = await isVoiceLocked(userTier, minimumTier);

            if (locked) {
                return res.status(403).json({
                    error: `Tính năng này yêu cầu gói ${minimumTier} trở lên. Gói hiện tại của bạn: ${userTier}.`
                });
            }

            next();
        } catch (err) {
            console.error('Tier Middleware Error:', err);
            next();
        }
    };
}

module.exports = {
    checkVoiceAccess,
    requireTier
};
