const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const voiceRoutes = require('./voiceRoutes');
const ttsRoutes = require('./ttsRoutes');
const languageRoutes = require('./languageRoutes');
const planRoutes = require('./planRoutes');
const promoRoutes = require('./promoRoutes');
const settingRoutes = require('./settingRoutes');
const apiKeyRoutes = require('./apiKeyRoutes');

router.use('/auth', authRoutes);
router.use('/voices', voiceRoutes);
router.use('/tts', ttsRoutes);
router.use('/languages', languageRoutes);
router.use('/plans', planRoutes);
router.use('/promo', promoRoutes);
router.use('/settings', settingRoutes);
router.use('/apikeys', apiKeyRoutes);

module.exports = router;
