const express = require('express');
const router = express.Router();

const clientRoutes = require('./client');
const adminRoutes = require('./admin');

// Phân luồng chính
router.use('/client', clientRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
