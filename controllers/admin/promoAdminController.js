const TiktokPromo = require('../../models/tiktokPromoModel');
const PromoConfig = require('../../models/promoConfigModel');
const User = require('../../models/userModel');
const Plan = require('../../models/planModel');
const Transaction = require('../../models/transactionModel');
const { uploadImageToCloudinary } = require('../../utils/cloudinary');
const { sendEmail } = require('../../utils/emailService');

class PromoAdminController {
    // Lấy tất cả các yêu cầu quảng bá TikTok
    static async getAllRequests(req, res) {
        try {
            const { status } = req.query;
            const query = {};
            if (status) query.status = status;

            const requests = await TiktokPromo.find(query)
                .populate('user', 'name email tier status tokens')
                .populate('plan', 'name code monthlyPrice tokensPerMonth maxCharsPerRequest')
                .sort({ createdAt: -1 });

            return res.json({ requests });
        } catch (err) {
            return res.status(500).json({ error: 'Lỗi lấy danh sách yêu cầu quảng bá: ' + err.message });
        }
    }

    // Duyệt yêu cầu quảng bá TikTok -> Tự động nâng cấp gói cho User & Gửi Email thông báo
    static async approveRequest(req, res) {
        try {
            const { id } = req.params;
            const { adminNote } = req.body;

            const promoRequest = await TiktokPromo.findById(id);
            if (!promoRequest) {
                return res.status(404).json({ error: 'Không tìm thấy yêu cầu' });
            }

            if (promoRequest.status === 'APPROVED') {
                return res.status(400).json({ error: 'Yêu cầu này đã được duyệt trước đó' });
            }

            const user = await User.findById(promoRequest.user);
            if (!user) {
                return res.status(404).json({ error: 'Người dùng không tồn tại' });
            }

            const plan = await Plan.findById(promoRequest.plan);
            if (!plan) {
                return res.status(404).json({ error: 'Gói dịch vụ không tồn tại' });
            }

            // 1. Nâng cấp Hạng (Tier) và Quyền lợi của User
            user.tier = plan.code;
            user.tokens = plan.tokensPerMonth || 2000000;
            user.dailyTokenLimit = plan.tokensPerMonth || 2000000;
            user.maxCharsPerRequest = plan.maxCharsPerRequest || 20000;

            // Lịch sử đăng ký của User
            user.subscriptionHistory.unshift({
                planName: `Gói ${plan.name} (TikTok Promotion)`,
                tier: plan.code,
                tokensGranted: plan.tokensPerMonth,
                price: '0 VNĐ (TikTok Promo)'
            });

            await user.save();

            // 2. Tạo lịch sử giao dịch trong Bảng Transaction
            const transactionCode = 'TKPROMO_' + Date.now() + '_' + Math.floor(1000 + Math.random() * 9000);
            await Transaction.create({
                user: user._id,
                plan: plan._id,
                transactionCode,
                planName: plan.name,
                tier: plan.code,
                amount: 0,
                priceFormatted: '0 VNĐ (TikTok Promo)',
                tokensGranted: plan.tokensPerMonth,
                paymentMethod: 'SYSTEM_PROMO',
                status: 'COMPLETED'
            });

            // 3. Cập nhật trạng thái Yêu cầu TikTok Promo
            promoRequest.status = 'APPROVED';
            promoRequest.adminNote = adminNote || 'Đã duyệt và nâng cấp gói thành công';
            promoRequest.approvedBy = req.account ? req.account._id : null;
            promoRequest.approvedAt = new Date();
            await promoRequest.save();

            // 4. Gửi Email thông báo chuẩn mẫu Veltrix Logo tới Khách hàng
            try {
                await sendEmail({
                    to: user.email,
                    subject: `Xác nhận kích hoạt gói ${plan.name} - Veltrix Voice`,
                    title: `Xác Nhận Kích Hoạt Gói`,
                    category: 'KÍCH HOẠT DỊCH VỤ',
                    greeting: `Xin chào,`,
                    messageHtml: `Tài khoản của bạn tại <b>Veltrix Voice</b> đã được phê duyệt thành công bài đăng quảng bá và nâng cấp lên gói <b>${plan.name}</b>.`,
                    codeLabel: 'SỐ TOKEN ĐƯỢC CẤP',
                    codeValue: `${(plan.tokensPerMonth || 200000).toLocaleString('vi-VN')} TOKEN`,
                    actionText: 'VÀO STUDIO TẠO GIỌNG NÓI',
                    actionUrl: 'http://localhost:5173/studio',
                    footerNote: adminNote ? `Ghi chú từ quản trị viên: ${adminNote}` : null
                });
            } catch (emailErr) {
                console.error("Không thể gửi email thông báo duyệt (có thể do chưa cấu hình SMTP):", emailErr.message);
            }

            return res.json({
                message: `Đã duyệt thành công! Người dùng [${user.email}] đã được nâng cấp lên gói [${plan.name}] & gửi Email thông báo.`,
                request: promoRequest
            });
        } catch (err) {
            return res.status(500).json({ error: 'Lỗi duyệt yêu cầu: ' + err.message });
        }
    }

    // Từ chối yêu cầu quảng bá TikTok
    static async rejectRequest(req, res) {
        try {
            const { id } = req.params;
            const { adminNote } = req.body;

            const promoRequest = await TiktokPromo.findById(id);
            if (!promoRequest) {
                return res.status(404).json({ error: 'Không tìm thấy yêu cầu' });
            }

            promoRequest.status = 'REJECTED';
            promoRequest.adminNote = adminNote || 'Từ chối (Video không hợp lệ hoặc thiếu hashtag)';
            await promoRequest.save();

            const user = await User.findById(promoRequest.user);
            if (user && user.email) {
                try {
                    await sendEmail({
                        to: user.email,
                        subject: `Thông báo về yêu cầu quảng bá - Veltrix Voice`,
                        title: `Yêu Cầu Chưa Được Thông Qua`,
                        category: 'THÔNG BÁO TỪ ADMIN',
                        greeting: `Xin chào,`,
                        messageHtml: `Yêu cầu kích hoạt gói cước quảng bá của bạn hiện chưa thể phê duyệt do thông tin bài đăng chưa hợp lệ.`,
                        detailsHtml: `
                            <div style="font-size: 13.5px; color: #dc2626;">
                                <b>Lý do chưa duyệt:</b> ${adminNote || 'Video/Hình ảnh chưa đúng yêu cầu hoặc thiếu Hashtag.'}
                            </div>
                        `,
                        actionText: 'GỬI LẠI YÊU CẦU MỚI',
                        actionUrl: 'http://localhost:5173/studio',
                        footerNote: 'Bạn vui lòng kiểm tra lại link bài đăng và cập nhật lại trên trang web nhé.'
                    });
                } catch (emailErr) {
                    console.error("Lỗi gửi email từ chối:", emailErr.message);
                }
            }

            return res.json({
                message: 'Đã từ chối yêu cầu thành công',
                request: promoRequest
            });
        } catch (err) {
            return res.status(500).json({ error: 'Lỗi từ chối yêu cầu: ' + err.message });
        }
    }

    // Lấy cấu hình chiến dịch quảng bá
    static async getConfig(req, res) {
        try {
            let config = await PromoConfig.findOne();
            if (!config) {
                config = await PromoConfig.create({
                    title: 'Sự Kiện Quảng Bá Nhận Gói Miễn Phí',
                    platformName: 'TikTok',
                    applicablePlans: [], // Trống = Áp dụng tất cả các gói
                    promoImageUrl: '',
                    hashtags: ['#VeltrixVoice', '#AIVoice', '#VoiceGenerator'],
                    instructions: '1. Tải ảnh quảng bá bên dưới về máy.\n2. Đăng video hoặc hình ảnh lên TikTok/Mạng xã hội kèm theo các hashtag quy định.\n3. Dán link bài đăng và email của bạn vào biểu mẫu bên dưới.\n4. Admin sẽ kiểm tra và kích hoạt gói cho bạn trong vòng 24h.',
                    instructionsEn: '1. Download the promo image below.\n2. Post video/image on TikTok/Social media with required hashtags.\n3. Paste your post link and email in the form below.\n4. Admin will review and activate your plan within 24 hours.',
                    isActive: true
                });
            }
            return res.json({ config });
        } catch (err) {
            return res.status(500).json({ error: 'Lỗi lấy cấu hình: ' + err.message });
        }
    }

    // Cập nhật cấu hình chiến dịch quảng bá (Up ảnh quảng bá + Hashtags + Hướng dẫn)
    static async updateConfig(req, res) {
        try {
            const { 
                title, 
                platformName, 
                applicablePlans, 
                promoImageBase64, 
                promoImageUrl, 
                hashtags, 
                instructions, 
                instructionsEn, 
                isActive 
            } = req.body;

            let config = await PromoConfig.findOne();
            if (!config) {
                config = new PromoConfig();
            }

            if (title !== undefined) config.title = title;
            if (platformName !== undefined) config.platformName = platformName;
            
            if (applicablePlans !== undefined) {
                config.applicablePlans = Array.isArray(applicablePlans) 
                    ? applicablePlans 
                    : applicablePlans.split(',').map(p => p.trim().toUpperCase()).filter(Boolean);
            }

            let finalImageUrl = config.promoImageUrl || '';

            // Nếu admin upload ảnh base64 mới
            if (promoImageBase64) {
                try {
                    finalImageUrl = await uploadImageToCloudinary(promoImageBase64);
                } catch (imgErr) {
                    return res.status(400).json({ error: 'Lỗi upload ảnh lên Cloudinary: ' + imgErr.message });
                }
            } else if (promoImageUrl !== undefined) {
                finalImageUrl = promoImageUrl;
            }

            config.promoImageUrl = finalImageUrl;

            if (hashtags !== undefined) {
                config.hashtags = Array.isArray(hashtags) ? hashtags : hashtags.split(',').map(h => h.trim()).filter(Boolean);
            }
            if (instructions !== undefined) config.instructions = instructions;
            if (instructionsEn !== undefined) config.instructionsEn = instructionsEn;
            if (isActive !== undefined) config.isActive = isActive;

            await config.save();

            return res.json({
                message: 'Cập nhật cấu hình chiến dịch quảng bá thành công!',
                config
            });
        } catch (err) {
            return res.status(500).json({ error: 'Lỗi cập nhật cấu hình: ' + err.message });
        }
    }
}

module.exports = PromoAdminController;
