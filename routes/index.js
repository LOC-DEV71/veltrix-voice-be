const express = require('express');
const router = express.Router();

const clientRoutes = require('./client');
const adminRoutes = require('./admin');
const sdkRoutes = require('./sdk/sdkRoutes');

// Phân luồng chính
router.use('/client', clientRoutes);
router.use('/admin', adminRoutes);
router.use('/sdk', sdkRoutes);

module.exports = router;
