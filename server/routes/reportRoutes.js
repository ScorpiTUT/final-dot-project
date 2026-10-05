const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/company/:companyId', reportController.getReportsByCompany);
router.get('/:id', reportController.getReportById);
router.post('/', reportController.createOrUpdateReport);
router.delete('/:id', reportController.deleteReport);

module.exports = router;
