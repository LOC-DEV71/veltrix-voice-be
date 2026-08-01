const express = require('express');
const router = express.Router();
const PageController = require('../../controllers/client/pageController');

router.get('/:slug', PageController.getPageContent);

module.exports = router;
