const jwt = require('jsonwebtoken');
const Account = require('../../models/accountModel');
const Role = require('../../models/roleModel');
const { JWT_SECRET, JWT_EXPIRES_IN, COOKIE_OPTIONS } = require('../../config/jwt');

class AccountAdminController {
    // 1. Đăng nhập Admin
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: 'Vui lòng nhập Email và Mật khẩu Admin!' });
            }

            const account = await Account.findOne({ email }).populate('role');
            if (!account) {
                return res.status(401).json({ error: 'Tài khoản Admin không tồn tại!' });
            }

            const isMatch = await account.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Mật khẩu Admin không chính xác!' });
            }

            const token = jwt.sign({ id: account._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

            res.cookie('admin_token', token, COOKIE_OPTIONS);

            return res.json({
                message: 'Đăng nhập Quản trị thành công!',
                token,
                account: {
                    id: account._id,
                    name: account.name,
                    email: account.email,
                    role: account.role,
                    status: account.status
                }
            });
        } catch (err) {
            return res.status(500).json({ error: 'Lỗi đăng nhập Admin: ' + err.message });
        }
    }

    // 2. Đăng xuất Admin
    static async logout(req, res) {
        res.clearCookie('admin_token', COOKIE_OPTIONS);
        return res.json({ message: 'Đã đăng xuất tài khoản Admin!' });
    }

    // 3. Lấy thông tin Admin hiện tại
    static async getMe(req, res) {
        return res.json({ account: req.account });
    }

    // 4. Lấy danh sách toàn bộ Accounts
    static async getAccounts(req, res) {
        try {
            const accounts = await Account.find().populate('role').sort({ createdAt: -1 });
            return res.json({ success: true, accounts });
        } catch (err) {
            return res.status(500).json({ error: 'Lỗi lấy danh sách tài khoản: ' + err.message });
        }
    }

    // 5. Tạo Account mới (Yêu cầu quyền accounts_create)
    static async createAccount(req, res) {
        try {
            const { name, email, password, role, status } = req.body;
            // Check email exist
            const existing = await Account.findOne({ email });
            if (existing) {
                return res.status(400).json({ error: 'Email đã tồn tại' });
            }
            const newAccount = await Account.create({ name, email, password, role, status });
            return res.status(201).json({ success: true, message: 'Tạo tài khoản thành công!', account: newAccount });
        } catch (err) {
            return res.status(500).json({ error: 'Lỗi tạo tài khoản: ' + err.message });
        }
    }

    // 6. Update Account (Yêu cầu quyền accounts_edit)
    static async updateAccount(req, res) {
        try {
            const accountId = req.params.id;
            const { name, email, password, role, status } = req.body;
            
            const account = await Account.findById(accountId);
            if (!account) {
                return res.status(404).json({ error: 'Không tìm thấy tài khoản' });
            }

            if (name) account.name = name;
            if (email) account.email = email;
            if (role) account.role = role;
            if (status) account.status = status;
            if (password) account.password = password; // pre-save hook will hash it

            await account.save();
            return res.json({ success: true, message: 'Cập nhật tài khoản thành công!', account });
        } catch (err) {
            return res.status(500).json({ error: 'Lỗi cập nhật tài khoản: ' + err.message });
        }
    }

    // 7. Delete Account (Yêu cầu quyền accounts_delete)
    static async deleteAccount(req, res) {
        try {
            const accountId = req.params.id;
            // Prevent deleting self
            if (req.account._id.toString() === accountId) {
                return res.status(400).json({ error: 'Không thể tự xóa tài khoản của chính mình' });
            }

            const deleted = await Account.findByIdAndDelete(accountId);
            if (!deleted) {
                return res.status(404).json({ error: 'Không tìm thấy tài khoản' });
            }
            return res.json({ success: true, message: 'Xóa tài khoản thành công!' });
        } catch (err) {
            return res.status(500).json({ error: 'Lỗi xóa tài khoản: ' + err.message });
        }
    }
}

module.exports = AccountAdminController;
