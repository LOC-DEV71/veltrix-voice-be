const nodemailer = require('nodemailer');
const Setting = require('../models/settingModel');

// Logo chính thức của Veltrix
const VELTRIX_LOGO_URL = 'https://veltrix-social-fe.vercel.app/assets/logo-veltrix-Cwe8EsKX.png';

/**
 * Mẫu Email Chuẩn Veltrix Logo (Giống hệt mẫu email Veltrix Gear)
 */
function renderHtmlTemplate({ title, category, greeting, messageHtml, codeValue, codeLabel, detailsHtml, actionText, actionUrl, footerNote }) {
    return `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title || 'Veltrix Voice'}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #eff3f8;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #1e293b;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
        }
        .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #eff3f8;
            padding: 40px 12px;
        }
        .main-card {
            max-width: 520px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
            border: 1px solid #e2e8f0;
        }
        .header-banner {
            background: linear-gradient(180deg, #090d16 0%, #111827 100%);
            padding: 36px 20px 28px 20px;
            text-align: center;
        }
        .logo-img {
            width: 60px;
            height: auto;
            display: block;
            margin: 0 auto 12px auto;
        }
        .category-subtitle {
            font-size: 11.5px;
            font-weight: 700;
            color: #94a3b8;
            letter-spacing: 3px;
            text-transform: uppercase;
            margin: 0;
        }
        .body-content {
            padding: 36px 28px;
            text-align: center;
        }
        .email-title {
            font-size: 24px;
            font-weight: 800;
            color: #0f172a;
            margin: 0;
        }
        .accent-line {
            width: 44px;
            height: 4px;
            background-color: #00a2ff;
            margin: 10px auto 20px auto;
            border-radius: 2px;
        }
        .greeting {
            font-size: 15px;
            color: #64748b;
            margin-bottom: 12px;
        }
        .description-text {
            font-size: 14.5px;
            color: #334155;
            margin-bottom: 24px;
            line-height: 1.6;
        }
        .blue-code-box {
            background-color: #f0f8ff;
            border: 1px solid #cce5ff;
            border-radius: 16px;
            padding: 24px;
            margin: 20px 0;
            text-align: center;
        }
        .code-label {
            font-size: 11.5px;
            font-weight: 700;
            color: #64748b;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-bottom: 8px;
        }
        .code-display {
            font-size: 32px;
            font-weight: 800;
            color: #0084ff;
            letter-spacing: 3px;
            margin: 0;
        }
        .btn-action {
            display: inline-block;
            background-color: #0084ff;
            color: #ffffff !important;
            font-size: 14.5px;
            font-weight: 700;
            padding: 13px 32px;
            border-radius: 12px;
            text-decoration: none;
            margin-top: 12px;
            box-shadow: 0 4px 12px rgba(0, 132, 255, 0.3);
        }
        .footer-note {
            font-size: 12.5px;
            color: #64748b;
            margin-top: 20px;
            padding-top: 16px;
            border-top: 1px dashed #e2e8f0;
            text-align: center;
        }
        .footer-bottom {
            background-color: #f8fafc;
            padding: 20px 28px;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
            border-top: 1px solid #f1f5f9;
        }
        .footer-bottom a {
            color: #0084ff;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="main-card">
            <!-- Header Banner với Logo Veltrix Chính Thức -->
            <div class="header-banner">
                <img src="${VELTRIX_LOGO_URL}" alt="Veltrix Logo" class="logo-img" />
                <div class="category-subtitle">${category || 'THÔNG BÁO HỆ THỐNG'}</div>
            </div>

            <!-- Nội dung chính -->
            <div class="body-content">
                <h1 class="email-title">${title}</h1>
                <div class="accent-line"></div>

                ${greeting ? `<div class="greeting">${greeting}</div>` : ''}

                <div class="description-text">
                    ${messageHtml}
                </div>

                ${codeValue ? `
                    <div class="blue-code-box">
                        <div class="code-label">${codeLabel || 'MÃ XÁC THỰC CỦA BẠN'}</div>
                        <div class="code-display">${codeValue}</div>
                    </div>
                ` : ''}

                ${detailsHtml ? `
                    <div class="blue-code-box" style="text-align: left; padding: 18px 24px;">
                        ${detailsHtml}
                    </div>
                ` : ''}

                ${actionUrl && actionText ? `
                    <div style="margin-top: 20px;">
                        <a href="${actionUrl}" class="btn-action" target="_blank">${actionText} →</a>
                    </div>
                ` : ''}

                ${footerNote ? `
                    <div class="footer-note">
                        ${footerNote}
                    </div>
                ` : ''}
            </div>

            <!-- Footer Chân Trang -->
            <div class="footer-bottom">
                <p style="margin: 0 0 6px 0;">Đây là thông báo tự động từ tài khoản của bạn tại <b>Veltrix Voice</b>.</p>
                <p style="margin: 0;">Cần hỗ trợ? Email cho chúng tôi tại <a href="mailto:support@veltrix.ai">support@veltrix.ai</a></p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
}

/**
 * Khởi tạo Transporter động từ Database MongoDB
 */
async function createTransporter() {
    const setting = await Setting.findOne();
    const smtpUser = setting?.smtpUser || process.env.SMTP_USER || process.env.EMAIL_USER;
    const smtpPass = setting?.smtpPass || process.env.SMTP_PASS || process.env.EMAIL_PASS;
    const smtpHost = setting?.smtpHost || process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = setting?.smtpPort || process.env.SMTP_PORT || 587;
    const smtpSecure = setting?.smtpSecure ?? false;
    const senderName = setting?.smtpFromName || setting?.siteName || 'Veltrix Voice';

    if (!smtpUser || !smtpPass) {
        throw new Error("Hệ thống chưa cài đặt Email Gửi Đi (SMTP_USER/SMTP_PASS) trong Admin Settings hoặc file .env!");
    }

    return {
        transporter: nodemailer.createTransport({
            host: smtpHost,
            port: Number(smtpPort),
            secure: Boolean(smtpSecure),
            pool: true,
            connectionTimeout: 10000,
            greetingTimeout: 5000,
            socketTimeout: 10000,
            auth: {
                user: smtpUser,
                pass: smtpPass
            }
        }),
        senderName: senderName,
        senderEmail: smtpUser
    };
}

/**
 * Gửi email sử dụng Mẫu Email Logo Veltrix Chính Thức
 */
async function sendEmail({ to, subject, title, category, greeting, messageHtml, codeValue, codeLabel, detailsHtml, actionText, actionUrl, footerNote }) {
    const { transporter, senderName, senderEmail } = await createTransporter();

    const htmlContent = renderHtmlTemplate({
        title,
        category,
        greeting,
        messageHtml,
        codeValue,
        codeLabel,
        detailsHtml,
        actionText,
        actionUrl,
        footerNote
    });

    const textFallback = `${greeting || 'Xin chào'},\n\n${messageHtml ? messageHtml.replace(/<[^>]*>?/gm, '') : ''}\n\n${codeValue ? `MÃ SỐ BẢO MẬT: ${codeValue}\n` : ''}${actionUrl ? `${actionText || 'Xác nhận'}: ${actionUrl}\n\n` : ''}${footerNote || ''}`;

    const info = await transporter.sendMail({
        from: `"${senderName}" <${senderEmail}>`,
        replyTo: `"${senderName}" <${senderEmail}>`,
        to,
        subject,
        text: textFallback,
        html: htmlContent,
        headers: {
            'X-Priority': '1 (Highest)',
            'X-MSMail-Priority': 'High',
            'Importance': 'High'
        }
    });

    return info;
}

module.exports = {
    renderHtmlTemplate,
    createTransporter,
    sendEmail
};
