import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  ShieldCheck, 
  AlertTriangle,
  Coins
} from 'lucide-react';

const formatCurrency = (val, currency = 'USD') => {
  if (val === undefined || val === null) return '$0';
  const abs = Math.abs(val);
  const sign = val < 0 ? '-' : '';
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(1)}K`;
  return `${sign}$${val.toLocaleString()}`;
};

export default function MetricCards({ report, currency = 'USD' }) {
  if (!report) return null;

  const { assets, liabilities, equity, incomeStatement, metrics } = report;
  const isProfitPositive = (incomeStatement?.netProfit || 0) >= 0;

  return (
    <div className="kpi-grid">
      {/* 1. Total Assets */}
      <div className="kpi-card asset-card">
        <div className="kpi-header">
          <span className="kpi-title">Total Corporate Assets</span>
          <div className="kpi-icon asset">
            <Coins size={18} />
          </div>
        </div>
        <div className="kpi-value" style={{ color: 'var(--color-asset)' }}>
          {formatCurrency(assets?.totalAssets, currency)}
        </div>
        <div className="kpi-subtext">
          <span>Current: {formatCurrency(assets?.current?.totalCurrentAssets, currency)}</span>
          <span>•</span>
          <span>Fixed: {formatCurrency(assets?.nonCurrent?.totalNonCurrentAssets, currency)}</span>
        </div>
      </div>

      {/* 2. Total Debt */}
      <div className="kpi-card debt-card">
        <div className="kpi-header">
          <span className="kpi-title">Total Outstanding Debt</span>
          <div className="kpi-icon debt">
            <Layers size={18} />
          </div>
        </div>
        <div className="kpi-value" style={{ color: 'var(--color-debt)' }}>
          {formatCurrency(liabilities?.totalDebt, currency)}
        </div>
        <div className="kpi-subtext">
          <span>D/E Ratio: <strong>{metrics?.debtToEquity || 0}x</strong></span>
          <span>•</span>
          <span>{metrics?.debtBurdenRatio || 'Moderate'}</span>
        </div>
      </div>

      {/* 3. Net Profit / Margin */}
      <div className="kpi-card profit-card">
        <div className="kpi-header">
          <span className="kpi-title">Net Profit (P&L)</span>
          <div className="kpi-icon profit">
            {isProfitPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
          </div>
        </div>
        <div 
          className="kpi-value" 
          style={{ color: isProfitPositive ? 'var(--color-asset)' : 'var(--color-debt)' }}
        >
          {formatCurrency(incomeStatement?.netProfit, currency)}
        </div>
        <div className="kpi-subtext">
          <span>Margin: <strong>{metrics?.netMargin || 0}%</strong></span>
          <span>•</span>
          <span>Revenue: {formatCurrency(incomeStatement?.revenue, currency)}</span>
        </div>
      </div>

      {/* 4. Shareholder Equity */}
      <div className="kpi-card equity-card">
        <div className="kpi-header">
          <span className="kpi-title">Shareholder Equity</span>
          <div className="kpi-icon equity">
            <DollarSign size={18} />
          </div>
        </div>
        <div className="kpi-value" style={{ color: 'var(--color-equity)' }}>
          {formatCurrency(equity?.totalEquity, currency)}
        </div>
        <div className="kpi-subtext">
          <span>Retained: {formatCurrency(equity?.retainedEarnings, currency)}</span>
          <span>•</span>
          <span>ROE: {metrics?.returnOnEquity || 0}%</span>
        </div>
      </div>

      {/* 5. Solvency Health & Altman Z-Score */}
      <div className="kpi-card health-card">
        <div className="kpi-header">
          <span className="kpi-title">Solvency & Altman Z-Score</span>
          <div className="kpi-icon health">
            {metrics?.altmanZScore >= 1.81 ? <ShieldCheck size={18} /> : <AlertTriangle size={18} />}
          </div>
        </div>
        <div className="kpi-value">
          {metrics?.altmanZScore || 0}
        </div>
        <div className="kpi-subtext">
          <span style={{ 
            color: metrics?.altmanZScore >= 2.99 ? 'var(--color-asset)' : metrics?.altmanZScore >= 1.81 ? 'var(--color-warning)' : 'var(--color-debt)',
            fontWeight: 600
          }}>
            {metrics?.solvencyZone || 'Evaluation'}
          </span>
        </div>
      </div>
    </div>
  );
}
