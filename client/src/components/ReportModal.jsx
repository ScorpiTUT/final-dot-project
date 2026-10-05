import React, { useState } from 'react';
import { X, FileSpreadsheet } from 'lucide-react';

export default function ReportModal({ isOpen, onClose, company, onReportCreated }) {
  const [fiscalYear, setFiscalYear] = useState(new Date().getFullYear());
  const [period, setPeriod] = useState('Q1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Starter values for quick scaffolding
  const [cash, setCash] = useState(10000000);
  const [receivables, setReceivables] = useState(5000000);
  const [ppe, setPpe] = useState(15000000);
  
  const [shortDebt, setShortDebt] = useState(2000000);
  const [longDebt, setLongDebt] = useState(8000000);
  const [payables, setPayables] = useState(3000000);
  
  const [revenue, setRevenue] = useState(12000000);
  const [cogs, setCogs] = useState(4000000);
  const [opex, setOpex] = useState(3500000);

  if (!isOpen || !company) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const totalCurAssets = Number(cash) + Number(receivables);
      const totalNonCurAssets = Number(ppe);
      const totalAssets = totalCurAssets + totalNonCurAssets;

      const totalCurLiab = Number(payables) + Number(shortDebt);
      const totalNonCurLiab = Number(longDebt);
      const totalLiab = totalCurLiab + totalNonCurLiab;

      // Ensure initial balance by allocating remainder to Retained Earnings
      const requiredEquity = Math.max(0, totalAssets - totalLiab);

      const reportPayload = {
        companyId: company._id,
        fiscalYear: parseInt(fiscalYear),
        period,
        assets: {
          current: {
            cashAndEquivalents: Number(cash),
            accountsReceivable: Number(receivables),
          },
          nonCurrent: {
            propertyPlantEquipment: Number(ppe),
          },
        },
        liabilities: {
          current: {
            accountsPayable: Number(payables),
            shortTermDebt: Number(shortDebt),
          },
          nonCurrent: {
            longTermDebt: Number(longDebt),
          },
        },
        equity: {
          commonStock: Math.round(requiredEquity * 0.4),
          retainedEarnings: Math.round(requiredEquity * 0.6),
        },
        incomeStatement: {
          revenue: Number(revenue),
          cogs: Number(cogs),
          operatingExpenses: {
            researchAndDevelopment: Math.round(Number(opex) * 0.4),
            salesAndMarketing: Math.round(Number(opex) * 0.35),
            generalAndAdministrative: Math.round(Number(opex) * 0.25),
          },
          interestExpense: Math.round(Number(longDebt) * 0.05),
          taxExpense: Math.round((Number(revenue) - Number(cogs) - Number(opex)) * 0.21),
        },
      };

      await onReportCreated(reportPayload);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create financial report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem' }}>
            <FileSpreadsheet size={18} color="var(--color-asset)" />
            <span>Create Period Report for {company.name}</span>
          </h3>
          <button className="btn" style={{ padding: '0.25rem', border: 'none' }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{
                background: 'rgba(244, 63, 94, 0.15)',
                color: 'var(--color-debt)',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1rem',
                fontSize: '0.85rem'
              }}>
                {error}
              </div>
            )}

            <div className="grid-2" style={{ marginBottom: 0 }}>
              <div className="form-group">
                <label className="form-label">Fiscal Year</label>
                <input
                  type="number"
                  className="form-control"
                  value={fiscalYear}
                  onChange={(e) => setFiscalYear(e.target.value)}
                  min="2000"
                  max="2035"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Reporting Period</label>
                <select
                  className="form-control"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                >
                  <option value="Q1">Q1 (First Quarter)</option>
                  <option value="Q2">Q2 (Second Quarter)</option>
                  <option value="Q3">Q3 (Third Quarter)</option>
                  <option value="Q4">Q4 (Fourth Quarter)</option>
                  <option value="FY">FY (Full Fiscal Year)</option>
                </select>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '0.75rem 0', paddingTop: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Quick Baseline Inputs (Can be fine-tuned in ledger)
              </span>
            </div>

            <div className="grid-2" style={{ marginBottom: 0 }}>
              <div className="form-group">
                <label className="form-label">Cash & Equivalents ($)</label>
                <input
                  type="number"
                  className="form-control"
                  value={cash}
                  onChange={(e) => setCash(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Receivables ($)</label>
                <input
                  type="number"
                  className="form-control"
                  value={receivables}
                  onChange={(e) => setReceivables(e.target.value)}
                />
              </div>
            </div>

            <div className="grid-2" style={{ marginBottom: 0 }}>
              <div className="form-group">
                <label className="form-label">Short-Term Debt ($)</label>
                <input
                  type="number"
                  className="form-control"
                  value={shortDebt}
                  onChange={(e) => setShortDebt(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Long-Term Debt ($)</label>
                <input
                  type="number"
                  className="form-control"
                  value={longDebt}
                  onChange={(e) => setLongDebt(e.target.value)}
                />
              </div>
            </div>

            <div className="grid-2" style={{ marginBottom: 0 }}>
              <div className="form-group">
                <label className="form-label">Quarterly Revenue ($)</label>
                <input
                  type="number"
                  className="form-control"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Cost of Goods Sold ($)</label>
                <input
                  type="number"
                  className="form-control"
                  value={cogs}
                  onChange={(e) => setCogs(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Generating Period...' : 'Generate Period Sheet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
