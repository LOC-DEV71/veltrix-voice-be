const express = require('express');
const router = express.Router();
const LanguageAdminController = require('../../controllers/admin/languageAdminController');

router.get('/', LanguageAdminController.getLanguages);
router.post('/', LanguageAdminController.createLanguage);
router.put('/:id', LanguageAdminController.updateLanguage);
router.delete('/:id', LanguageAdminController.deleteLanguage);

module.exports = router;
