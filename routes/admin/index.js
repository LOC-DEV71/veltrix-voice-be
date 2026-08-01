const express = require('express');
const router = express.Router();
const { authenticateAdminToken } = require('../../middlewares/adminMiddleware');

const accountRoutes = require('./accountRoutes');
const userRoutes = require('./userRoutes');
const statsRoutes = require('./statsRoutes');
const voiceRoutes = require('./voiceRoutes');
const planRoutes = require('./planRoutes');
const roleRoutes = require('./roleRoutes');
const promoAdminRoutes = require('./promoAdminRoutes');
const settingAdminRoutes = require('./settingAdminRoutes');
const pageAdminRoutes = require('./pageAdminRoutes');
const languageAdminRoutes = require('./languageAdminRoutes');

// 1. Account & Auth Routes (Tự xử lý public login và protected /me)
router.use('/auth', accountRoutes);

// 2. Toàn bộ các Admin Routes khác phải xác thực Token Admin trước
router.use(authenticateAdminToken);
router.use('/users', userRoutes);
router.use('/stats', statsRoutes);
router.use('/voices', voiceRoutes);
router.use('/plans', planRoutes);
router.use('/roles', roleRoutes);
router.use('/promos', promoAdminRoutes);
router.use('/settings', settingAdminRoutes);
router.use('/pages', pageAdminRoutes);
router.use('/languages', languageAdminRoutes);

module.exports = router;
