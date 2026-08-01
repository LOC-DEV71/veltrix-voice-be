const express = require('express');
const router = express.Router();
const PageAdminController = require('../../controllers/admin/pageAdminController');
const { authenticateAdmin } = require('../../middlewares/adminMiddleware');

router.get('/:slug', authenticateAdmin, PageAdminController.getPageContent);
router.put('/:slug', authenticateAdmin, PageAdminController.updatePageContent);

module.exports = router;
