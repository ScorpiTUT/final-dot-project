const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/trends/:companyId', analyticsController.getCompanyTrends);
router.post('/scenario', analyticsController.simulateScenario);

module.exports = router;
