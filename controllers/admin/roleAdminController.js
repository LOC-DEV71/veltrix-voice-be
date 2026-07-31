const Role = require('../../models/roleModel');
const PermissionGroup = require('../../models/permissionModel');

class RoleAdminController {
    // 1. Get all roles
    static async getRoles(req, res) {
        try {
            const roles = await Role.find().sort({ createdAt: -1 });
            return res.json({ success: true, roles });
        } catch (error) {
            console.error('Lỗi lấy danh sách nhóm quyền:', error);
            return res.status(500).json({ error: 'Lỗi server khi lấy danh sách nhóm quyền' });
        }
    }

    // 2. Get permission groups (for creating/editing roles)
    static async getPermissionGroups(req, res) {
        try {
            const groups = await PermissionGroup.find().sort({ title: 1 });
            return res.json({ success: true, groups });
        } catch (error) {
            console.error('Lỗi lấy danh sách quyền:', error);
            return res.status(500).json({ error: 'Lỗi server khi lấy danh sách quyền' });
        }
    }

    // 3. Create role
    static async createRole(req, res) {
        try {
            const newRole = new Role(req.body);
            await newRole.save();
            return res.json({ success: true, role: newRole, message: 'Thêm nhóm quyền thành công' });
        } catch (error) {
            console.error('Lỗi thêm nhóm quyền:', error);
            return res.status(500).json({ error: 'Lỗi server khi thêm nhóm quyền' });
        }
    }

    // 4. Update role
    static async updateRole(req, res) {
        try {
            const roleId = req.params.id;
            const updatedRole = await Role.findByIdAndUpdate(roleId, req.body, { new: true });
            if (!updatedRole) {
                return res.status(404).json({ error: 'Không tìm thấy nhóm quyền' });
            }
            return res.json({ success: true, role: updatedRole, message: 'Cập nhật nhóm quyền thành công' });
        } catch (error) {
            console.error('Lỗi cập nhật nhóm quyền:', error);
            return res.status(500).json({ error: 'Lỗi server khi cập nhật nhóm quyền' });
        }
    }

    // 5. Delete role
    static async deleteRole(req, res) {
        try {
            const roleId = req.params.id;
            // Prevent deleting super-admin
            const role = await Role.findById(roleId);
            if (role && role.slug === 'super-admin') {
                return res.status(400).json({ error: 'Không thể xóa nhóm quyền Super Admin' });
            }

            const deletedRole = await Role.findByIdAndDelete(roleId);
            if (!deletedRole) {
                return res.status(404).json({ error: 'Không tìm thấy nhóm quyền' });
            }
            return res.json({ success: true, message: 'Xóa nhóm quyền thành công' });
        } catch (error) {
            console.error('Lỗi xóa nhóm quyền:', error);
            return res.status(500).json({ error: 'Lỗi server khi xóa nhóm quyền' });
        }
    }
}

module.exports = RoleAdminController;
