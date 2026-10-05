const FinancialReport = require('../models/FinancialReport');

// GET /api/analytics/trends/:companyId
exports.getCompanyTrends = async (req, res) => {
  try {
    const { companyId } = req.params;
    
    // Fetch reports sorted chronologically (ascending)
    const reports = await FinancialReport.find({ companyId })
      .sort({ fiscalYear: 1, period: 1 });

    if (!reports || reports.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const trendPoints = reports.map((r) => ({
      reportId: r._id,
      label: r.periodLabel || `${r.period} ${r.fiscalYear}`,
      period: r.period,
      year: r.fiscalYear,
      // Core financial dimensions
      totalAssets: r.assets.totalAssets,
      currentAssets: r.assets.current.totalCurrentAssets,
      nonCurrentAssets: r.assets.nonCurrent.totalNonCurrentAssets,
      
      totalLiabilities: r.liabilities.totalLiabilities,
      totalDebt: r.liabilities.totalDebt,
      shortTermDebt: r.liabilities.current.shortTermDebt,
      longTermDebt: r.liabilities.nonCurrent.longTermDebt,

      totalEquity: r.equity.totalEquity,
      
      revenue: r.incomeStatement.revenue,
      grossProfit: r.incomeStatement.grossProfit,
      operatingProfit: r.incomeStatement.operatingProfit,
      netProfit: r.incomeStatement.netProfit,

      // Ratios
      netMargin: r.metrics.netMargin,
      debtToEquity: r.metrics.debtToEquity,
      currentRatio: r.metrics.currentRatio,
      altmanZScore: r.metrics.altmanZScore,
      solvencyZone: r.metrics.solvencyZone,
      isBalanced: r.validation.isBalanced,
    }));

    res.json({ success: true, count: trendPoints.length, data: trendPoints });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/analytics/scenario - Simulate What-If financial changes
exports.simulateScenario = async (req, res) => {
  try {
    const {
      reportId,
      debtDeltaPct = 0,       // e.g. +20 means +20% debt
      revenueDeltaPct = 0,    // e.g. -10 means -10% revenue
      cogsDeltaPct = 0,       // e.g. +5 means +5% COGS
      opexDeltaPct = 0,       // e.g. +5% OpEx
      interestRatePct = 0,    // additional interest burden %
    } = req.body;

    const report = await FinancialReport.findById(reportId).populate('companyId');
    if (!report) {
      return res.status(404).json({ success: false, error: 'Target financial report not found' });
    }

    // Baseline numbers
    const baseDebt = report.liabilities.totalDebt;
    const baseLiabilities = report.liabilities.totalLiabilities;
    const baseAssets = report.assets.totalAssets;
    const baseEquity = report.equity.totalEquity;
    const baseRevenue = report.incomeStatement.revenue;
    const baseCogs = report.incomeStatement.cogs;
    const baseOpEx = report.incomeStatement.operatingExpenses.totalOperatingExpenses;
    const baseInterest = report.incomeStatement.interestExpense;
    const baseTax = report.incomeStatement.taxExpense;
    const baseNetProfit = report.incomeStatement.netProfit;

    // Simulated Calculations
    const simDebt = Math.max(0, Math.round(baseDebt * (1 + debtDeltaPct / 100)));
    const debtDeltaAmount = simDebt - baseDebt;
    
    // If debt increases, cash/assets or liabilities adjust
    const simLiabilities = Math.max(0, baseLiabilities + debtDeltaAmount);
    // Corresponding asset adjustment assuming debt cash inflow or expenditure
    const simAssets = Math.max(0, baseAssets + debtDeltaAmount);

    const simRevenue = Math.max(0, Math.round(baseRevenue * (1 + revenueDeltaPct / 100)));
    const simCogs = Math.max(0, Math.round(baseCogs * (1 + cogsDeltaPct / 100)));
    const simGrossProfit = simRevenue - simCogs;

    const simOpEx = Math.max(0, Math.round(baseOpEx * (1 + opexDeltaPct / 100)));
    const simOperatingProfit = simGrossProfit - simOpEx;

    // New interest expense scales with debt delta and interest rate
    const interestMultiplier = 1 + (debtDeltaPct / 100) + (interestRatePct / 100);
    const simInterest = Math.max(0, Math.round(baseInterest * interestMultiplier));
    
    // Estimated tax at 21% of positive EBT
    const simEBT = simOperatingProfit - simInterest;
    const simTax = simEBT > 0 ? Math.round(simEBT * 0.21) : 0;
    const simNetProfit = simEBT - simTax;

    // Simulated Ratios
    const simNetMargin = simRevenue > 0 ? Math.round(((simNetProfit / simRevenue) * 100) * 10) / 10 : 0;
    const simDebtToEquity = baseEquity > 0 ? Math.round((simDebt / baseEquity) * 100) / 100 : 0;
    const simDebtToAssets = simAssets > 0 ? Math.round((simDebt / simAssets) * 100) / 100 : 0;
    const simInterestCoverage = simInterest > 0 ? Math.round((simOperatingProfit / simInterest) * 10) / 10 : 99;

    // Simulated Altman Z-score
    const simWorkingCap = report.assets.current.totalCurrentAssets - report.liabilities.current.totalCurrentLiabilities;
    const x1 = simWorkingCap / (simAssets || 1);
    const x2 = (report.equity.retainedEarnings || 0) / (simAssets || 1);
    const x3 = simOperatingProfit / (simAssets || 1);
    const x4 = simLiabilities > 0 ? baseEquity / simLiabilities : 1;
    const x5 = simRevenue / (simAssets || 1);
    const simZ = (1.2 * x1) + (1.4 * x2) + (3.3 * x3) + (0.6 * x4) + (0.999 * x5);
    const simZScore = Math.round(simZ * 100) / 100;

    let simSolvencyZone = 'Safe Zone';
    if (simZScore < 1.81) simSolvencyZone = 'Distress Zone';
    else if (simZScore < 2.99) simSolvencyZone = 'Grey Zone';

    // Narrative analysis
    const insights = [];
    if (debtDeltaPct > 0) {
      insights.push(`Debt expansion of +${debtDeltaPct}% increases total debt by $${(debtDeltaAmount / 1e6).toFixed(2)}M, raising D/E from ${report.metrics.debtToEquity} to ${simDebtToEquity}.`);
    } else if (debtDeltaPct < 0) {
      insights.push(`Debt deleveraging of ${debtDeltaPct}% reduces debt to $${(simDebt / 1e6).toFixed(2)}M, lowering D/E ratio to ${simDebtToEquity}.`);
    }

    if (revenueDeltaPct < 0) {
      insights.push(`Revenue drop of ${revenueDeltaPct}% contracts net profit by $${((baseNetProfit - simNetProfit) / 1e6).toFixed(2)}M.`);
    }

    if (simZScore < 1.81 && report.metrics.altmanZScore >= 1.81) {
      insights.push('⚠️ Warning: This scenario shifts the company into the Distress Zone (Elevated Insolvency Risk).');
    }

    res.json({
      success: true,
      data: {
        baseline: {
          totalAssets: baseAssets,
          totalDebt: baseDebt,
          totalLiabilities: baseLiabilities,
          totalEquity: baseEquity,
          revenue: baseRevenue,
          grossProfit: report.incomeStatement.grossProfit,
          operatingProfit: report.incomeStatement.operatingProfit,
          netProfit: baseNetProfit,
          debtToEquity: report.metrics.debtToEquity,
          netMargin: report.metrics.netMargin,
          altmanZScore: report.metrics.altmanZScore,
          solvencyZone: report.metrics.solvencyZone,
        },
        simulated: {
          totalAssets: simAssets,
          totalDebt: simDebt,
          totalLiabilities: simLiabilities,
          totalEquity: baseEquity,
          revenue: simRevenue,
          grossProfit: simGrossProfit,
          operatingProfit: simOperatingProfit,
          netProfit: simNetProfit,
          debtToEquity: simDebtToEquity,
          debtToAssets: simDebtToAssets,
          interestCoverageRatio: simInterestCoverage,
          netMargin: simNetMargin,
          altmanZScore: simZScore,
          solvencyZone: simSolvencyZone,
        },
        deltas: {
          debtChangeAmount: debtDeltaAmount,
          netProfitChangeAmount: simNetProfit - baseNetProfit,
          marginChangePoints: Math.round((simNetMargin - report.metrics.netMargin) * 10) / 10,
          zScoreChangePoints: Math.round((simZScore - report.metrics.altmanZScore) * 100) / 100,
        },
        insights,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
