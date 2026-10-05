import React from 'react';
import { Layers, ShieldAlert, CheckCircle, HelpCircle, Activity } from 'lucide-react';

const formatCurrency = (val) => {
  if (!val) return '$0';
  if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
  if (val >= 1e3) return `$${(val / 1e3).toFixed(1)}K`;
  return `$${val.toLocaleString()}`;
};

export default function DebtAnalyzer({ report }) {
  if (!report) return null;

  const { liabilities, equity, assets, incomeStatement, metrics } = report;
  const shortTermDebt = liabilities?.current?.shortTermDebt || 0;
  const longTermDebt = liabilities?.nonCurrent?.longTermDebt || 0;
  const totalDebt = liabilities?.totalDebt || shortTermDebt + longTermDebt;
  const totalEquity = equity?.totalEquity || 1;
  const totalAssets = assets?.totalAssets || 1;
  const operatingProfit = incomeStatement?.operatingProfit || 0;
  const interestExpense = incomeStatement?.interestExpense || 0;

  const debtToEquity = metrics?.debtToEquity ?? (Math.round((totalDebt / totalEquity) * 100) / 100);
  const debtToAssets = metrics?.debtToAssets ?? (Math.round((totalDebt / totalAssets) * 100) / 100);
  const interestCoverage = metrics?.interestCoverageRatio ?? (interestExpense > 0 ? (operatingProfit / interestExpense).toFixed(1) : '99+');

  // Leverage ratio gauge percentage (capped at 3.0 for 100% meter)
  const gaugePercent = Math.min(100, (debtToEquity / 3.0) * 100);

  // Capital Structure composition: Debt vs. Equity financing
  const totalCapital = totalDebt + totalEquity;
  const debtPctOfCapital = totalCapital > 0 ? Math.round((totalDebt / totalCapital) * 100) : 0;
  const equityPctOfCapital = 100 - debtPctOfCapital;

  return (
    <div className="section-card">
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <Layers size={22} color="var(--color-debt)" />
            <span>Debt & Leverage Structure Intelligence</span>
          </h2>
          <p className="section-subtitle">
            Comprehensive audit of corporate debt maturity, leverage ratios, interest coverage, and default risk.
          </p>
        </div>
        <div className="balance-status-badge" style={{ 
          background: debtToEquity <= 1.5 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
          color: debtToEquity <= 1.5 ? 'var(--color-asset)' : 'var(--color-debt)',
          border: `1px solid ${debtToEquity <= 1.5 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`
        }}>
          {debtToEquity <= 1.5 ? <CheckCircle size={15} /> : <ShieldAlert size={15} />}
          <span>{metrics?.debtBurdenRatio || (debtToEquity <= 1.5 ? 'Healthy Leverage' : 'High Leverage')}</span>
        </div>
      </div>

      {/* Debt Core Metrics */}
      <div className="debt-metrics-container">
        <div className="debt-metric-box">
          <span className="debt-metric-label">Total Debt Outstanding</span>
          <div className="debt-metric-value" style={{ color: 'var(--color-debt)' }}>
            {formatCurrency(totalDebt)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Short: {formatCurrency(shortTermDebt)} | Long: {formatCurrency(longTermDebt)}
          </span>
        </div>

        <div className="debt-metric-box">
          <span className="debt-metric-label">Debt-to-Equity (D/E)</span>
          <div className="debt-metric-value" style={{ 
            color: debtToEquity < 1.0 ? 'var(--color-asset)' : debtToEquity < 2.0 ? 'var(--color-warning)' : 'var(--color-debt)' 
          }}>
            {debtToEquity}x
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Industry Benchmark: 1.0x - 1.5x
          </span>
        </div>

        <div className="debt-metric-box">
          <span className="debt-metric-label">Debt-to-Assets Ratio</span>
          <div className="debt-metric-value" style={{ color: 'var(--text-primary)' }}>
            {Math.round(debtToAssets * 100)}%
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Asset funding financed by debt
          </span>
        </div>

        <div className="debt-metric-box">
          <span className="debt-metric-label">Interest Coverage (EBIT/Int)</span>
          <div className="debt-metric-value" style={{ 
            color: interestCoverage > 3 ? 'var(--color-asset)' : 'var(--color-debt)' 
          }}>
            {interestCoverage}x
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {interestCoverage > 3 ? 'Strong interest servicing' : 'Vulnerable to rate hikes'}
          </span>
        </div>
      </div>

      {/* Visual Debt vs. Equity Capital Structure Bar */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
          <span>
            <strong style={{ color: 'var(--color-debt)' }}>Debt Financing ({debtPctOfCapital}%):</strong> {formatCurrency(totalDebt)}
          </span>
          <span>
            <strong style={{ color: 'var(--color-equity)' }}>Equity Financing ({equityPctOfCapital}%):</strong> {formatCurrency(totalEquity)}
          </span>
        </div>
        <div style={{ height: '24px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', display: 'flex', background: 'var(--border-subtle)' }}>
          <div 
            style={{ 
              width: `${debtPctOfCapital}%`, 
              background: 'var(--color-debt)',
              transition: 'width 0.4s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'white'
            }}
          >
            {debtPctOfCapital > 10 ? `${debtPctOfCapital}% Debt` : ''}
          </div>
          <div 
            style={{ 
              width: `${equityPctOfCapital}%`, 
              background: 'var(--color-equity)',
              transition: 'width 0.4s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'white'
            }}
          >
            {equityPctOfCapital > 10 ? `${equityPctOfCapital}% Equity` : ''}
          </div>
        </div>
      </div>

      {/* Debt Maturity Breakdown & Risk Rating */}
      <div className="grid-2">
        {/* Maturity Structure */}
        <div style={{ background: 'var(--bg-card-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={17} color="var(--color-debt)" />
            <span>Debt Maturity Schedule</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                <span>Short-Term Debt (Due &lt; 12 Months)</span>
                <strong>{formatCurrency(shortTermDebt)}</strong>
              </div>
              <div style={{ height: '8px', background: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${totalDebt > 0 ? (shortTermDebt / totalDebt) * 100 : 0}%`, 
                  background: 'var(--color-warning)' 
                }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                <span>Long-Term Debt & Bonds (Due &gt; 12 Months)</span>
                <strong>{formatCurrency(longTermDebt)}</strong>
              </div>
              <div style={{ height: '8px', background: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${totalDebt > 0 ? (longTermDebt / totalDebt) * 100 : 0}%`, 
                  background: 'var(--color-debt)' 
                }} />
              </div>
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
            A high concentration of short-term debt indicates impending refinancing risk if credit markets tighten.
          </p>
        </div>

        {/* Leverage Risk Meter */}
        <div style={{ background: 'var(--bg-card-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={17} color="var(--color-warning)" />
            <span>Financial Leverage Assessment</span>
          </h3>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
              <span>D/E Solvency Gauge</span>
              <strong>{debtToEquity}x (Max 3.0x scale)</strong>
            </div>
            <div style={{ height: '10px', background: 'var(--border-subtle)', borderRadius: '5px', overflow: 'hidden', position: 'relative' }}>
              <div style={{ 
                height: '100%', 
                width: `${gaugePercent}%`, 
                background: debtToEquity < 1.0 ? 'var(--color-asset)' : debtToEquity < 2.0 ? 'var(--color-warning)' : 'var(--color-debt)',
                transition: 'width 0.4s ease'
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              <span>0.0x (Conservative)</span>
              <span>1.5x (Moderate)</span>
              <span>3.0x+ (Aggressive)</span>
            </div>
          </div>

          <div style={{ 
            fontSize: '0.8rem', 
            background: 'var(--bg-card)', 
            padding: '0.6rem 0.75rem', 
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            borderLeft: `3px solid ${debtToEquity < 1.5 ? 'var(--color-asset)' : 'var(--color-debt)'}` 
          }}>
            {debtToEquity < 1.0 
              ? '✅ The company maintains a conservative balance sheet with ample equity cushion against business downturns.'
              : debtToEquity <= 2.0
              ? '⚖️ Moderate leverage utilized to fuel growth. Manageable interest coverage allows continued capital expenditures.'
              : '⚠️ Elevated debt burden requires substantial operating cash flow to service interest and principal maturities.'}
          </div>
        </div>
      </div>
    </div>
  );
}
