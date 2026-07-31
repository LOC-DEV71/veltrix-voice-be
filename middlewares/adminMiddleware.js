const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');
const Account = require('../models/accountModel');

/**
 * Middleware 1: Xác thực JWT Admin & Nạp thông tin Account + Role/Permissions
 */
async function authenticateAdminToken(req, res, next) {
    let token = req.cookies.admin_token;

    if (!token && req.headers.authorization) {
        const parts = req.headers.authorization.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
            token = parts[1];
        }
    }

    if (!token) {
        return res.status(401).json({ error: 'Chưa đăng nhập! Vui lòng đăng nhập tài khoản ADMIN.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Populate bảng Role để lấy danh sách permissions
        const account = await Account.findById(decoded.id).populate('role').select('-password');

        if (!account || account.status !== 'ACTIVE') {
            return res.status(401).json({ error: 'Tài khoản Admin không tồn tại hoặc đã bị khóa.' });
        }

        req.account = account;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Phiên làm việc Admin hết hạn hoặc Token không hợp lệ.' });
    }
}

/**
 * Middleware 2: Kiểm tra Quyền Hạn Chi Tiết (Granular Permission Check)
 * Ví dụ: requirePermission('delete_users'), requirePermission('view_users')
 */
function requirePermission(requiredPermission) {
    return (req, res, next) => {
        if (!req.account || !req.account.role) {
            return res.status(403).json({ error: 'Tài khoản Admin chưa được gán Role hợp lệ!' });
        }

        const userPermissions = req.account.role.permissions || [];

        // Nếu là SUPER_ADMIN hoặc có chứa permission yêu cầu thì cho qua
        if (req.account.role.slug === 'super-admin' || userPermissions.includes(requiredPermission)) {
            return next();
        }

        return res.status(403).json({ 
            error: `Bị từ chối truy cập! Tài khoản của bạn [Role: ${req.account.role.title}] thiếu quyền [${requiredPermission}].` 
        });
    };
}

module.exports = {
    authenticateAdminToken,
    requirePermission
};
