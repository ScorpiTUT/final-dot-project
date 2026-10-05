const Company = require('../models/Company');
const FinancialReport = require('../models/FinancialReport');

const seedInitialData = async () => {
  try {
    const existingCount = await Company.countDocuments();
    if (existingCount > 0) {
      console.log(`[SEED] Database already contains ${existingCount} companies. Skipping initial seed.`);
      return;
    }

    console.log('[SEED] Seeding realistic corporate balance sheets, debt structures, and profit statements...');

    // 1. Apex Cloud Systems (Tech / SaaS)
    const apex = await Company.create({
      name: 'Apex Cloud Systems',
      ticker: 'APEX',
      industry: 'Technology',
      currency: 'USD',
      description: 'Enterprise AI cloud infrastructure & developer platform with high recurring revenue and strong cash reserves.',
      foundedYear: 2018,
      isSample: true,
    });

    // Apex Multi-period reports (Q1 2024, Q2 2024, Q3 2024, FY 2024)
    const apexReports = [
      {
        companyId: apex._id,
        fiscalYear: 2024,
        period: 'Q1',
        assets: {
          current: {
            cashAndEquivalents: 38000000,
            shortTermInvestments: 12000000,
            accountsReceivable: 14500000,
            inventory: 1200000,
            otherCurrentAssets: 2300000,
          },
          nonCurrent: {
            propertyPlantEquipment: 24000000,
            goodwillAndIntangibles: 18000000,
            longTermInvestments: 8000000,
            otherNonCurrentAssets: 3500000,
          },
        },
        liabilities: {
          current: {
            accountsPayable: 6200000,
            shortTermDebt: 3000000,
            accruedExpenses: 4100000,
            otherCurrentLiabilities: 2500000,
          },
          nonCurrent: {
            longTermDebt: 12000000,
            deferredRevenue: 9500000,
            otherLongTermLiabilities: 2200000,
          },
        },
        equity: {
          commonStock: 45000000,
          retainedEarnings: 33500000,
          additionalPaidInCapital: 3500000,
          otherComprehensiveIncome: 0,
        },
        incomeStatement: {
          revenue: 28500000,
          cogs: 6200000,
          operatingExpenses: {
            researchAndDevelopment: 7800000,
            salesAndMarketing: 6100000,
            generalAndAdministrative: 2900000,
            otherOpEx: 400000,
          },
          interestExpense: 220000,
          taxExpense: 980000,
        },
      },
      {
        companyId: apex._id,
        fiscalYear: 2024,
        period: 'Q2',
        assets: {
          current: {
            cashAndEquivalents: 42500000,
            shortTermInvestments: 14000000,
            accountsReceivable: 16200000,
            inventory: 1400000,
            otherCurrentAssets: 2600000,
          },
          nonCurrent: {
            propertyPlantEquipment: 25800000,
            goodwillAndIntangibles: 17800000,
            longTermInvestments: 8500000,
            otherNonCurrentAssets: 3800000,
          },
        },
        liabilities: {
          current: {
            accountsPayable: 6800000,
            shortTermDebt: 2500000,
            accruedExpenses: 4400000,
            otherCurrentLiabilities: 2800000,
          },
          nonCurrent: {
            longTermDebt: 11000000,
            deferredRevenue: 10800000,
            otherLongTermLiabilities: 2400000,
          },
        },
        equity: {
          commonStock: 45000000,
          retainedEarnings: 43400000,
          additionalPaidInCapital: 3500000,
          otherComprehensiveIncome: 0,
        },
        incomeStatement: {
          revenue: 33200000,
          cogs: 6900000,
          operatingExpenses: {
            researchAndDevelopment: 8400000,
            salesAndMarketing: 6700000,
            generalAndAdministrative: 3100000,
            otherOpEx: 450000,
          },
          interestExpense: 200000,
          taxExpense: 1550000,
        },
      },
      {
        companyId: apex._id,
        fiscalYear: 2024,
        period: 'Q3',
        assets: {
          current: {
            cashAndEquivalents: 49000000,
            shortTermInvestments: 16500000,
            accountsReceivable: 18100000,
            inventory: 1500000,
            otherCurrentAssets: 2800000,
          },
          nonCurrent: {
            propertyPlantEquipment: 28500000,
            goodwillAndIntangibles: 17500000,
            longTermInvestments: 9200000,
            otherNonCurrentAssets: 4100000,
          },
        },
        liabilities: {
          current: {
            accountsPayable: 7100000,
            shortTermDebt: 2000000,
            accruedExpenses: 4700000,
            otherCurrentLiabilities: 3100000,
          },
          nonCurrent: {
            longTermDebt: 10000000,
            deferredRevenue: 12200000,
            otherLongTermLiabilities: 2600000,
          },
        },
        equity: {
          commonStock: 45000000,
          retainedEarnings: 57000000,
          additionalPaidInCapital: 3500000,
          otherComprehensiveIncome: 0,
        },
        incomeStatement: {
          revenue: 38900000,
          cogs: 7400000,
          operatingExpenses: {
            researchAndDevelopment: 9100000,
            salesAndMarketing: 7300000,
            generalAndAdministrative: 3400000,
            otherOpEx: 500000,
          },
          interestExpense: 180000,
          taxExpense: 2320000,
        },
      },
      {
        companyId: apex._id,
        fiscalYear: 2024,
        period: 'FY',
        assets: {
          current: {
            cashAndEquivalents: 56200000,
            shortTermInvestments: 18000000,
            accountsReceivable: 21500000,
            inventory: 1800000,
            otherCurrentAssets: 3200000,
          },
          nonCurrent: {
            propertyPlantEquipment: 31000000,
            goodwillAndIntangibles: 17200000,
            longTermInvestments: 10500000,
            otherNonCurrentAssets: 4600000,
          },
        },
        liabilities: {
          current: {
            accountsPayable: 7800000,
            shortTermDebt: 1500000,
            accruedExpenses: 5200000,
            otherCurrentLiabilities: 3400000,
          },
          nonCurrent: {
            longTermDebt: 8500000,
            deferredRevenue: 14100000,
            otherLongTermLiabilities: 2800000,
          },
        },
        equity: {
          commonStock: 45000000,
          retainedEarnings: 72200000,
          additionalPaidInCapital: 3500000,
          otherComprehensiveIncome: 0,
        },
        incomeStatement: {
          revenue: 146000000,
          cogs: 28500000,
          operatingExpenses: {
            researchAndDevelopment: 34500000,
            salesAndMarketing: 27800000,
            generalAndAdministrative: 12900000,
            otherOpEx: 1900000,
          },
          interestExpense: 720000,
          taxExpense: 8100000,
        },
      },
    ];

    // 2. Titan Heavy Industries (Manufacturing / High Debt & Capital Assets)
    const titan = await Company.create({
      name: 'Titan Heavy Industries',
      ticker: 'TITN',
      industry: 'Manufacturing',
      currency: 'USD',
      description: 'Global manufacturer of advanced industrial machinery and green infrastructure equipment.',
      foundedYear: 2004,
      isSample: true,
    });

    const titanReport = {
      companyId: titan._id,
      fiscalYear: 2024,
      period: 'FY',
      assets: {
        current: {
          cashAndEquivalents: 18500000,
          shortTermInvestments: 4200000,
          accountsReceivable: 44000000,
          inventory: 58000000,
          otherCurrentAssets: 6300000,
        },
        nonCurrent: {
          propertyPlantEquipment: 142000000,
          goodwillAndIntangibles: 22000000,
          longTermInvestments: 14500000,
          otherNonCurrentAssets: 8500000,
        },
      },
      liabilities: {
        current: {
          accountsPayable: 38500000,
          shortTermDebt: 16000000,
          accruedExpenses: 11200000,
          otherCurrentLiabilities: 7800000,
        },
        nonCurrent: {
          longTermDebt: 78000000,
          deferredRevenue: 12500000,
          otherLongTermLiabilities: 14000000,
        },
      },
      equity: {
        commonStock: 65000000,
        retainedEarnings: 68000000,
        additionalPaidInCapital: 7000000,
        otherComprehensiveIncome: 0,
      },
      incomeStatement: {
        revenue: 215000000,
        cogs: 142000000,
        operatingExpenses: {
          researchAndDevelopment: 12400000,
          salesAndMarketing: 16500000,
          generalAndAdministrative: 14800000,
          otherOpEx: 3100000,
        },
        interestExpense: 5400000,
        taxExpense: 4200000,
      },
    };

    // 3. OmniRetail Global (Consumer & Retail)
    const omni = await Company.create({
      name: 'OmniRetail Global',
      ticker: 'ORTL',
      industry: 'Retail',
      currency: 'USD',
      description: 'Omnichannel retail network operating specialty stores and rapid direct-to-consumer e-commerce.',
      foundedYear: 2011,
      isSample: true,
    });

    const omniReport = {
      companyId: omni._id,
      fiscalYear: 2024,
      period: 'FY',
      assets: {
        current: {
          cashAndEquivalents: 24000000,
          shortTermInvestments: 5000000,
          accountsReceivable: 19500000,
          inventory: 64000000,
          otherCurrentAssets: 5500000,
        },
        nonCurrent: {
          propertyPlantEquipment: 68000000,
          goodwillAndIntangibles: 12000000,
          longTermInvestments: 6000000,
          otherNonCurrentAssets: 4000000,
        },
      },
      liabilities: {
        current: {
          accountsPayable: 42000000,
          shortTermDebt: 9500000,
          accruedExpenses: 12500000,
          otherCurrentLiabilities: 6500000,
        },
        nonCurrent: {
          longTermDebt: 34000000,
          deferredRevenue: 5500000,
          otherLongTermLiabilities: 8000000,
        },
      },
      equity: {
        commonStock: 35000000,
        retainedEarnings: 51000000,
        additionalPaidInCapital: 4000000,
        otherComprehensiveIncome: 0,
      },
      incomeStatement: {
        revenue: 298000000,
        cogs: 208000000,
        operatingExpenses: {
          researchAndDevelopment: 3800000,
          salesAndMarketing: 36000000,
          generalAndAdministrative: 24500000,
          otherOpEx: 4200000,
        },
        interestExpense: 2600000,
        taxExpense: 3900000,
      },
    };

    // Save all seed reports through Mongoose models so pre-save middleware fires
    for (const rep of apexReports) {
      const doc = new FinancialReport(rep);
      await doc.save();
    }
    const titanDoc = new FinancialReport(titanReport);
    await titanDoc.save();

    const omniDoc = new FinancialReport(omniReport);
    await omniDoc.save();

    console.log('[SEED] Successfully seeded 3 corporate profiles and 6 financial reports with complete balance sheets, debt schedules, and profit statements.');
  } catch (err) {
    console.error('[SEED] Error during seeding:', err);
  }
};

module.exports = seedInitialData;
