const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../../models/userModel');
const DeviceAuth = require('../../models/deviceAuthModel');
const { JWT_SECRET, JWT_EXPIRES_IN, COOKIE_OPTIONS, CLEAR_COOKIE_OPTIONS } = require('../../config/jwt');
const { validatePassword } = require('../../utils/passwordValidator');
const { validateEmail } = require('../../utils/emailValidator');
const { sendEmail } = require('../../utils/emailService');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper trích xuất IP thực của Client từ Request (tương thích cả Local, Render, Vercel & Cloudflare)
function getClientIp(req) {
    let ip = req.headers['cf-connecting-ip'] || 
             req.headers['x-real-ip'] || 
             req.headers['x-forwarded-for'] || 
             req.socket?.remoteAddress || 
             req.ip || '';

    if (ip.includes(',')) {
        ip = ip.split(',')[0].trim();
    }
    if (ip.startsWith('::ffff:')) {
        ip = ip.replace('::ffff:', '');
    }
    if (ip === '::1' || ip === '') {
        ip = '127.0.0.1';
    }
    return ip;
}

// Helper xác định URL Frontend linh hoạt cho cả Môi trường Local & Deploy Production
function getFrontendUrl(req) {
    if (process.env.CLIENT_URL) return process.env.CLIENT_URL;
    if (process.env.FRONTEND_URL) return process.env.FRONTEND_URL;
    if (req && req.headers && req.headers.origin) return req.headers.origin;
    return 'https://veltrixvoice.autos';
}

// Helper sinh 2 con số ngẫu nhiên 2 chữ số (10..99) và 2 lựa chọn nhiễu
function generate2DigitCodes() {
    const target = Math.floor(10 + Math.random() * 90).toString(); // 10..99
    let d1, d2;
    do {
        d1 = Math.floor(10 + Math.random() * 90).toString();
    } while (d1 === target);
    do {
        d2 = Math.floor(10 + Math.random() * 90).toString();
    } while (d2 === target || d2 === d1);

    const options = [target, d1, d2].sort(() => Math.random() - 0.5);
    return { targetCode: target, optionCodes: options };
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

            // Kiểm tra định dạng Email chuẩn
            const emailCheck = validateEmail(email);
            if (!emailCheck.isValid) {
                return res.status(400).json({ error: emailCheck.message });
            }

            // Bắt buộc kiểm tra độ mạnh của Mật khẩu
            const passwordCheck = validatePassword(password);
            if (!passwordCheck.isValid) {
                return res.status(400).json({ error: passwordCheck.message });
            }

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: 'Email này đã được sử dụng!' });
            }

            // Tạo Token Xác thực Email bảo mật (Thời hạn 24 giờ)
            const verificationToken = crypto.randomBytes(32).toString('hex');
            const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

            const frontendUrl = getFrontendUrl(req);
            const confirmUrl = `${frontendUrl}/confirm?token=${verificationToken}`;

            let newUser = null;
            try {
                // Tạo user tạm thời với trạng thái chưa xác thực
                newUser = await User.create({ 
                    name, 
                    email, 
                    password, 
                    lastLoginIp: clientIp,
                    trustedIps: [clientIp],
                    tokens: 2000,
                    dailyTokenLimit: 2000,
                    isVerified: false,
                    verificationToken,
                    verificationTokenExpires,
                    subscriptionHistory: [{
                        planName: 'Gói Miễn Phí Khởi Tạo (2,000 Ký Tự/Ngày)',
                        tier: 'FREE',
                        tokensGranted: 2000,
                        price: '0 VNĐ (Miễn phí mỗi ngày)'
                    }]
                });

                console.log(`📧 [REGISTER] Đang gửi email xác nhận đến: ${newUser.email}...`);

                // Gửi Email Xác thực Tài khoản thực tế
                const mailInfo = await sendEmail({
                    to: newUser.email,
                    subject: 'Xác Nhận Kích Hoạt Tài Khoản Veltrix Voice 🚀',
                    title: 'XÁC NHẬN TÀI KHOẢN',
                    category: 'XÁC THỰC EMAIL TÀI KHOẢN',
                    greeting: `Xin chào ${newUser.name},`,
                    messageHtml: 'Cảm ơn bạn đã đăng ký tài khoản tại <b>Veltrix Voice</b>. Vui lòng bấm vào nút bên dưới để hoàn tất xác thực email và kích hoạt tài khoản của bạn.',
                    actionText: '✅ XÁC NHẬN TÀI KHOẢN NGAY',
                    actionUrl: confirmUrl,
                    footerNote: 'Liên kết xác thực có hiệu lực trong 24 giờ. Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email.'
                });

                console.log(`✅ [REGISTER] Gửi email thành công tới ${newUser.email}:`, mailInfo?.messageId);
            } catch (emailErr) {
                // NẾU GỬI MAIL THẤT BẠI (Do sai mail, mail ảo hoặc SMTP chưa bật) -> XÓA TÀI KHOẢN TẠM LẬP TỨC
                if (newUser) {
                    await User.findByIdAndDelete(newUser._id);
                }
                console.error("Lỗi gửi Email xác nhận:", emailErr.message);
                return res.status(400).json({ 
                    error: emailErr.message.includes("SMTP") || emailErr.message.includes("Admin Settings")
                        ? emailErr.message 
                        : `Không thể gửi email xác minh đến địa chỉ ${email}. Vui lòng kiểm tra lại Email của bạn!`
                });
            }

            // Đăng ký thành công -> KHÔNG TỰ ĐỘNG ĐĂNG NHẬP (Chưa cấp JWT token hay cookie)
            return res.status(201).json({
                message: 'Đăng ký thành công! Chúng tôi đã gửi email kích hoạt. Vui lòng kiểm tra hộp thư để xác nhận.',
                requireVerification: true,
                email: newUser.email
            });
        } catch (err) {
            return res.status(500).json({ error: 'Lỗi đăng ký: ' + err.message });
        }
    }

    // XÁC THỰC EMAIL KHI USER CLICK NÚT TRÊN FE (/confirm?token=...)
    static async confirmEmail(req, res) {
        try {
            const { token } = req.body;
            const clientIp = getClientIp(req);

            if (!token) {
                return res.status(400).json({ error: 'Mã xác thực không hợp lệ!' });
            }

            const user = await User.findOne({
                verificationToken: token,
                verificationTokenExpires: { $gt: new Date() }
            });

            if (!user) {
                return res.status(400).json({ error: 'Mã xác thực không hợp lệ hoặc đã hết hạn (quá 24 giờ). Vui lòng đăng nhập lại để nhận email mới!' });
            }

            // Kích hoạt tài khoản thành công
            user.isVerified = true;
            user.verificationToken = null;
            user.verificationTokenExpires = null;
            user.lastLoginIp = clientIp;
            if (!user.trustedIps) user.trustedIps = [];
            if (!user.trustedIps.includes(clientIp)) {
                user.trustedIps.push(clientIp);
            }
            await checkAndResetDailyTokens(user);
            await user.save();

            // Đăng nhập tự động cho User sau khi xác thực thành công
            const jwtToken = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
            res.cookie('token', jwtToken, COOKIE_OPTIONS);
            res.cookie('user_ip', clientIp, { ...COOKIE_OPTIONS, httpOnly: false });

            return res.json({
                message: 'Chúc mừng! Tài khoản Veltrix Voice của bạn đã được xác thực thành công!',
                user,
                token: jwtToken
            });
        } catch (err) {
            return res.status(500).json({ error: 'Lỗi xác thực email: ' + err.message });
        }
    }

    // GỬI LẠI EMAIL XÁC THỰC KHI USER YÊU CẦU
    static async resendVerification(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({ error: 'Vui lòng nhập Email!' });
            }

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ error: 'Tài khoản không tồn tại!' });
            }

            if (user.isVerified) {
                return res.status(400).json({ error: 'Tài khoản này đã được xác thực từ trước!' });
            }

            // Tạo Token Mới
            const verificationToken = crypto.randomBytes(32).toString('hex');
            user.verificationToken = verificationToken;
            user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
            await user.save();

            const frontendUrl = getFrontendUrl(req);
            const confirmUrl = `${frontendUrl}/confirm?token=${verificationToken}`;

            await sendEmail({
                to: user.email,
                subject: 'Gửi Lại Mã Xác Nhận Kích Hoạt Tài Khoản Veltrix Voice 🚀',
                title: 'XÁC NHẬN TÀI KHOẢN',
                category: 'GỬI LẠI EMAIL XÁC THỰC',
                greeting: `Xin chào ${user.name},`,
                messageHtml: 'Bạn đã yêu cầu gửi lại email xác nhận tài khoản <b>Veltrix Voice</b>. Vui lòng bấm nút dưới để kích hoạt tài khoản.',
                actionText: '✅ XÁC NHẬN TÀI KHOẢN NGAY',
                actionUrl: confirmUrl,
                footerNote: 'Liên kết xác thực có hiệu lực trong 24 giờ.'
            });

            return res.json({ message: 'Đã gửi lại Email xác thực! Vui lòng kiểm tra hộp thư của bạn.' });
        } catch (err) {
            return res.status(500).json({ error: 'Lỗi gửi lại email xác thực: ' + err.message });
        }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const clientIp = getClientIp(req);

            if (!email || !password) {
                return res.status(400).json({ error: 'Vui lòng nhập Email và Mật khẩu!' });
            }

            // Kiểm tra định dạng Email chuẩn
            const emailCheck = validateEmail(email);
            if (!emailCheck.isValid) {
                return res.status(400).json({ error: emailCheck.message });
            }

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ 
                    error: 'Tài khoản Email này chưa được đăng ký trên Veltrix Voice!',
                    userNotFound: true 
                });
            }

            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Mật khẩu không chính xác! Vui lòng kiểm tra lại mật khẩu của bạn.' });
            }

            if (user.status === 'INACTIVE') {
                return res.status(403).json({ error: 'Tài khoản của bạn đã bị khóa hoặc vô hiệu hóa. Vui lòng liên hệ Admin để được hỗ trợ!' });
            }

            // BẮT BUỘC CHECK XÁC THỰC EMAIL
            if (!user.isVerified) {
                return res.status(403).json({ 
                    error: 'Tài khoản chưa được xác thực Email! Vui lòng kiểm tra hộp thư hoặc bấm gửi lại email xác nhận.',
                    requireVerification: true,
                    email: user.email
                });
            }

            // CHECK THIẾT BỊ / IP MỚI (XÁC THỰC 2 CON SỐ BẢO MẬT BẤM TRÊN EMAIL)
            const trustedIps = user.trustedIps || [];
            const isKnownIp = trustedIps.includes(clientIp) || !user.lastLoginIp || user.lastLoginIp === clientIp || user.lastLoginIp === '';

            if (!isKnownIp) {
                // Phát hiện IP/Thiết bị mới -> Yêu cầu xác thực 2 con số bảo mật qua Email
                const { targetCode, optionCodes } = generate2DigitCodes();
                const sessionToken = crypto.randomBytes(24).toString('hex');
                const verifyToken = crypto.randomBytes(24).toString('hex');
                const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

                await DeviceAuth.create({
                    userId: user._id,
                    ipAddress: clientIp,
                    userAgent: req.headers['user-agent'] || '',
                    securityCode: targetCode,
                    optionCodes,
                    sessionToken,
                    verifyToken,
                    expiresAt
                });

                const frontendUrl = getFrontendUrl(req);
                const verifyUrl = `${frontendUrl}/device-verify?token=${verifyToken}`;

                try {
                    await sendEmail({
                        to: user.email,
                        subject: '🛡️ Cảnh Báo Thiết Bị/IP Mới Đăng Nhập - Veltrix Voice',
                        title: 'CẢNH BÁO BẢO MẬT',
                        category: 'XÁC THỰC THIẾT BỊ MỚI',
                        greeting: `Xin chào ${user.name},`,
                        messageHtml: `Chúng tôi phát hiện yêu cầu đăng nhập tài khoản <b>Veltrix Voice</b> từ thiết bị/IP mới (<b>${clientIp}</b>).<br/><br/>Nếu đúng là bạn, vui lòng bấm nút bên dưới và chọn số <b>${targetCode}</b> để hoàn tất xác thực.`,
                        codeValue: targetCode,
                        codeLabel: 'MÃ SỐ CẦN CHỌN TRÊN EMAIL',
                        actionText: '🛡️ XÁC NHẬN THIẾT BỊ MỚI NGAY',
                        actionUrl: verifyUrl,
                        footerNote: 'Nếu không phải bạn đăng nhập, ai đó đang có mật khẩu của bạn. Hãy đổi mật khẩu ngay!'
                    });
                } catch (eErr) {
                    console.error("Lỗi gửi Email xác thực thiết bị:", eErr.message);
                }

                return res.json({
                    requireDeviceVerify: true,
                    sessionToken,
                    targetCode,
                    email: user.email,
                    message: `Phát hiện thiết bị/IP mới! Vui lòng mở Email và bấm chọn số [ ${targetCode} ] để hoàn tất đăng nhập.`
                });
            }

            // IP ĐÃ TIN TƯỞNG -> Tiến hành đăng nhập trực tiếp
            if (!trustedIps.includes(clientIp)) {
                user.trustedIps.push(clientIp);
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

    // POLLING CHECK TRẠNG THÁI XÁC THỰC THIẾT BỊ MỚI TỪ THIẾT BỊ ĐANG ĐĂNG NHẬP
    static async checkDeviceVerify(req, res) {
        try {
            const { sessionToken } = req.body;
            if (!sessionToken) {
                return res.status(400).json({ error: 'Thiếu sessionToken' });
            }

            const deviceAuth = await DeviceAuth.findOne({ sessionToken }).populate('userId');
            if (!deviceAuth) {
                return res.status(404).json({ error: 'Phiên xác thực không tồn tại hoặc đã hết hạn!' });
            }

            if (!deviceAuth.isVerified) {
                return res.json({ isVerified: false });
            }

            // ĐÃ ĐƯỢC XÁC THỰC TRÊN EMAIL! TIẾN HÀNH ĐĂNG NHẬP
            const user = deviceAuth.userId;
            const clientIp = deviceAuth.ipAddress || getClientIp(req);

            if (!user.trustedIps) user.trustedIps = [];
            if (!user.trustedIps.includes(clientIp)) {
                user.trustedIps.push(clientIp);
            }
            user.lastLoginIp = clientIp;
            await checkAndResetDailyTokens(user);
            await user.save();

            const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
            res.cookie('token', token, COOKIE_OPTIONS);
            res.cookie('user_ip', clientIp, { ...COOKIE_OPTIONS, httpOnly: false });

            return res.json({
                isVerified: true,
                message: 'Xác thực thiết bị mới thành công!',
                user,
                token
            });
        } catch (err) {
            return res.status(500).json({ error: 'Lỗi kiểm tra xác thực thiết bị: ' + err.message });
        }
    }

    // LẤY THÔNG TIN TRANG CHỌN SỐ EMAIL (/device-verify?token=...)
    static async getDeviceVerifyInfo(req, res) {
        try {
            const { token } = req.query;
            if (!token) {
                return res.status(400).json({ error: 'Thiếu token xác thực!' });
            }

            const deviceAuth = await DeviceAuth.findOne({
                verifyToken: token,
                expiresAt: { $gt: new Date() }
            }).populate('userId', 'email name');

            if (!deviceAuth) {
                return res.status(400).json({ error: 'Phiên xác thực thiết bị không tồn tại hoặc đã hết hạn (quá 10 phút)!' });
            }

            return res.json({
                success: true,
                email: deviceAuth.userId?.email,
                name: deviceAuth.userId?.name,
                optionCodes: deviceAuth.optionCodes,
                isVerified: deviceAuth.isVerified,
                ipAddress: deviceAuth.ipAddress
            });
        } catch (err) {
            return res.status(500).json({ error: 'Lỗi lấy thông tin phiên xác thực thiết bị: ' + err.message });
        }
    }

    // XÁC NHẬN NÚT CHỌN SỐ TRÊN EMAIL LINK (/device-verify?token=...)
    static async verifyDeviceCode(req, res) {
        try {
            const { token, selectedCode } = req.body;
            if (!token || !selectedCode) {
                return res.status(400).json({ error: 'Vui lòng chọn con số xác thực!' });
            }

            const deviceAuth = await DeviceAuth.findOne({
                verifyToken: token,
                expiresAt: { $gt: new Date() }
            }).populate('userId');

            if (!deviceAuth) {
                return res.status(400).json({ error: 'Phiên xác thực thiết bị đã hết hạn (quá 10 phút) hoặc không hợp lệ!' });
            }

            if (deviceAuth.isVerified) {
                return res.json({ success: true, message: 'Thiết bị này đã được xác nhận từ trước!' });
            }

            // Kiểm tra số được chọn có trùng khớp với securityCode không
            if (selectedCode.toString() !== deviceAuth.securityCode.toString()) {
                return res.status(400).json({ error: `Số bạn vừa chọn (${selectedCode}) KHÔNG chính xác! Vui lòng kiểm tra lại con số hiển thị trên thiết bị mới.` });
            }

            // Khớp con số -> Kích hoạt xác thực thiết bị thành công!
            deviceAuth.isVerified = true;
            await deviceAuth.save();

            const user = deviceAuth.userId;
            if (!user.trustedIps) user.trustedIps = [];
            if (!user.trustedIps.includes(deviceAuth.ipAddress)) {
                user.trustedIps.push(deviceAuth.ipAddress);
            }
            user.lastLoginIp = deviceAuth.ipAddress;
            await user.save();

            return res.json({
                success: true,
                message: '✅ Xác nhận "Vâng, đúng là tôi!" thành công! Màn hình trên thiết bị mới sẽ tự động hoàn tất đăng nhập.'
            });
        } catch (err) {
            return res.status(500).json({ error: 'Lỗi xác nhận mã thiết bị: ' + err.message });
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
                    isVerified: true,
                    lastLoginIp: clientIp,
                    trustedIps: [clientIp],
                    subscriptionHistory: [{
                        planName: 'Gói Miễn Phí Khởi Tạo (2,000 Ký Tự/Ngày)',
                        tier: 'FREE',
                        tokensGranted: 2000,
                        price: '0 VNĐ (Miễn phí mỗi ngày)'
                    }]
                });
            } else {
                if (user.status === 'INACTIVE') {
                    return res.status(403).json({ error: 'Tài khoản Google của bạn đã bị khóa hoặc vô hiệu hóa. Vui lòng liên hệ Admin để được hỗ trợ!' });
                }
                user.isVerified = true;
                if (!user.trustedIps) user.trustedIps = [];
                if (!user.trustedIps.includes(clientIp)) {
                    user.trustedIps.push(clientIp);
                }
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
        res.clearCookie('token', CLEAR_COOKIE_OPTIONS);
        res.clearCookie('user_ip', CLEAR_COOKIE_OPTIONS);
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
