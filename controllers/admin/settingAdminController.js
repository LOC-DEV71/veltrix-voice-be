const Setting = require('../../models/settingModel');
const { sendEmail } = require('../../utils/emailService');

class SettingAdminController {
    // Lấy toàn bộ cài đặt hệ thống
    static async getSettings(req, res) {
        try {
            let setting = await Setting.findOne();
            if (!setting) {
                setting = await Setting.create({
                    donateBankId: 'MB',
                    donateAccountNo: '0912572421202',
                    donateAccountName: 'LÂM CHÍ LỘC'
                });
            }
            return res.json({ setting });
        } catch (err) {
            return res.status(500).json({ error: 'Lỗi lấy cài đặt hệ thống: ' + err.message });
        }
    }

    // Cập nhật cài đặt hệ thống
    static async updateSettings(req, res) {
        try {
            const {
                donateBankId,
                donateAccountNo,
                donateAccountName,
                googleClientId,
                googleClientSecret,
                cloudinaryCloudName,
                cloudinaryApiKey,
                cloudinaryApiSecret,
                smtpHost,
                smtpPort,
                smtpUser,
                smtpPass,
                smtpSecure,
                smtpFromName,
                siteName,
                contactEmail,
                maintenanceMode,
                awsAccessKeyId,
                awsSecretAccessKey,
                awsRegion,
                azureSpeechKey,
                azureRegion,
                googleTtsApiKey
            } = req.body;

            let setting = await Setting.findOne();
            if (!setting) {
                setting = new Setting();
            }

            if (donateBankId !== undefined) setting.donateBankId = donateBankId;
            if (donateAccountNo !== undefined) setting.donateAccountNo = donateAccountNo;
            if (donateAccountName !== undefined) setting.donateAccountName = donateAccountName;

            if (googleClientId !== undefined) setting.googleClientId = googleClientId;
            if (googleClientSecret !== undefined) setting.googleClientSecret = googleClientSecret;

            if (cloudinaryCloudName !== undefined) setting.cloudinaryCloudName = cloudinaryCloudName;
            if (cloudinaryApiKey !== undefined) setting.cloudinaryApiKey = cloudinaryApiKey;
            if (cloudinaryApiSecret !== undefined) setting.cloudinaryApiSecret = cloudinaryApiSecret;

            if (smtpHost !== undefined) setting.smtpHost = smtpHost;
            if (smtpPort !== undefined) setting.smtpPort = smtpPort;
            if (smtpUser !== undefined) setting.smtpUser = smtpUser;
            if (smtpPass !== undefined) setting.smtpPass = smtpPass;
            if (smtpSecure !== undefined) setting.smtpSecure = smtpSecure;
            if (smtpFromName !== undefined) setting.smtpFromName = smtpFromName;

            if (siteName !== undefined) setting.siteName = siteName;
            if (contactEmail !== undefined) setting.contactEmail = contactEmail;
            if (maintenanceMode !== undefined) setting.maintenanceMode = maintenanceMode;

            if (awsAccessKeyId !== undefined) setting.awsAccessKeyId = awsAccessKeyId;
            if (awsSecretAccessKey !== undefined) setting.awsSecretAccessKey = awsSecretAccessKey;
            if (awsRegion !== undefined) setting.awsRegion = awsRegion;

            if (azureSpeechKey !== undefined) setting.azureSpeechKey = azureSpeechKey;
            if (azureRegion !== undefined) setting.azureRegion = azureRegion;
            if (googleTtsApiKey !== undefined) setting.googleTtsApiKey = googleTtsApiKey;

            await setting.save();

            return res.json({
                message: 'Cập nhật cài đặt hệ thống thành công!',
                setting
            });
        } catch (err) {
            return res.status(500).json({ error: 'Lỗi cập nhật cài đặt: ' + err.message });
        }
    }

    // Gửi Email thử nghiệm
    static async sendTestEmail(req, res) {
        try {
            const { targetEmail } = req.body;
            const setting = await Setting.findOne();

            if (!setting || !setting.smtpUser || !setting.smtpPass) {
                return res.status(400).json({ error: 'Chưa cấu hình Email Gửi Đi và Mật Khẩu Ứng Dụng SMTP!' });
            }

            const recipient = targetEmail || setting.smtpUser;

            await sendEmail({
                to: recipient,
                subject: 'Xác nhận kiểm tra Email - Veltrix Voice',
                title: 'Mã Kích Hoạt Thử Nghiệm',
                category: 'BẢO MẶT TÀI KHOẢN',
                greeting: 'Xin chào Quản trị viên,',
                messageHtml: `Đây là thư gửi thử nghiệm xác thực kết nối máy chủ gửi email SMTP tại <b>Veltrix Voice</b>.`,
                codeLabel: 'MÃ XÁC THỰC CỦA BẠN',
                codeValue: '5 9 9 7 6 5',
                actionText: 'VÀO STUDIO NGAY',
                actionUrl: `${process.env.CLIENT_URL || 'https://veltrixvoice.autos'}/studio`,
                footerNote: 'Đây là thư kiểm tra tự động từ Admin Settings.'
            });

            return res.json({ message: `Đã gửi Email thử nghiệm thành công tới [${recipient}]!` });
        } catch (err) {
            return res.status(500).json({ error: 'Lỗi gửi email thử nghiệm: ' + err.message });
        }
    }
}

module.exports = SettingAdminController;
