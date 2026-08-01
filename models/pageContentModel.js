const mongoose = require('mongoose');

const pageContentSchema = new mongoose.Schema({
    slug: {
        type: String,
        required: true,
        unique: true,
        index: true,
        default: 'landing'
    },
    // Hero Banner Section
    heroBadgeVi: { type: String, default: 'Công Nghệ Chuyển Văn Bản Thành Giọng Nói AI Đỉnh Cao' },
    heroBadgeEn: { type: String, default: 'Top-tier AI Text-to-Speech Technology' },
    heroTitleVi: { type: String, default: 'Tạo Giọng Đọc AI' },
    heroTitleEn: { type: String, default: 'Create AI Voices' },
    heroTitleHl1Vi: { type: String, default: 'Sống Động' },
    heroTitleHl1En: { type: String, default: 'Vivid' },
    heroTitleHl2Vi: { type: String, default: 'Tự Nhiên Như Người Thật' },
    heroTitleHl2En: { type: String, default: 'Natural as Human' },
    heroSubtitleVi: { type: String, default: 'Nền tảng Veltrix Voice giúp bạn biến mọi văn bản thành file âm thanh MP3 chất lượng cao chỉ trong vài giây. Phù hợp làm video YouTube, TikTok, Đọc sách nói & Quảng cáo.' },
    heroSubtitleEn: { type: String, default: 'Veltrix Voice platform helps you turn any text into high-quality MP3 audio in seconds. Perfect for YouTube, TikTok, Audiobooks & Ads.' },
    heroCtaMainVi: { type: String, default: 'Dùng Thử Ngay Bây Giờ' },
    heroCtaMainEn: { type: String, default: 'Try It Now' },
    heroCtaSecondaryVi: { type: String, default: 'Nghe Mẫu Giọng Đọc' },
    heroCtaSecondaryEn: { type: String, default: 'Listen to Samples' },
    
    // Features Section
    featuresTagVi: { type: String, default: 'TÍNH NĂNG VƯỢT TRỘI' },
    featuresTagEn: { type: String, default: 'OUTSTANDING FEATURES' },
    featuresTitleVi: { type: String, default: 'Tại Sao Nên Chọn Veltrix Voice?' },
    featuresTitleEn: { type: String, default: 'Why Choose Veltrix Voice?' },
    
    card1TitleVi: { type: String, default: 'Giọng Đọc Neural AI' },
    card1TitleEn: { type: String, default: 'Neural AI Voices' },
    card1DescVi: { type: String, default: 'Mô hình học sâu tiên tiến phát âm chuẩn ngắt nghỉ, giữ ngữ điệu cảm xúc tự nhiên 99% như giọng người thật.' },
    card1DescEn: { type: String, default: 'Advanced deep learning models pronounce accurately with pauses, maintaining 99% natural emotional intonation like human voices.' },
    
    card2TitleVi: { type: String, default: 'Xử Lý Siêu Tốc' },
    card2TitleEn: { type: String, default: 'Lightning Fast' },
    card2DescVi: { type: String, default: 'Hệ thống Server Cloud mạnh mẽ giúp chuyển đổi văn bản 1,000 ký tự thành MP3 chỉ trong chưa đầy 2 giây.' },
    card2DescEn: { type: String, default: 'Powerful Cloud Server system converts 1,000 characters of text into MP3 in less than 2 seconds.' },
    
    card3TitleVi: { type: String, default: 'Bản Quyền Thương Mại' },
    card3TitleEn: { type: String, default: 'Commercial Rights' },
    card3DescVi: { type: String, default: 'Sử dụng file MP3 tạo ra cho các dự án kiếm tiền YouTube, TikTok Ads mà không lo bị vi phạm bản quyền.' },
    card3DescEn: { type: String, default: 'Use the generated MP3 files for monetized YouTube and TikTok Ads projects without worrying about copyright infringement.' },

    // FAQ Section
    faqTagVi: { type: String, default: 'GIẢI ĐÁP THẮC MẮC' },
    faqTagEn: { type: String, default: 'FREQUENTLY ASKED QUESTIONS' },
    faqTitleVi: { type: String, default: 'Câu Hỏi Thường Gặp (FAQ)' },
    faqTitleEn: { type: String, default: 'Frequently Asked Questions (FAQ)' },
    
    faqQ1Vi: { type: String, default: 'Giọng đọc AI tại đây có bản quyền không?' },
    faqQ1En: { type: String, default: 'Are AI generated voices royalty-free?' },
    faqA1Vi: { type: String, default: 'Tất cả các file âm thanh được tạo ra tại Veltrix Voice đều thuộc quyền sở hữu của bạn. Bạn hoàn toàn có thể sử dụng làm video thương mại trên YouTube, TikTok, Facebook mà không lo vi phạm bản quyền.' },
    faqA1En: { type: String, default: 'All audio files generated on Veltrix Voice belong entirely to you. You can use them freely on commercial videos for YouTube, TikTok, Facebook without copyright issues.' },

    faqQ2Vi: { type: String, default: 'Cách tính hạn mức sử dụng như thế nào?' },
    faqQ2En: { type: String, default: 'How does the daily character limit work?' },
    faqA2Vi: { type: String, default: 'Mỗi tài khoản miễn phí sẽ được cấp hạn mức 2,000 ký tự mỗi ngày. Hạn mức sẽ tự động được làm mới lại 2,000 ký tự vào 00:00 đêm hàng ngày.' },
    faqA2En: { type: String, default: 'Every free account is granted 2,000 characters daily. The character limit is automatically reset to 2,000 characters at 00:00 UTC daily.' },

    // Footer Section
    footerVi: { type: String, default: '© 2026 Veltrix Voice Platform. Tất cả quyền được bảo lưu. Phát triển trên nền tảng React & Node.js MVC.' },
    footerEn: { type: String, default: '© 2026 Veltrix Voice Platform. All rights reserved. Built with React & Node.js.' }
}, {
    timestamps: true
});

module.exports = mongoose.model('PageContent', pageContentSchema);
