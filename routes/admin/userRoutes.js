const express = require('express');
const router = express.Router();
const UserAdminController = require('../../controllers/admin/userAdminController');
const { requirePermission } = require('../../middlewares/adminMiddleware');

// Yêu cầu quyền 'users_view'
router.get('/', requirePermission('users_view'), UserAdminController.getAllUsers);

// Yêu cầu quyền 'users_edit'
router.put('/:userId', requirePermission('users_edit'), UserAdminController.updateUser);

// Yêu cầu quyền 'users_delete'
router.delete('/:userId', requirePermission('users_delete'), UserAdminController.deleteUser);

module.exports = router;
