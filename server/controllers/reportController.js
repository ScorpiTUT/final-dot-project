const FinancialReport = require('../models/FinancialReport');
const Company = require('../models/Company');

// GET /api/reports/company/:companyId
exports.getReportsByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const reports = await FinancialReport.find({ companyId })
      .sort({ fiscalYear: -1, period: -1 });

    res.json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/reports/:id
exports.getReportById = async (req, res) => {
  try {
    const report = await FinancialReport.findById(req.params.id).populate('companyId');
    if (!report) {
      return res.status(404).json({ success: false, error: 'Financial report not found' });
    }
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/reports - Create or Upsert a Financial Report
exports.createOrUpdateReport = async (req, res) => {
  try {
    const { companyId, fiscalYear, period, assets, liabilities, equity, incomeStatement } = req.body;

    if (!companyId || !fiscalYear || !period) {
      return res.status(400).json({
        success: false,
        error: 'companyId, fiscalYear, and period (Q1, Q2, Q3, Q4, FY) are required',
      });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ success: false, error: 'Target company not found' });
    }

    // Check if an existing report exists for this company + fiscalYear + period
    let report = await FinancialReport.findOne({ companyId, fiscalYear, period });

    if (report) {
      // Update fields
      if (assets) report.assets = { ...report.assets.toObject(), ...assets };
      if (liabilities) report.liabilities = { ...report.liabilities.toObject(), ...liabilities };
      if (equity) report.equity = { ...report.equity.toObject(), ...equity };
      if (incomeStatement) report.incomeStatement = { ...report.incomeStatement.toObject(), ...incomeStatement };
      
      report.markModified('assets');
      report.markModified('liabilities');
      report.markModified('equity');
      report.markModified('incomeStatement');
      
      await report.save(); // triggers pre-save hook for rollups and metrics
      return res.json({ success: true, message: 'Report updated successfully', data: report });
    }

    // Otherwise create new document
    report = new FinancialReport({
      companyId,
      fiscalYear,
      period,
      assets: assets || {},
      liabilities: liabilities || {},
      equity: equity || {},
      incomeStatement: incomeStatement || {},
    });

    await report.save();

    res.status(201).json({ success: true, message: 'Report created successfully', data: report });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// DELETE /api/reports/:id
exports.deleteReport = async (req, res) => {
  try {
    const report = await FinancialReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }
    await report.deleteOne();
    res.json({ success: true, message: 'Financial report deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
