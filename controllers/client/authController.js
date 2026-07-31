const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../../models/userModel');
const { JWT_SECRET, JWT_EXPIRES_IN, COOKIE_OPTIONS } = require('../../config/jwt');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper trích xuất IP thực của Client từ Request
function getClientIp(req) {
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '';
    if (ip.includes(',')) {
        ip = ip.split(',')[0].trim();
    }
    if (ip.startsWith('::ffff:')) {
        ip = ip.replace('::ffff:', '');
    }
    if (ip === '::1') {
        ip = '127.0.0.1';
    }
    return ip;
}

// Helper tự động kiểm tra & làm mới token hàng ngày (00:00) cho người dùng
async function checkAndResetDailyTokens(user) {
    const todayStr = new Date().toISOString().split('T')[0];
    let isModified = false;

    // 1. Kiểm tra nếu gói cước nâng cấp đã hết hạn (quá ngày planExpiresAt)
    if (user.tier !== 'FREE' && user.planExpiresAt && new Date() > new Date(user.planExpiresAt)) {
        user.tier = 'FREE';
        user.dailyTokenLimit = 2000;
        user.maxCharsPerRequest = 1000;
        if (user.tokens > 2000) {
            user.tokens = 2000;
        }
        user.planExpiresAt = null;
        user.subscriptionHistory.unshift({
            planName: 'Gói cước đã hết hạn (Tự động về Miễn Phí)',
            tier: 'FREE',
            tokensGranted: 2000,
            price: '0 VNĐ',
            createdAt: new Date()
        });
        isModified = true;
    }

    // 2. Đảm bảo dailyTokenLimit không bị rỗng hoặc <= 0
    if (!user.dailyTokenLimit || user.dailyTokenLimit <= 0) {
        user.dailyTokenLimit = 2000;
        isModified = true;
    }

    // 3. Reset daily tokens khi sang ngày mới (00:00) dựa theo dailyTokenLimit thực tế của user
    if (user.lastDailyResetDate !== todayStr) {
        user.dailyTokensUsed = 0;
        user.tokens = user.dailyTokenLimit;
        user.lastDailyResetDate = todayStr;
        isModified = true;
    }

    if (isModified) {
        await user.save();
    }
}

class ClientAuthController {
    // API Lưu vết IP & Trả về Cookie user_ip khi người dùng bấm Đồng Ý trên FE
    static async consentIp(req, res) {
        const clientIp = getClientIp(req);
        res.cookie('user_ip', clientIp, { ...COOKIE_OPTIONS, httpOnly: false });
        return res.json({
            message: 'Đã xác thực và lưu vết IP thành công!',
            ip: clientIp
        });
    }

    static async register(req, res) {
        try {
            const { name, email, password } = req.body;
            const clientIp = getClientIp(req);

            if (!name || !email || !password) {
                return res.status(400).json({ error: 'Vui lòng nhập đầy đủ Tên, Email và Mật khẩu!' });
            }

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: 'Email này đã được đăng ký!' });
            }

            const newUser = await User.create({ 
                name, 
                email, 
                password, 
                lastLoginIp: clientIp,
                tokens: 2000,
                dailyTokenLimit: 2000,
                subscriptionHistory: [{
                    planName: 'Gói Miễn Phí Khởi Tạo (2,000 Ký Tự/Ngày)',
                    tier: 'FREE',
                    tokensGranted: 2000,
                    price: '0 VNĐ (Miễn phí mỗi ngày)'
                }]
            });

            const token = jwt.sign({ id: newUser._id, email: newUser.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
            res.cookie('token', token, COOKIE_OPTIONS);
            res.cookie('user_ip', clientIp, { ...COOKIE_OPTIONS, httpOnly: false });

            return res.status(201).json({
                message: 'Đăng ký tài khoản khách hàng thành công!',
                user: newUser,
                token
            });
        } catch (err) {
            return res.status(500).json({ error: 'Lỗi đăng ký: ' + err.message });
        }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const clientIp = getClientIp(req);

            if (!email || !password) {
                return res.status(400).json({ error: 'Vui lòng nhập Email và Mật khẩu!' });
            }

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ error: 'Email hoặc mật khẩu không chính xác!' });
            }

            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Email hoặc mật khẩu không chính xác!' });
            }

            user.lastLoginIp = clientIp;
            await checkAndResetDailyTokens(user);

            if (!user.subscriptionHistory || user.subscriptionHistory.length === 0) {
                user.subscriptionHistory = [{
                    planName: `Gói ${user.tier || 'FREE'} (${(user.dailyTokenLimit || 2000).toLocaleString()} Ký Tự/Ngày)`,
                    tier: user.tier || 'FREE',
                    tokensGranted: user.dailyTokenLimit || 2000,
                    price: '0 VNĐ'
                }];
            }
            await user.save();

            const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
            res.cookie('token', token, COOKIE_OPTIONS);
            res.cookie('user_ip', clientIp, { ...COOKIE_OPTIONS, httpOnly: false });

            return res.json({
                message: 'Đăng nhập thành công!',
                user: user,
                token
            });
        } catch (err) {
            return res.status(500).json({ error: 'Lỗi đăng nhập: ' + err.message });
        }
    }

    // Đăng nhập Google Auth (OAuth2)
    static async googleLogin(req, res) {
        try {
            const { idToken } = req.body;
            const clientIp = getClientIp(req);

            if (!idToken) {
                return res.status(400).json({ error: 'Thiếu Google Token!' });
            }

            const Setting = require('../../models/settingModel');
            const setting = await Setting.findOne();
            const googleClientId = (setting && setting.googleClientId) ? setting.googleClientId : process.env.GOOGLE_CLIENT_ID;

            const ticket = await googleClient.verifyIdToken({
                idToken: idToken,
                audience: googleClientId
            });

            const payload = ticket.getPayload();
            const { email, name } = payload;

            let user = await User.findOne({ email });
            if (!user) {
                const randomPassword = Math.random().toString(36).slice(-10) + 'A1!';
                user = await User.create({
                    name: name || email.split('@')[0],
                    email: email,
                    password: randomPassword,
                    tier: 'FREE',
                    tokens: 2000,
                    dailyTokenLimit: 2000,
                    lastLoginIp: clientIp,
                    subscriptionHistory: [{
                        planName: 'Gói Miễn Phí Khởi Tạo (2,000 Ký Tự/Ngày)',
                        tier: 'FREE',
                        tokensGranted: 2000,
                        price: '0 VNĐ (Miễn phí mỗi ngày)'
                    }]
                });
            } else {
                user.lastLoginIp = clientIp;
                if (name && (!user.name || user.name === user.email.split('@')[0])) {
                    user.name = name;
                }
                await checkAndResetDailyTokens(user);

                if (!user.subscriptionHistory || user.subscriptionHistory.length === 0) {
                    user.subscriptionHistory = [{
                        planName: `Gói ${user.tier || 'FREE'} (${(user.dailyTokenLimit || 2000).toLocaleString()} Ký Tự/Ngày)`,
                        tier: user.tier || 'FREE',
                        tokensGranted: user.dailyTokenLimit || 2000,
                        price: '0 VNĐ'
                    }];
                }
                await user.save();
            }

            const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
            res.cookie('token', token, COOKIE_OPTIONS);
            res.cookie('user_ip', clientIp, { ...COOKIE_OPTIONS, httpOnly: false });

            return res.json({
                message: 'Đăng nhập Google thành công!',
                user: user,
                token
            });
        } catch (err) {
            return res.status(500).json({ error: 'Lỗi xác thực Google: ' + err.message });
        }
    }

    static async logout(req, res) {
        res.clearCookie('token', COOKIE_OPTIONS);
        res.clearCookie('user_ip', COOKIE_OPTIONS);
        return res.json({ message: 'Đã đăng xuất thành công!' });
    }

    static async getMe(req, res) {
        const clientIp = getClientIp(req);
        res.cookie('user_ip', clientIp, { ...COOKIE_OPTIONS, httpOnly: false });

        await checkAndResetDailyTokens(req.user);

        if (!req.user.subscriptionHistory || req.user.subscriptionHistory.length === 0) {
            req.user.subscriptionHistory = [{
                planName: `Gói ${req.user.tier || 'FREE'} (${(req.user.dailyTokenLimit || 2000).toLocaleString()} Ký Tự/Ngày)`,
                tier: req.user.tier || 'FREE',
                tokensGranted: req.user.dailyTokenLimit || 2000,
                price: '0 VNĐ'
            }];
            await req.user.save();
        }

        return res.json({ 
            user: {
                ...req.user.toObject(),
                lastLoginIp: clientIp
            } 
        });
    }
}

module.exports = ClientAuthController;
