const TiktokPromo = require('../../models/tiktokPromoModel');
const PromoConfig = require('../../models/promoConfigModel');
const Plan = require('../../models/planModel');

class PromoController {
    // Lấy cấu hình chiến dịch quảng bá TikTok hiện tại
    static async getConfig(req, res) {
        try {
            let config = await PromoConfig.findOne();
            if (!config) {
                config = await PromoConfig.create({
                    promoImageUrl: '',
                    hashtags: ['#VeltrixVoice', '#AIVoice', '#VoiceGenerator'],
                    instructions: '1. Tải ảnh quảng bá bên dưới về máy.\n2. Đăng video hoặc hình ảnh lên TikTok kèm theo các hashtag quy định.\n3. Dán link bài đăng TikTok và email của bạn vào biểu mẫu bên dưới.\n4. Admin sẽ kiểm tra và kích hoạt gói cho bạn trong vòng 24h.',
                    instructionsEn: '1. Download the promo image below.\n2. Post video/image on TikTok with required hashtags.\n3. Paste your TikTok post link and email in the form below.\n4. Admin will review and activate your plan within 24 hours.',
                    isActive: true
                });
            }
            return res.json({ config });
        } catch (err) {
            return res.status(500).json({ error: 'Lỗi lấy cấu hình quảng bá: ' + err.message });
        }
    }

    // Client gửi yêu cầu nhận gói qua TikTok
    static async submitRequest(req, res) {
        try {
            const { planId, tiktokUrl, email } = req.body;
            const userId = req.user._id;

            if (!planId || !tiktokUrl || !email) {
                return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin (Gói, Link bài đăng, Email)' });
            }

            const cleanEmail = String(email).trim();
            const cleanUrl = String(tiktokUrl).trim();

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(cleanEmail)) {
                return res.status(400).json({ error: 'Định dạng Email không hợp lệ. Vui lòng kiểm tra lại!' });
            }

            if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
                return res.status(400).json({ error: 'Link bài đăng bắt buộc phải bắt đầu bằng http:// hoặc https:// (Ví dụ: https://vt.tiktok.com/...)' });
            }

            const plan = await Plan.findById(planId);
            if (!plan) {
                return res.status(404).json({ error: 'Gói dịch vụ không tồn tại' });
            }

            const config = await PromoConfig.findOne();

            if (config && config.isActive === false) {
                return res.status(400).json({ error: 'Chiến dịch quảng bá nhận gói hiện đang tạm dừng. Vui lòng quay lại sau!' });
            }

            if (config && config.applicablePlans?.length > 0) {
                if (!config.applicablePlans.includes(plan.code)) {
                    return res.status(400).json({ error: `Gói [${plan.name}] không nằm trong danh sách áp dụng sự kiện này.` });
                }
            }

            // Kiểm tra xem đã có yêu cầu PENDING cho gói này chưa
            const existingPending = await TiktokPromo.findOne({
                user: userId,
                status: 'PENDING'
            });

            if (existingPending) {
                return res.status(400).json({ error: 'Bạn đang có 1 yêu cầu đang chờ duyệt. Vui lòng đợi Admin xử lý trước khi gửi yêu cầu mới.' });
            }

            const newRequest = await TiktokPromo.create({
                user: userId,
                plan: plan._id,
                planCode: plan.code,
                planName: plan.name,
                tiktokUrl: cleanUrl,
                email: cleanEmail,
                promoImageUrl: config ? config.promoImageUrl : '',
                hashtags: config ? config.hashtags : [],
                status: 'PENDING'
            });

            return res.status(201).json({
                message: 'Gửi yêu cầu nhận gói qua TikTok thành công! Vui lòng chờ Admin duyệt.',
                request: newRequest
            });
        } catch (err) {
            return res.status(500).json({ error: 'Lỗi gửi yêu cầu TikTok: ' + err.message });
        }
    }

    // Xem danh sách yêu cầu của client hiện tại
    static async getMyRequests(req, res) {
        try {
            const requests = await TiktokPromo.find({ user: req.user._id })
                .populate('plan', 'name code monthlyPrice tokensPerMonth')
                .sort({ createdAt: -1 });

            return res.json({ requests });
        } catch (err) {
            return res.status(500).json({ error: 'Lỗi lấy danh sách yêu cầu: ' + err.message });
        }
    }
}

module.exports = PromoController;
