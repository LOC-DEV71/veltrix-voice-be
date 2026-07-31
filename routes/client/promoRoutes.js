const express = require('express');
const router = express.Router();
const PromoController = require('../../controllers/client/promoController');
const { authenticateToken } = require('../../middlewares/authMiddleware');

// Public hoặc Client: Xem cấu hình chiến dịch quảng bá hiện tại
router.get('/config', PromoController.getConfig);

// Protected Client Routes:
router.post('/submit', authenticateToken, PromoController.submitRequest);
router.get('/my-requests', authenticateToken, PromoController.getMyRequests);

module.exports = router;
