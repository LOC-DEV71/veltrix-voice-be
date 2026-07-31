const express = require('express');
const router = express.Router();
const clientPlanController = require('../../controllers/client/planController');
const { authenticateToken } = require('../../middlewares/authMiddleware');

router.get('/', clientPlanController.getPlans);
router.post('/switch', authenticateToken, clientPlanController.switchPlan);

module.exports = router;
