const express = require('express');
const router = express.Router();
const SettingAdminController = require('../../controllers/admin/settingAdminController');

router.get('/', SettingAdminController.getSettings);
router.put('/', SettingAdminController.updateSettings);
router.post('/test-email', SettingAdminController.sendTestEmail);

module.exports = router;
