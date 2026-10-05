import React, { useState, useEffect } from 'react';
import { Save, Download, Upload, RefreshCw, Layers, Coins, Shield } from 'lucide-react';

export default function BalanceSheetLedger({ report, onSaveReport }) {
  const [formData, setFormData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (report) {
      setFormData(JSON.parse(JSON.stringify(report)));
    }
  }, [report]);

  if (!formData) return null;

  // Handle nested line item updates
  const handleFieldChange = (section, subSection, field, value) => {
    const num = parseFloat(value) || 0;
    setFormData((prev) => {
      const copy = { ...prev };
      if (subSection) {
        copy[section][subSection][field] = num;
      } else {
        copy[section][field] = num;
      }
      return calculateLocalRollups(copy);
    });
  };

  // Immediate frontend preview rollups
  const calculateLocalRollups = (draft) => {
    const ca = draft.assets.current;
    ca.totalCurrentAssets =
      (ca.cashAndEquivalents || 0) +
      (ca.shortTermInvestments || 0) +
      (ca.accountsReceivable || 0) +
      (ca.inventory || 0) +
      (ca.otherCurrentAssets || 0);

    const nca = draft.assets.nonCurrent;
    nca.totalNonCurrentAssets =
      (nca.propertyPlantEquipment || 0) +
      (nca.goodwillAndIntangibles || 0) +
      (nca.longTermInvestments || 0) +
      (nca.otherNonCurrentAssets || 0);

    draft.assets.totalAssets = ca.totalCurrentAssets + nca.totalNonCurrentAssets;

    const cl = draft.liabilities.current;
    cl.totalCurrentLiabilities =
      (cl.accountsPayable || 0) +
      (cl.shortTermDebt || 0) +
      (cl.accruedExpenses || 0) +
      (cl.otherCurrentLiabilities || 0);

    const ncl = draft.liabilities.nonCurrent;
    ncl.totalNonCurrentLiabilities =
      (ncl.longTermDebt || 0) +
      (ncl.deferredRevenue || 0) +
      (ncl.otherLongTermLiabilities || 0);

    draft.liabilities.totalLiabilities = cl.totalCurrentLiabilities + ncl.totalNonCurrentLiabilities;
    draft.liabilities.totalDebt = (cl.shortTermDebt || 0) + (ncl.longTermDebt || 0);

    const eq = draft.equity;
    eq.totalEquity =
      (eq.commonStock || 0) +
      (eq.retainedEarnings || 0) +
      (eq.additionalPaidInCapital || 0) +
      (eq.otherComprehensiveIncome || 0);

    const diff = draft.assets.totalAssets - (draft.liabilities.totalLiabilities + eq.totalEquity);
    draft.validation = {
      discrepancy: diff,
      isBalanced: Math.abs(diff) < 1,
    };

    return draft;
  };

  const handleAutoBalance = () => {
    setFormData((prev) => {
      const copy = { ...prev };
      const currentEquityWithoutRetained =
        (copy.equity.commonStock || 0) +
        (copy.equity.additionalPaidInCapital || 0) +
        (copy.equity.otherComprehensiveIncome || 0);
      
      const requiredEquity = copy.assets.totalAssets - copy.liabilities.totalLiabilities;
      copy.equity.retainedEarnings = Math.max(0, requiredEquity - currentEquityWithoutRetained);
      return calculateLocalRollups(copy);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      await onSaveReport(formData);
      setMessage({ type: 'success', text: 'Balance sheet saved successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save balance sheet' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const rows = [
      ['Category', 'Line Item', 'Amount (USD)'],
      ['Current Assets', 'Cash & Equivalents', formData.assets.current.cashAndEquivalents],
      ['Current Assets', 'Short-Term Investments', formData.assets.current.shortTermInvestments],
      ['Current Assets', 'Accounts Receivable', formData.assets.current.accountsReceivable],
      ['Current Assets', 'Inventory', formData.assets.current.inventory],
      ['Current Assets', 'Other Current Assets', formData.assets.current.otherCurrentAssets],
      ['Current Assets', 'Total Current Assets', formData.assets.current.totalCurrentAssets],
      ['Non-Current Assets', 'Property, Plant & Equipment', formData.assets.nonCurrent.propertyPlantEquipment],
      ['Non-Current Assets', 'Goodwill & Intangibles', formData.assets.nonCurrent.goodwillAndIntangibles],
      ['Non-Current Assets', 'Long-Term Investments', formData.assets.nonCurrent.longTermInvestments],
      ['Non-Current Assets', 'Other Non-Current Assets', formData.assets.nonCurrent.otherNonCurrentAssets],
      ['Assets Summary', 'TOTAL ASSETS', formData.assets.totalAssets],
      ['Current Liabilities', 'Accounts Payable', formData.liabilities.current.accountsPayable],
      ['Current Liabilities', 'Short-Term Debt', formData.liabilities.current.shortTermDebt],
      ['Current Liabilities', 'Accrued Expenses', formData.liabilities.current.accruedExpenses],
      ['Current Liabilities', 'Other Current Liabilities', formData.liabilities.current.otherCurrentLiabilities],
      ['Current Liabilities', 'Total Current Liabilities', formData.liabilities.current.totalCurrentLiabilities],
      ['Non-Current Liabilities', 'Long-Term Debt', formData.liabilities.nonCurrent.longTermDebt],
      ['Non-Current Liabilities', 'Deferred Revenue', formData.liabilities.nonCurrent.deferredRevenue],
      ['Non-Current Liabilities', 'Other Long-Term Liabilities', formData.liabilities.nonCurrent.otherLongTermLiabilities],
      ['Liabilities Summary', 'TOTAL LIABILITIES', formData.liabilities.totalLiabilities],
      ['Liabilities Summary', 'TOTAL DEBT', formData.liabilities.totalDebt],
      ['Shareholder Equity', 'Common Stock', formData.equity.commonStock],
      ['Shareholder Equity', 'Retained Earnings', formData.equity.retainedEarnings],
      ['Shareholder Equity', 'Additional Paid-In Capital', formData.equity.additionalPaidInCapital],
      ['Equity Summary', 'TOTAL SHAREHOLDER EQUITY', formData.equity.totalEquity],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Balance_Sheet_${report.periodLabel || 'Report'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import from CSV or JSON file
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          setFormData((prev) => {
            const updated = {
              ...prev,
              assets: { ...prev.assets, ...(parsed.assets || {}) },
              liabilities: { ...prev.liabilities, ...(parsed.liabilities || {}) },
              equity: { ...prev.equity, ...(parsed.equity || {}) },
              incomeStatement: { ...prev.incomeStatement, ...(parsed.incomeStatement || {}) },
            };
            return calculateLocalRollups(updated);
          });
          setMessage({ type: 'success', text: `Loaded financial statement: ${file.name}` });
        } else {
          // Parse CSV
          const lines = text.split(/\r?\n/);
          setFormData((prev) => {
            const draft = JSON.parse(JSON.stringify(prev));
            lines.forEach((line) => {
              if (!line.trim()) return;
              const parts = line.split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
              if (parts.length < 2) return;
              
              const item = (parts.length >= 3 ? parts[1] : parts[0]).toLowerCase();
              const val = parseFloat(parts.length >= 3 ? parts[2] : parts[1]);
              if (isNaN(val)) return;

              if (item.includes('cash')) draft.assets.current.cashAndEquivalents = val;
              else if (item.includes('short-term invest') || item.includes('marketable')) draft.assets.current.shortTermInvestments = val;
              else if (item.includes('receivable')) draft.assets.current.accountsReceivable = val;
              else if (item.includes('inventory')) draft.assets.current.inventory = val;
              else if (item.includes('other current asset')) draft.assets.current.otherCurrentAssets = val;
              else if (item.includes('property') || item.includes('pp&e') || item.includes('equipment')) draft.assets.nonCurrent.propertyPlantEquipment = val;
              else if (item.includes('goodwill') || item.includes('intangible')) draft.assets.nonCurrent.goodwillAndIntangibles = val;
              else if (item.includes('long-term invest')) draft.assets.nonCurrent.longTermInvestments = val;
              else if (item.includes('other non-current')) draft.assets.nonCurrent.otherNonCurrentAssets = val;
              else if (item.includes('payable')) draft.liabilities.current.accountsPayable = val;
              else if (item.includes('short-term debt') || item.includes('bank credit')) draft.liabilities.current.shortTermDebt = val;
              else if (item.includes('accrued')) draft.liabilities.current.accruedExpenses = val;
              else if (item.includes('other current liab')) draft.liabilities.current.otherCurrentLiabilities = val;
              else if (item.includes('long-term debt') || item.includes('bonds')) draft.liabilities.nonCurrent.longTermDebt = val;
              else if (item.includes('deferred revenue')) draft.liabilities.nonCurrent.deferredRevenue = val;
              else if (item.includes('other long-term liab')) draft.liabilities.nonCurrent.otherLongTermLiabilities = val;
              else if (item.includes('common stock')) draft.equity.commonStock = val;
              else if (item.includes('retained earnings')) draft.equity.retainedEarnings = val;
              else if (item.includes('additional paid-in') || item.includes('apic')) draft.equity.additionalPaidInCapital = val;
              else if (item.includes('revenue') || item.includes('sales')) draft.incomeStatement.revenue = val;
              else if (item.includes('cogs') || item.includes('cost of goods')) draft.incomeStatement.cogs = val;
            });
            return calculateLocalRollups(draft);
          });
          setMessage({ type: 'success', text: `Successfully loaded CSV statement: ${file.name}` });
        }
      } catch (err) {
        setMessage({ type: 'error', text: `Failed to load file: ${err.message}` });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const totalFinanced = (formData.liabilities.totalLiabilities || 0) + (formData.equity.totalEquity || 0);
  const diff = (formData.assets.totalAssets || 0) - totalFinanced;
  const isBalanced = Math.abs(diff) < 1;

  return (
    <div className="section-card">
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <Coins size={22} color="var(--color-asset)" />
            <span>Interactive Balance Sheet Ledger</span>
          </h2>
          <p className="section-subtitle">
            Edit individual line items in real-time or upload a CSV/JSON statement. Subtotals, debt, and the accounting equation will update immediately.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <label className="btn btn-outline" style={{ cursor: 'pointer' }} title="Upload CSV or JSON Statement">
            <Upload size={15} />
            <span>Upload / Import</span>
            <input
              type="file"
              accept=".csv,.json"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>
          <button className="btn btn-outline" onClick={handleExportCSV} title="Export current sheet as CSV">
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          {!isBalanced && (
            <button className="btn btn-outline" onClick={handleAutoBalance} title="Rebalance to Retained Earnings">
              <RefreshCw size={15} />
              <span>Auto-Balance</span>
            </button>
          )}
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isSaving}>
            <Save size={15} />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {message && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            background: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
            color: message.type === 'success' ? 'var(--color-asset)' : 'var(--color-debt)',
            border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
            fontWeight: 600,
          }}
        >
          {message.text}
        </div>
      )}

      {/* Two Column Balance Sheet */}
      <div className="grid-2">
        {/* ASSETS COLUMN */}
        <div className="ledger-table-container">
          <table className="ledger-table">
            <thead>
              <tr>
                <th colSpan="2" style={{ color: 'var(--color-asset)', fontSize: '0.9rem' }}>
                  Assets (Economic Resources)
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Current Assets */}
              <tr className="ledger-category-header">
                <td colSpan="2">Current Assets (Liquid / Short-Term)</td>
              </tr>
              <tr>
                <td>Cash & Cash Equivalents</td>
                <td>
                  <input
                    type="number"
                    className="editable-cell"
                    value={formData.assets.current.cashAndEquivalents}
                    onChange={(e) => handleFieldChange('assets', 'current', 'cashAndEquivalents', e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <td>Short-Term Investments</td>
                <td>
                  <input
                    type="number"
                    className="editable-cell"
                    value={formData.assets.current.shortTermInvestments}
                    onChange={(e) => handleFieldChange('assets', 'current', 'shortTermInvestments', e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <td>Accounts Receivable</td>
                <td>
                  <input
                    type="number"
                    className="editable-cell"
                    value={formData.assets.current.accountsReceivable}
                    onChange={(e) => handleFieldChange('assets', 'current', 'accountsReceivable', e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <td>Merchandise Inventory</td>
                <td>
                  <input
                    type="number"
                    className="editable-cell"
                    value={formData.assets.current.inventory}
                    onChange={(e) => handleFieldChange('assets', 'current', 'inventory', e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <td>Other Current Assets</td>
                <td>
                  <input
                    type="number"
                    className="editable-cell"
                    value={formData.assets.current.otherCurrentAssets}
                    onChange={(e) => handleFieldChange('assets', 'current', 'otherCurrentAssets', e.target.value)}
                  />
                </td>
              </tr>
              <tr className="ledger-subtotal-row">
                <td>Total Current Assets</td>
                <td style={{ textAlign: 'right', color: 'var(--color-asset)' }}>
                  ${formData.assets.current.totalCurrentAssets.toLocaleString()}
                </td>
              </tr>

              {/* Non-Current Assets */}
              <tr className="ledger-category-header">
                <td colSpan="2">Non-Current Assets (Long-Term Capital)</td>
              </tr>
              <tr>
                <td>Property, Plant & Equipment (PP&E)</td>
                <td>
                  <input
                    type="number"
                    className="editable-cell"
                    value={formData.assets.nonCurrent.propertyPlantEquipment}
                    onChange={(e) => handleFieldChange('assets', 'nonCurrent', 'propertyPlantEquipment', e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <td>Goodwill & Intangible Assets</td>
                <td>
                  <input
                    type="number"
                    className="editable-cell"
                    value={formData.assets.nonCurrent.goodwillAndIntangibles}
                    onChange={(e) => handleFieldChange('assets', 'nonCurrent', 'goodwillAndIntangibles', e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <td>Long-Term Investments</td>
                <td>
                  <input
                    type="number"
                    className="editable-cell"
                    value={formData.assets.nonCurrent.longTermInvestments}
                    onChange={(e) => handleFieldChange('assets', 'nonCurrent', 'longTermInvestments', e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <td>Other Non-Current Assets</td>
                <td>
                  <input
                    type="number"
                    className="editable-cell"
                    value={formData.assets.nonCurrent.otherNonCurrentAssets}
                    onChange={(e) => handleFieldChange('assets', 'nonCurrent', 'otherNonCurrentAssets', e.target.value)}
                  />
                </td>
              </tr>
              <tr className="ledger-subtotal-row">
                <td>Total Non-Current Assets</td>
                <td style={{ textAlign: 'right', color: 'var(--color-asset)' }}>
                  ${formData.assets.nonCurrent.totalNonCurrentAssets.toLocaleString()}
                </td>
              </tr>

              {/* Grand Total Assets */}
              <tr className="ledger-grand-total">
                <td>TOTAL CORPORATE ASSETS</td>
                <td style={{ textAlign: 'right', color: 'var(--color-asset)' }}>
                  ${formData.assets.totalAssets.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* LIABILITIES & EQUITY COLUMN */}
        <div className="ledger-table-container">
          <table className="ledger-table">
            <thead>
              <tr>
                <th colSpan="2" style={{ color: 'var(--color-debt)', fontSize: '0.9rem' }}>
                  Liabilities & Equity (Claims on Resources)
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Current Liabilities */}
              <tr className="ledger-category-header">
                <td colSpan="2">Current Liabilities (Obligations Due &lt; 1 Year)</td>
              </tr>
              <tr>
                <td>Accounts Payable</td>
                <td>
                  <input
                    type="number"
                    className="editable-cell"
                    value={formData.liabilities.current.accountsPayable}
                    onChange={(e) => handleFieldChange('liabilities', 'current', 'accountsPayable', e.target.value)}
                  />
                </td>
              </tr>
              <tr style={{ background: 'rgba(244, 63, 94, 0.05)' }}>
                <td>
                  <strong>Short-Term Debt & Bank Credit</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-debt)', marginLeft: '0.5rem' }}>*Debt</span>
                </td>
                <td>
                  <input
                    type="number"
                    className="editable-cell"
                    style={{ borderColor: 'rgba(244, 63, 94, 0.4)' }}
                    value={formData.liabilities.current.shortTermDebt}
                    onChange={(e) => handleFieldChange('liabilities', 'current', 'shortTermDebt', e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <td>Accrued Expenses</td>
                <td>
                  <input
                    type="number"
                    className="editable-cell"
                    value={formData.liabilities.current.accruedExpenses}
                    onChange={(e) => handleFieldChange('liabilities', 'current', 'accruedExpenses', e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <td>Other Current Liabilities</td>
                <td>
                  <input
                    type="number"
                    className="editable-cell"
                    value={formData.liabilities.current.otherCurrentLiabilities}
                    onChange={(e) => handleFieldChange('liabilities', 'current', 'otherCurrentLiabilities', e.target.value)}
                  />
                </td>
              </tr>
              <tr className="ledger-subtotal-row">
                <td>Total Current Liabilities</td>
                <td style={{ textAlign: 'right', color: 'var(--color-debt)' }}>
                  ${formData.liabilities.current.totalCurrentLiabilities.toLocaleString()}
                </td>
              </tr>

              {/* Long-Term Liabilities */}
              <tr className="ledger-category-header">
                <td colSpan="2">Long-Term Liabilities & Debt</td>
              </tr>
              <tr style={{ background: 'rgba(244, 63, 94, 0.05)' }}>
                <td>
                  <strong>Long-Term Debt & Bonds</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-debt)', marginLeft: '0.5rem' }}>*Debt</span>
                </td>
                <td>
                  <input
                    type="number"
                    className="editable-cell"
                    style={{ borderColor: 'rgba(244, 63, 94, 0.4)' }}
                    value={formData.liabilities.nonCurrent.longTermDebt}
                    onChange={(e) => handleFieldChange('liabilities', 'nonCurrent', 'longTermDebt', e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <td>Deferred Revenue</td>
                <td>
                  <input
                    type="number"
                    className="editable-cell"
                    value={formData.liabilities.nonCurrent.deferredRevenue}
                    onChange={(e) => handleFieldChange('liabilities', 'nonCurrent', 'deferredRevenue', e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <td>Other Long-Term Liabilities</td>
                <td>
                  <input
                    type="number"
                    className="editable-cell"
                    value={formData.liabilities.nonCurrent.otherLongTermLiabilities}
                    onChange={(e) => handleFieldChange('liabilities', 'nonCurrent', 'otherLongTermLiabilities', e.target.value)}
                  />
                </td>
              </tr>
              <tr className="ledger-subtotal-row">
                <td>
                  Total Liabilities (Total Debt: ${formData.liabilities.totalDebt.toLocaleString()})
                </td>
                <td style={{ textAlign: 'right', color: 'var(--color-debt)' }}>
                  ${formData.liabilities.totalLiabilities.toLocaleString()}
                </td>
              </tr>

              {/* Equity */}
              <tr className="ledger-category-header">
                <td colSpan="2">Shareholder Equity (Net Worth)</td>
              </tr>
              <tr>
                <td>Common Stock & Par Value</td>
                <td>
                  <input
                    type="number"
                    className="editable-cell"
                    value={formData.equity.commonStock}
                    onChange={(e) => handleFieldChange('equity', null, 'commonStock', e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <td>Retained Earnings (Accumulated Profit)</td>
                <td>
                  <input
                    type="number"
                    className="editable-cell"
                    value={formData.equity.retainedEarnings}
                    onChange={(e) => handleFieldChange('equity', null, 'retainedEarnings', e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <td>Additional Paid-In Capital</td>
                <td>
                  <input
                    type="number"
                    className="editable-cell"
                    value={formData.equity.additionalPaidInCapital}
                    onChange={(e) => handleFieldChange('equity', null, 'additionalPaidInCapital', e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <td>Other Comprehensive Income</td>
                <td>
                  <input
                    type="number"
                    className="editable-cell"
                    value={formData.equity.otherComprehensiveIncome}
                    onChange={(e) => handleFieldChange('equity', null, 'otherComprehensiveIncome', e.target.value)}
                  />
                </td>
              </tr>
              <tr className="ledger-subtotal-row">
                <td>Total Shareholder Equity</td>
                <td style={{ textAlign: 'right', color: 'var(--color-equity)' }}>
                  ${formData.equity.totalEquity.toLocaleString()}
                </td>
              </tr>

              {/* Grand Total Liabilities + Equity */}
              <tr className="ledger-grand-total debt">
                <td>TOTAL LIABILITIES + EQUITY</td>
                <td style={{ textAlign: 'right', color: isBalanced ? 'var(--color-asset)' : 'var(--color-debt)' }}>
                  ${totalFinanced.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
