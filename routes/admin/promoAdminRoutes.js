const express = require('express');
const router = express.Router();
const PromoAdminController = require('../../controllers/admin/promoAdminController');

// Lấy danh sách tất cả yêu cầu quảng bá TikTok
router.get('/requests', PromoAdminController.getAllRequests);

// Duyệt / Từ chối yêu cầu
router.put('/requests/:id/approve', PromoAdminController.approveRequest);
router.put('/requests/:id/reject', PromoAdminController.rejectRequest);

// Cấu hình chiến dịch quảng bá
router.get('/config', PromoAdminController.getConfig);
router.put('/config', PromoAdminController.updateConfig);

module.exports = router;
