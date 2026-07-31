const express = require('express');
const router = express.Router();
const AccountAdminController = require('../../controllers/admin/accountAdminController');
const { authenticateAdminToken, requirePermission } = require('../../middlewares/adminMiddleware');

// Đăng nhập / Đăng xuất Admin (Công khai trong vùng Admin)
router.post('/login', AccountAdminController.login);
router.post('/logout', AccountAdminController.logout);

// Các route bên dưới bắt buộc phải xác thực Token Admin
router.use(authenticateAdminToken);

router.get('/me', AccountAdminController.getMe);
router.get('/', requirePermission('accounts_view'), AccountAdminController.getAccounts);
router.post('/', requirePermission('accounts_create'), AccountAdminController.createAccount);
router.put('/:id', requirePermission('accounts_edit'), AccountAdminController.updateAccount);
router.delete('/:id', requirePermission('accounts_delete'), AccountAdminController.deleteAccount);

module.exports = router;
