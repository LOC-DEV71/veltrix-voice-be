const express = require('express');
const router = express.Router();
const SdkController = require('../../controllers/sdk/sdkController');

// CORS middleware riêng cho SDK để cho phép mọi domain (kể cả localhost, 127.0.0.1, hay domain ngoài) gọi API
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-api-key, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

router.get('/voices', SdkController.validateApiKey, SdkController.getVoices);
router.get('/history', SdkController.validateApiKey, SdkController.getHistory);
router.post('/preview', SdkController.validateApiKey, SdkController.previewTTS);
router.post('/generate', SdkController.validateApiKey, SdkController.generateTTS);

module.exports = router;
