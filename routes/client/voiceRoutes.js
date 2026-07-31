const express = require('express');
const router = express.Router();
const ClientVoiceController = require('../../controllers/client/voiceController');
const { authenticateToken } = require('../../middlewares/authMiddleware');

router.get('/', (req, res, next) => {
    if (req.cookies.token || req.headers.authorization) {
        return authenticateToken(req, res, next);
    }
    next();
}, ClientVoiceController.getVoices);

module.exports = router;
