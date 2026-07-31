const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');
const User = require('../models/userModel');

async function authenticateToken(req, res, next) {
    let token = req.cookies.token;

    if (!token && req.headers.authorization) {
        const parts = req.headers.authorization.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
            token = parts[1];
        }
    }

    if (!token) {
        return res.status(401).json({ error: 'Chưa đăng nhập! Vui lòng đăng nhập để sử dụng.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ error: 'Tài khoản không tồn tại hoặc đã bị xóa.' });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Phiên đăng nhập hết hạn hoặc Token không hợp lệ.' });
    }
}

module.exports = { authenticateToken };
