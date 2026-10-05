import React from 'react';
import { PieChart, Droplet, ShieldCheck, ArrowUpRight } from 'lucide-react';

const formatCurrency = (val) => {
  if (!val) return '$0';
  if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
  if (val >= 1e3) return `$${(val / 1e3).toFixed(1)}K`;
  return `$${val.toLocaleString()}`;
};

export default function AssetCompositionChart({ report }) {
  if (!report) return null;

  const { assets, liabilities, metrics } = report;
  const curAssets = assets?.current || {};
  const nonCurAssets = assets?.nonCurrent || {};
  const totalAssets = assets?.totalAssets || 1;

  const cash = curAssets.cashAndEquivalents || 0;
  const investments = (curAssets.shortTermInvestments || 0) + (nonCurAssets.longTermInvestments || 0);
  const receivables = curAssets.accountsReceivable || 0;
  const inventory = curAssets.inventory || 0;
  const ppe = nonCurAssets.propertyPlantEquipment || 0;
  const intangibles = nonCurAssets.goodwillAndIntangibles || 0;
  const others = (curAssets.otherCurrentAssets || 0) + (nonCurAssets.otherNonCurrentAssets || 0);

  const categories = [
    { label: 'Cash & Equivalents', val: cash, color: '#047857' },
    { label: 'Accounts Receivable', val: receivables, color: '#1d4ed8' },
    { label: 'Inventory', val: inventory, color: '#d97706' },
    { label: 'Investments', val: investments, color: '#0284c7' },
    { label: 'Property, Plant & Equipment', val: ppe, color: '#475569' },
    { label: 'Goodwill & Intangibles', val: intangibles, color: '#64748b' },
    { label: 'Other Assets', val: others, color: '#94a3b8' },
  ].filter((c) => c.val > 0);

  const workingCapital = metrics?.workingCapital ?? (curAssets.totalCurrentAssets - liabilities?.current?.totalCurrentLiabilities);
  const currentRatio = metrics?.currentRatio ?? 1;
  const quickRatio = metrics?.quickRatio ?? 1;

  // Donut SVG calculation
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  return (
    <div className="section-card">
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <PieChart size={22} color="var(--color-asset)" />
            <span>Asset Composition & Liquidity Intelligence</span>
          </h2>
          <p className="section-subtitle">
            Capital allocation between liquid reserves, operating working capital, and long-term productive assets.
          </p>
        </div>
      </div>

      {/* Liquidity Ratios Grid */}
      <div className="debt-metrics-container">
        <div className="debt-metric-box">
          <span className="debt-metric-label">Net Working Capital</span>
          <div className="debt-metric-value" style={{ color: workingCapital >= 0 ? 'var(--color-asset)' : 'var(--color-debt)' }}>
            {formatCurrency(workingCapital)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Current Assets - Current Liabilities
          </span>
        </div>

        <div className="debt-metric-box">
          <span className="debt-metric-label">Current Ratio</span>
          <div className="debt-metric-value" style={{ color: currentRatio >= 1.5 ? 'var(--color-asset)' : 'var(--color-warning)' }}>
            {currentRatio}x
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Benchmark &gt; 1.5x (Short-term buffer)
          </span>
        </div>

        <div className="debt-metric-box">
          <span className="debt-metric-label">Quick Ratio (Acid-Test)</span>
          <div className="debt-metric-value" style={{ color: quickRatio >= 1.0 ? 'var(--color-asset)' : 'var(--color-warning)' }}>
            {quickRatio}x
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            (Cash + Receivables) / Current Liabilities
          </span>
        </div>

        <div className="debt-metric-box">
          <span className="debt-metric-label">Cash-to-Asset Ratio</span>
          <div className="debt-metric-value" style={{ color: 'var(--color-equity)' }}>
            {Math.round((cash / totalAssets) * 100)}%
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Unencumbered liquid cash ratio
          </span>
        </div>
      </div>

      {/* Visual Asset Allocation Breakdown */}
      <div className="grid-2" style={{ alignItems: 'center', marginTop: '1.5rem' }}>
        {/* SVG Donut Chart */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          <svg width="220" height="220" viewBox="0 0 220 220">
            <g transform="translate(110, 110) rotate(-90)">
              {categories.map((cat, idx) => {
                const pct = cat.val / totalAssets;
                const strokeDasharray = `${pct * circumference} ${circumference}`;
                const strokeDashoffset = -accumulatedPercent * circumference;
                accumulatedPercent += pct;

                return (
                  <circle
                    key={idx}
                    r={radius}
                    cx="0"
                    cy="0"
                    fill="transparent"
                    stroke={cat.color}
                    strokeWidth="28"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: 'stroke-dasharray 0.5s ease' }}
                  />
                );
              })}
            </g>
          </svg>
          <div style={{
            position: 'absolute',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Assets</span>
            <strong style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>
              {formatCurrency(totalAssets)}
            </strong>
          </div>
        </div>

        {/* Legend and Category List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {categories.map((cat, idx) => {
            const pct = Math.round((cat.val / totalAssets) * 100);
            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: cat.color }} />
                  <span>{cat.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(cat.val)}</strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', minWidth: '35px', textAlign: 'right' }}>
                    {pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
