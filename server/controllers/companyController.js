const Company = require('../models/Company');
const FinancialReport = require('../models/FinancialReport');

// GET /api/companies - List all companies with quick summary
exports.getCompanies = async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    
    // Attach latest report summary to each company
    const enhancedCompanies = await Promise.all(
      companies.map(async (comp) => {
        const latestReport = await FinancialReport.findOne({ companyId: comp._id })
          .sort({ fiscalYear: -1, period: -1 });
        
        const reportCount = await FinancialReport.countDocuments({ companyId: comp._id });

        return {
          ...comp.toObject(),
          reportCount,
          latestReport: latestReport
            ? {
                _id: latestReport._id,
                periodLabel: latestReport.periodLabel,
                totalAssets: latestReport.assets.totalAssets,
                totalDebt: latestReport.liabilities.totalDebt,
                netProfit: latestReport.incomeStatement.netProfit,
                revenue: latestReport.incomeStatement.revenue,
                isBalanced: latestReport.validation.isBalanced,
                debtToEquity: latestReport.metrics.debtToEquity,
                netMargin: latestReport.metrics.netMargin,
                solvencyZone: latestReport.metrics.solvencyZone,
              }
            : null,
        };
      })
    );

    res.json({ success: true, count: enhancedCompanies.length, data: enhancedCompanies });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/companies/:id
exports.getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }
    res.json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/companies
exports.createCompany = async (req, res) => {
  try {
    const { name, ticker, industry, currency, description, foundedYear } = req.body;
    if (!name || !ticker) {
      return res.status(400).json({ success: false, error: 'Name and Ticker are required' });
    }

    const company = await Company.create({
      name,
      ticker: ticker.toUpperCase(),
      industry: industry || 'Technology',
      currency: currency || 'USD',
      description: description || '',
      foundedYear: foundedYear || new Date().getFullYear(),
      isSample: false,
    });

    res.status(201).json({ success: true, data: company });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// DELETE /api/companies/:id
exports.deleteCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }

    // Also delete associated reports
    await FinancialReport.deleteMany({ companyId: company._id });
    await company.deleteOne();

    res.json({ success: true, message: 'Company and associated reports deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
