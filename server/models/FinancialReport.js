const mongoose = require('mongoose');

const financialReportSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  fiscalYear: {
    type: Number,
    required: true,
  },
  period: {
    type: String,
    enum: ['Q1', 'Q2', 'Q3', 'Q4', 'FY'],
    required: true,
  },
  periodLabel: {
    type: String, // e.g., "FY 2024" or "Q3 2024"
  },
  
  // === MODULE: ASSETS ===
  assets: {
    current: {
      cashAndEquivalents: { type: Number, default: 0 },
      shortTermInvestments: { type: Number, default: 0 },
      accountsReceivable: { type: Number, default: 0 },
      inventory: { type: Number, default: 0 },
      otherCurrentAssets: { type: Number, default: 0 },
      totalCurrentAssets: { type: Number, default: 0 },
    },
    nonCurrent: {
      propertyPlantEquipment: { type: Number, default: 0 },
      goodwillAndIntangibles: { type: Number, default: 0 },
      longTermInvestments: { type: Number, default: 0 },
      otherNonCurrentAssets: { type: Number, default: 0 },
      totalNonCurrentAssets: { type: Number, default: 0 },
    },
    totalAssets: { type: Number, default: 0 },
  },

  // === MODULE: LIABILITIES & DEBT ===
  liabilities: {
    current: {
      accountsPayable: { type: Number, default: 0 },
      shortTermDebt: { type: Number, default: 0 }, // Key debt component
      accruedExpenses: { type: Number, default: 0 },
      otherCurrentLiabilities: { type: Number, default: 0 },
      totalCurrentLiabilities: { type: Number, default: 0 },
    },
    nonCurrent: {
      longTermDebt: { type: Number, default: 0 }, // Key debt component
      deferredRevenue: { type: Number, default: 0 },
      otherLongTermLiabilities: { type: Number, default: 0 },
      totalNonCurrentLiabilities: { type: Number, default: 0 },
    },
    totalLiabilities: { type: Number, default: 0 },
    totalDebt: { type: Number, default: 0 }, // shortTermDebt + longTermDebt
  },

  // === MODULE: SHAREHOLDER EQUITY ===
  equity: {
    commonStock: { type: Number, default: 0 },
    retainedEarnings: { type: Number, default: 0 },
    additionalPaidInCapital: { type: Number, default: 0 },
    otherComprehensiveIncome: { type: Number, default: 0 },
    totalEquity: { type: Number, default: 0 },
  },

  // === MODULE: BALANCE SHEET EQUILIBRIUM CHECK ===
  validation: {
    isBalanced: { type: Boolean, default: true },
    discrepancy: { type: Number, default: 0 }, // Assets - (Liabilities + Equity)
    statusMessage: { type: String, default: 'Balanced' },
  },

  // === MODULE: PROFIT & LOSS (INCOME STATEMENT) ===
  incomeStatement: {
    revenue: { type: Number, default: 0 },
    cogs: { type: Number, default: 0 }, // Cost of goods sold
    grossProfit: { type: Number, default: 0 }, // revenue - cogs
    operatingExpenses: {
      researchAndDevelopment: { type: Number, default: 0 },
      salesAndMarketing: { type: Number, default: 0 },
      generalAndAdministrative: { type: Number, default: 0 },
      otherOpEx: { type: Number, default: 0 },
      totalOperatingExpenses: { type: Number, default: 0 },
    },
    operatingProfit: { type: Number, default: 0 }, // EBIT = grossProfit - totalOpEx
    interestExpense: { type: Number, default: 0 }, // Relates directly to debt service
    taxExpense: { type: Number, default: 0 },
    netProfit: { type: Number, default: 0 }, // operatingProfit - interest - tax
  },

  // === MODULE: RATIOS & FINANCIAL HEALTH SCORECARD ===
  metrics: {
    // Profitability
    grossMargin: { type: Number, default: 0 }, // %
    operatingMargin: { type: Number, default: 0 }, // %
    netMargin: { type: Number, default: 0 }, // %
    returnOnAssets: { type: Number, default: 0 }, // %
    returnOnEquity: { type: Number, default: 0 }, // %

    // Liquidity & Working Capital
    workingCapital: { type: Number, default: 0 },
    currentRatio: { type: Number, default: 0 },
    quickRatio: { type: Number, default: 0 },

    // Debt & Solvency
    debtToEquity: { type: Number, default: 0 },
    debtToAssets: { type: Number, default: 0 },
    interestCoverageRatio: { type: Number, default: 0 },
    debtBurdenRatio: { type: String, default: 'Moderate' }, // 'Low', 'Moderate', 'Elevated', 'High'

    // Overall Bankruptcy / Solvency Score
    altmanZScore: { type: Number, default: 0 },
    solvencyZone: { type: String, default: 'Safe Zone' }, // 'Safe Zone', 'Grey Zone', 'Distress Zone'
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to ensure uniqueness per company + fiscal year + period
financialReportSchema.index({ companyId: 1, fiscalYear: 1, period: 1 }, { unique: true });

// Pre-save hook to compute all hierarchical sums and financial metrics
financialReportSchema.pre('save', function (next) {
  const r = this;

  // 1. Assets rollups
  const curAssets = r.assets?.current || {};
  curAssets.totalCurrentAssets =
    (curAssets.cashAndEquivalents || 0) +
    (curAssets.shortTermInvestments || 0) +
    (curAssets.accountsReceivable || 0) +
    (curAssets.inventory || 0) +
    (curAssets.otherCurrentAssets || 0);

  const nonCurAssets = r.assets?.nonCurrent || {};
  nonCurAssets.totalNonCurrentAssets =
    (nonCurAssets.propertyPlantEquipment || 0) +
    (nonCurAssets.goodwillAndIntangibles || 0) +
    (nonCurAssets.longTermInvestments || 0) +
    (nonCurAssets.otherNonCurrentAssets || 0);

  r.assets.totalAssets = curAssets.totalCurrentAssets + nonCurAssets.totalNonCurrentAssets;

  // 2. Liabilities rollups
  const curLiab = r.liabilities?.current || {};
  curLiab.totalCurrentLiabilities =
    (curLiab.accountsPayable || 0) +
    (curLiab.shortTermDebt || 0) +
    (curLiab.accruedExpenses || 0) +
    (curLiab.otherCurrentLiabilities || 0);

  const nonCurLiab = r.liabilities?.nonCurrent || {};
  nonCurLiab.totalNonCurrentLiabilities =
    (nonCurLiab.longTermDebt || 0) +
    (nonCurLiab.deferredRevenue || 0) +
    (nonCurLiab.otherLongTermLiabilities || 0);

  r.liabilities.totalLiabilities = curLiab.totalCurrentLiabilities + nonCurLiab.totalNonCurrentLiabilities;
  r.liabilities.totalDebt = (curLiab.shortTermDebt || 0) + (nonCurLiab.longTermDebt || 0);

  // 3. Equity rollups
  const eq = r.equity || {};
  eq.totalEquity =
    (eq.commonStock || 0) +
    (eq.retainedEarnings || 0) +
    (eq.additionalPaidInCapital || 0) +
    (eq.otherComprehensiveIncome || 0);

  // 4. Accounting Equation Verification: Assets = Liabilities + Equity
  const totalFinanced = r.liabilities.totalLiabilities + eq.totalEquity;
  const diff = r.assets.totalAssets - totalFinanced;
  r.validation.discrepancy = Math.round(diff * 100) / 100;
  r.validation.isBalanced = Math.abs(r.validation.discrepancy) < 0.05;
  r.validation.statusMessage = r.validation.isBalanced
    ? 'Equilibrium achieved: Assets = Liabilities + Equity'
    : `Out of balance by ${diff > 0 ? '+' : ''}${r.validation.discrepancy.toLocaleString()}`;

  // 5. Income Statement (Profit) rollups
  const inc = r.incomeStatement || {};
  inc.grossProfit = (inc.revenue || 0) - (inc.cogs || 0);

  const opex = inc.operatingExpenses || {};
  opex.totalOperatingExpenses =
    (opex.researchAndDevelopment || 0) +
    (opex.salesAndMarketing || 0) +
    (opex.generalAndAdministrative || 0) +
    (opex.otherOpEx || 0);

  inc.operatingProfit = inc.grossProfit - opex.totalOperatingExpenses;
  inc.netProfit = inc.operatingProfit - (inc.interestExpense || 0) - (inc.taxExpense || 0);

  // 6. Metrics & Solvency Ratios
  const rev = inc.revenue || 1; // avoid divide by zero
  r.metrics.grossMargin = Math.round(((inc.grossProfit / rev) * 100) * 10) / 10;
  r.metrics.operatingMargin = Math.round(((inc.operatingProfit / rev) * 100) * 10) / 10;
  r.metrics.netMargin = Math.round(((inc.netProfit / rev) * 100) * 10) / 10;

  const totalAss = r.assets.totalAssets || 1;
  const totalEq = eq.totalEquity || 1;
  r.metrics.returnOnAssets = Math.round(((inc.netProfit / totalAss) * 100) * 10) / 10;
  r.metrics.returnOnEquity = Math.round(((inc.netProfit / totalEq) * 100) * 10) / 10;

  // Working Capital & Liquidity
  r.metrics.workingCapital = curAssets.totalCurrentAssets - curLiab.totalCurrentLiabilities;
  r.metrics.currentRatio = curLiab.totalCurrentLiabilities > 0
    ? Math.round((curAssets.totalCurrentAssets / curLiab.totalCurrentLiabilities) * 100) / 100
    : 1;

  const liquidAssets = (curAssets.cashAndEquivalents || 0) +
    (curAssets.shortTermInvestments || 0) +
    (curAssets.accountsReceivable || 0);
  r.metrics.quickRatio = curLiab.totalCurrentLiabilities > 0
    ? Math.round((liquidAssets / curLiab.totalCurrentLiabilities) * 100) / 100
    : 1;

  // Debt & Solvency
  r.metrics.debtToEquity = eq.totalEquity > 0
    ? Math.round((r.liabilities.totalDebt / eq.totalEquity) * 100) / 100
    : 0;

  r.metrics.debtToAssets = totalAss > 0
    ? Math.round((r.liabilities.totalDebt / totalAss) * 100) / 100
    : 0;

  r.metrics.interestCoverageRatio = (inc.interestExpense || 0) > 0
    ? Math.round((inc.operatingProfit / inc.interestExpense) * 10) / 10
    : (inc.operatingProfit > 0 ? 99.9 : 0);

  // Debt Burden classification
  const de = r.metrics.debtToEquity;
  if (de < 0.5) r.metrics.debtBurdenRatio = 'Conservative / Low Risk';
  else if (de <= 1.5) r.metrics.debtBurdenRatio = 'Moderate Leverage';
  else if (de <= 2.5) r.metrics.debtBurdenRatio = 'Elevated Debt';
  else r.metrics.debtBurdenRatio = 'High Leverage / Distressed';

  // Altman Z-Score calculation (Simplified for non-manufacturing/general corporate)
  // Z = 1.2*X1 + 1.4*X2 + 3.3*X3 + 0.6*X4 + 0.999*X5
  // X1 = Working Capital / Total Assets
  // X2 = Retained Earnings / Total Assets
  // X3 = EBIT (Operating Profit) / Total Assets
  // X4 = Market Value Equity (or Book Equity) / Total Liabilities
  // X5 = Sales (Revenue) / Total Assets
  const x1 = r.metrics.workingCapital / totalAss;
  const x2 = (eq.retainedEarnings || 0) / totalAss;
  const x3 = inc.operatingProfit / totalAss;
  const x4 = r.liabilities.totalLiabilities > 0 ? eq.totalEquity / r.liabilities.totalLiabilities : 1;
  const x5 = (inc.revenue || 0) / totalAss;

  const z = (1.2 * x1) + (1.4 * x2) + (3.3 * x3) + (0.6 * x4) + (0.999 * x5);
  r.metrics.altmanZScore = Math.round(z * 100) / 100;

  if (z >= 2.99) r.metrics.solvencyZone = 'Safe Zone (Financially Sound)';
  else if (z >= 1.81) r.metrics.solvencyZone = 'Grey Zone (Caution Advised)';
  else r.metrics.solvencyZone = 'Distress Zone (High Insolvency Risk)';

  r.periodLabel = `${r.period} ${r.fiscalYear}`;
  r.updatedAt = new Date();

  next();
});

module.exports = mongoose.model('FinancialReport', financialReportSchema);
