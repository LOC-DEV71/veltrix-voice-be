/**
 * Admin Seeder — Tạo PermissionGroup + Role SUPER_ADMIN + 1 tài khoản Admin
 * 
 * Chạy: node seeders/adminSeeder.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Role = require('../models/roleModel');
const Account = require('../models/accountModel');
const PermissionGroup = require('../models/permissionModel');
const Language = require('../models/languageModel');

// ========== DỮ LIỆU SEED ==========

const ADMIN_DATA = {
    name: 'Veltrix Admin',
    email: 'admin@veltrix.com',
    password: 'Admin@2026'
};

const PERMISSION_GROUPS = [
    {
        title: 'Quản lý Người dùng',
        key: 'users',
        permissions: [
            { label: 'Xem danh sách', value: 'users_view' },
            { label: 'Chỉnh sửa', value: 'users_edit' },
            { label: 'Xóa', value: 'users_delete' },
            { label: 'Điều chỉnh token', value: 'users_edit_tokens' }
        ]
    },
    {
        title: 'Quản lý Giọng đọc',
        key: 'voices',
        permissions: [
            { label: 'Xem danh sách', value: 'voices_view' },
            { label: 'Thêm mới', value: 'voices_create' },
            { label: 'Chỉnh sửa', value: 'voices_edit' },
            { label: 'Xóa', value: 'voices_delete' }
        ]
    },
    {
        title: 'Quản lý Gói dịch vụ',
        key: 'plans',
        permissions: [
            { label: 'Xem danh sách', value: 'plans_view' },
            { label: 'Thêm mới', value: 'plans_create' },
            { label: 'Chỉnh sửa', value: 'plans_edit' },
            { label: 'Xóa', value: 'plans_delete' }
        ]
    },
    {
        title: 'Quản lý Vai trò & Phân quyền',
        key: 'roles',
        permissions: [
            { label: 'Xem danh sách', value: 'roles_view' },
            { label: 'Thêm mới', value: 'roles_create' },
            { label: 'Chỉnh sửa', value: 'roles_edit' },
            { label: 'Xóa', value: 'roles_delete' },
            { label: 'Phân quyền', value: 'roles_permissions' }
        ]
    },
    {
        title: 'Quản lý Tài khoản Admin',
        key: 'accounts',
        permissions: [
            { label: 'Xem danh sách', value: 'accounts_view' },
            { label: 'Thêm mới', value: 'accounts_create' },
            { label: 'Chỉnh sửa', value: 'accounts_edit' },
            { label: 'Xóa', value: 'accounts_delete' }
        ]
    },
    {
        title: 'Thống kê & Báo cáo',
        key: 'dashboard',
        permissions: [
            { label: 'Xem Dashboard', value: 'dashboard_view' },
            { label: 'Xem thống kê doanh thu', value: 'dashboard_revenue' },
            { label: 'Xem thống kê người dùng', value: 'dashboard_users' }
        ]
    },
    {
        title: 'Cài đặt hệ thống',
        key: 'settings',
        permissions: [
            { label: 'Xem cài đặt', value: 'settings_view' },
            { label: 'Chỉnh sửa cài đặt', value: 'settings_edit' }
        ]
    }
];

const LANGUAGES = [
    { code: 'vi', name: 'Tiếng Việt', isDefault: true, isActive: true },
    { code: 'en', name: 'English', isDefault: false, isActive: true }
];

async function seedAdmin() {
    try {
        console.log('\n🌱 === ADMIN SEEDER BẮT ĐẦU ===\n');

        await mongoose.connect(process.env.MONGO_URI);
        console.log('🍃 Kết nối MongoDB Atlas thành công!\n');

        // ===== 1. Seed PermissionGroup =====
        console.log('📋 --- Seed Permission Groups ---');
        const allPermissionValues = [];

        for (const group of PERMISSION_GROUPS) {
            const existing = await PermissionGroup.findOne({ key: group.key });
            if (existing) {
                console.log(`   ⏭️  ${group.title} (${group.key}) — đã tồn tại`);
                existing.permissions.forEach(p => allPermissionValues.push(p.value));
            } else {
                const created = await PermissionGroup.create(group);
                console.log(`   ✅ ${created.title} (${created.key}) — ${created.permissions.length} quyền`);
                created.permissions.forEach(p => allPermissionValues.push(p.value));
            }
        }
        console.log(`   📊 Tổng quyền: ${allPermissionValues.length}\n`);

        // ===== 2. Seed Role SUPER_ADMIN =====
        console.log('🛡️  --- Seed Role SUPER_ADMIN ---');
        let role = await Role.findOne({ slug: 'super-admin' });
        if (!role) {
            role = await Role.create({
                title: 'Super Admin',
                description: 'Quản trị viên cao nhất — toàn quyền hệ thống',
                slug: 'super-admin',
                permissions: allPermissionValues
            });
            console.log(`   ✅ Tạo Role: ${role.title} (${role.slug}) — ${role.permissions.length} quyền`);
        } else {
            // Cập nhật quyền mới nhất nếu role đã tồn tại
            role.permissions = allPermissionValues;
            await role.save();
            console.log(`   🔄 Role ${role.title} đã tồn tại — cập nhật ${allPermissionValues.length} quyền`);
        }

        // ===== 3. Seed Account Admin =====
        console.log('\n👤 --- Seed Account Admin ---');
        const existingAdmin = await Account.findOne({ email: ADMIN_DATA.email });
        if (existingAdmin) {
            console.log(`   ⏭️  Admin ${ADMIN_DATA.email} đã tồn tại — bỏ qua`);
        } else {
            await Account.create({
                ...ADMIN_DATA,
                role: role._id
            });
            console.log(`   ✅ Tạo Admin thành công!`);
            console.log(`   📧 Email:    ${ADMIN_DATA.email}`);
            console.log(`   🔑 Password: ${ADMIN_DATA.password}`);
            console.log(`   🛡️  Role:     ${role.title} (${role.slug})`);
        }

        // ===== 4. Seed Languages =====
        console.log('\n🌐 --- Seed Languages ---');
        for (const lang of LANGUAGES) {
            const existingLang = await Language.findOne({ code: lang.code });
            if (existingLang) {
                console.log(`   ⏭️  Ngôn ngữ ${lang.name} (${lang.code}) đã tồn tại`);
            } else {
                await Language.create(lang);
                console.log(`   ✅ Tạo ngôn ngữ: ${lang.name} (${lang.code})`);
            }
        }

        console.log('\n🌱 === ADMIN SEEDER HOÀN TẤT ===\n');

    } catch (err) {
        console.error('❌ Admin Seeder lỗi:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seedAdmin();
