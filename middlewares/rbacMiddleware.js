/**
 * Middleware Phân Quyền ARBAC (Attribute & Role-Based Access Control)
 */

// 1. Phân quyền theo Vai Trò (Roles)
function checkRole(allowedRoles = []) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Chưa xác thực người dùng.' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: `Truy cập bị từ chối! Quyền hiện tại [${req.user.role}] không đủ thẩm quyền.` 
            });
        }

        next();
    };
}

// 2. Phân quyền theo Thuộc Tính (Attributes - Token Balance & Max Text Length)
function checkTtsAttributes(req, res, next) {
    const { text } = req.body;
    const user = req.user;

    if (!text || text.trim() === '') {
        return res.status(400).json({ error: 'Văn bản không được để trống.' });
    }

    const charLength = text.length;

    // Kiểm tra thuộc tính 1: Giới hạn độ dài ký tự tối đa cho phép của gói
    if (charLength > user.maxCharsPerRequest) {
        return res.status(400).json({ 
            error: `Đoạn văn quá dài (${charLength} ký tự)! Gói của bạn tối đa chỉ được ${user.maxCharsPerRequest} ký tự/lần. Hãy nâng cấp gói PRO.` 
        });
    }

    // Kiểm tra thuộc tính 2: Số dư Token có đủ không
    if (user.tokens < charLength) {
        return res.status(403).json({ 
            error: `Số token không đủ! Bạn cần ${charLength} token nhưng chỉ còn ${user.tokens} token. Vui lòng nạp thêm.` 
        });
    }

    next();
}

module.exports = {
    checkRole,
    checkTtsAttributes
};
