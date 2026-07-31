const express = require('express');
const router = express.Router();
const PlanAdminController = require('../../controllers/admin/planAdminController');
const { requirePermission } = require('../../middlewares/adminMiddleware');

router.get('/', requirePermission('plans_view'), PlanAdminController.getPlans);
router.post('/', requirePermission('plans_create'), PlanAdminController.createPlan);
router.put('/:id', requirePermission('plans_edit'), PlanAdminController.updatePlan);
router.delete('/:id', requirePermission('plans_delete'), PlanAdminController.deletePlan);

module.exports = router;
