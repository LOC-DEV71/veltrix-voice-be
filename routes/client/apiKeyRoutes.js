const express = require('express');
const router = express.Router();
const ApiKeyController = require('../../controllers/client/apiKeyController');
const { authenticateToken } = require('../../middlewares/authMiddleware');

router.get('/', authenticateToken, ApiKeyController.getApiKeys);
router.post('/', authenticateToken, ApiKeyController.createApiKey);
router.put('/:id', authenticateToken, ApiKeyController.updateApiKey);
router.delete('/:id', authenticateToken, ApiKeyController.deleteApiKey);

module.exports = router;
