const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error("Chưa cấu hình MONGO_URI trong file .env!");
        }

        const conn = await mongoose.connect(mongoUri);
        console.log(`🍃 Kết nối MongoDB Atlas thành công: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Lỗi kết nối MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
