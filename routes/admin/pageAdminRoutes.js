const express = require('express');
const router = express.Router();
const PageAdminController = require('../../controllers/admin/pageAdminController');

router.get('/:slug', PageAdminController.getPageContent);
router.put('/:slug', PageAdminController.updatePageContent);

module.exports = router;
