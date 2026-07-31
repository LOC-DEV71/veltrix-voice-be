const express = require('express');
const router = express.Router();
const SettingController = require('../../controllers/client/settingController');

router.get('/public', SettingController.getPublicSettings);

module.exports = router;
