const express = require('express');
const router = express.Router();
const clientPlanController = require('../../controllers/client/planController');

router.get('/', clientPlanController.getPlans);

module.exports = router;
