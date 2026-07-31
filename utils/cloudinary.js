const cloudinary = require('cloudinary').v2;
const Setting = require('../models/settingModel');

/**
 * Tự động cấu hình Cloudinary động từ MongoDB Database (nếu chưa cài thì dùng env dự phòng)
 */
const configureCloudinary = async () => {
    try {
        const setting = await Setting.findOne();
        if (setting && setting.cloudinaryCloudName && setting.cloudinaryApiKey && setting.cloudinaryApiSecret) {
            cloudinary.config({
                cloud_name: setting.cloudinaryCloudName,
                api_key: setting.cloudinaryApiKey,
                api_secret: setting.cloudinaryApiSecret
            });
            return;
        }
    } catch (err) {
        console.error('Lỗi lấy cấu hình Cloudinary từ Database:', err.message);
    }

    // Dự phòng dùng biến môi trường .env nếu chưa lưu trong Database
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
};

/**
 * Upload Audio Buffer lên Cloudinary nhận về URL MP3 vĩnh viễn
 */
const uploadAudioBufferToCloudinary = async (buffer) => {
    await configureCloudinary();
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'video', // Trong Cloudinary, file âm thanh MP3 được xếp vào resource_type: 'video' hoặc 'auto'
                folder: 'veltrix_voice_audios',
                format: 'mp3'
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
            }
        );
        uploadStream.end(buffer);
    });
};

/**
 * Upload Ảnh lên Cloudinary nhận về URL vĩnh viễn
 */
const uploadImageToCloudinary = async (base64OrUrl) => {
    await configureCloudinary();
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
            base64OrUrl,
            { folder: 'veltrix_promo_images' },
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
            }
        );
    });
};

module.exports = { cloudinary, configureCloudinary, uploadAudioBufferToCloudinary, uploadImageToCloudinary };
