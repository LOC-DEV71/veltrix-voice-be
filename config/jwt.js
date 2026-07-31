const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER || process.env.VERCEL || process.env.COOKIE_SECURE === 'true';

const COOKIE_OPTIONS = {
    httpOnly: true, // Chống XSS
    secure: isProduction, // Tự động bật true trên môi trường Deploy HTTPS (Render/Vercel)
    sameSite: isProduction ? 'none' : 'lax', // 'none' để gửi Cross-Domain Cookie giữa Vercel & Render
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
};

const CLEAR_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax'
};

module.exports = {
    JWT_SECRET: process.env.JWT_SECRET || 'achivoice_super_secret_key_2026',
    JWT_EXPIRES_IN: '7d',
    COOKIE_OPTIONS,
    CLEAR_COOKIE_OPTIONS
};
