require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Role = require('../models/roleModel');
const Account = require('../models/accountModel');

async function seedData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("🍃 Đã kết nối MongoDB Atlas để Seed dữ liệu...");

        // 1. Kiểm tra hoặc Tạo Role SUPER_ADMIN
        let superAdminRole = await Role.findOne({ name: 'SUPER_ADMIN' });
        if (!superAdminRole) {
            superAdminRole = await Role.create({
                name: 'SUPER_ADMIN',
                description: 'Toàn quyền quản trị hệ thống',
                permissions: ['view_users', 'edit_tokens', 'delete_users', 'view_stats', 'manage_roles']
            });
            console.log("✅ Đã khởi tạo Role [SUPER_ADMIN] với đầy đủ Permissions.");
        }

        // 2. Kiểm tra hoặc Tạo Role SUPPORT_STAFF (Nhân viên hỗ trợ - Không có quyền xóa user)
        let supportRole = await Role.findOne({ name: 'SUPPORT_STAFF' });
        if (!supportRole) {
            supportRole = await Role.create({
                name: 'SUPPORT_STAFF',
                description: 'Nhân viên hỗ trợ khách hàng',
                permissions: ['view_users', 'edit_tokens', 'view_stats'] // Không có delete_users
            });
            console.log("✅ Đã khởi tạo Role [SUPPORT_STAFF].");
        }

        // 3. Tạo Admin Account gắn roleId của SUPER_ADMIN
        let adminAccount = await Account.findOne({ email: 'admin@gmail.com' });
        if (!adminAccount) {
            adminAccount = await Account.create({
                name: 'Quản Trị Viên Tối Cao',
                email: 'admin@gmail.com',
                password: 'admin123', // Tự động hash bcrypt qua pre-save hook
                role: superAdminRole._id, // Lưu ID của Role
                status: 'ACTIVE'
            });
            console.log("✅ Đã khởi tạo Admin Account [admin@gmail.com] liên kết Role ID thành công.");
        } else {
            console.log("ℹ️ Admin Account [admin@gmail.com] đã tồn tại.");
        }

        process.exit(0);
    } catch (err) {
        console.error("❌ Lỗi Seed Data:", err);
        process.exit(1);
    }
}

seedData();
