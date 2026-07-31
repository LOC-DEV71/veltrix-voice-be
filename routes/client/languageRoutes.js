const express = require('express');
const router = express.Router();
const ClientLanguageController = require('../../controllers/client/languageController');

// Lấy danh sách ngôn ngữ công khai
router.get('/', ClientLanguageController.getLanguages);

module.exports = router;
