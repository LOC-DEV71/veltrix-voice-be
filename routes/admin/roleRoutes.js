const express = require('express');
const router = express.Router();
const RoleAdminController = require('../../controllers/admin/roleAdminController');
const { requirePermission } = require('../../middlewares/adminMiddleware');

// Permissions (Groups)
router.get('/permissions', requirePermission('roles_view'), RoleAdminController.getPermissionGroups);

// Roles
router.get('/', requirePermission('roles_view'), RoleAdminController.getRoles);
router.post('/', requirePermission('roles_create'), RoleAdminController.createRole);
router.put('/:id', requirePermission('roles_edit'), RoleAdminController.updateRole);
router.delete('/:id', requirePermission('roles_delete'), RoleAdminController.deleteRole);

module.exports = router;
