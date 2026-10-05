const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');

router.get('/', companyController.getCompanies);
router.get('/:id', companyController.getCompanyById);
router.post('/', companyController.createCompany);
router.delete('/:id', companyController.deleteCompany);

module.exports = router;
