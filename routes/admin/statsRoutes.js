const express = require('express');
const router = express.Router();
const StatsAdminController = require('../../controllers/admin/statsAdminController');
const { requirePermission } = require('../../middlewares/adminMiddleware');

router.get('/', requirePermission('dashboard_view'), StatsAdminController.getDashboardStats);

module.exports = router;
