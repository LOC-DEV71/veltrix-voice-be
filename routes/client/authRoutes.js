const express = require('express');
const router = express.Router();
const ClientAuthController = require('../../controllers/client/authController');
const { authenticateToken } = require('../../middlewares/authMiddleware');

router.post('/consent-ip', ClientAuthController.consentIp);
router.post('/register', ClientAuthController.register);
router.post('/login', ClientAuthController.login);
router.post('/google', ClientAuthController.googleLogin);
router.post('/logout', ClientAuthController.logout);
router.get('/me', authenticateToken, ClientAuthController.getMe);

module.exports = router;
