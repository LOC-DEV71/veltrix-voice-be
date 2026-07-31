const express = require('express');
const router = express.Router();
const ClientTtsController = require('../../controllers/client/ttsController');
const { authenticateToken } = require('../../middlewares/authMiddleware');
const { checkTtsAttributes } = require('../../middlewares/rbacMiddleware');

router.post('/preview', authenticateToken, ClientTtsController.preview);
router.post('/generate', authenticateToken, checkTtsAttributes, ClientTtsController.generate);
router.get('/history', authenticateToken, ClientTtsController.getHistory);
router.delete('/history/:id', authenticateToken, ClientTtsController.deleteHistory);

module.exports = router;
