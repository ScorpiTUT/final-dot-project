import React, { useState } from 'react';
import { DollarSign, TrendingUp, ArrowDownRight, Info } from 'lucide-react';

const formatCurrency = (val) => {
  if (val === undefined || val === null) return '$0';
  const abs = Math.abs(val);
  const sign = val < 0 ? '-' : '';
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(1)}K`;
  return `${sign}$${val.toLocaleString()}`;
};

export default function ProfitWaterfall({ report }) {
  const [hoveredBar, setHoveredBar] = useState(null);

  if (!report) return null;

  const { incomeStatement, metrics } = report;
  const rev = incomeStatement?.revenue || 0;
  const cogs = incomeStatement?.cogs || 0;
  const gross = incomeStatement?.grossProfit || (rev - cogs);
  const opex = incomeStatement?.operatingExpenses?.totalOperatingExpenses || 0;
  const opIncome = incomeStatement?.operatingProfit || (gross - opex);
  const interest = incomeStatement?.interestExpense || 0;
  const tax = incomeStatement?.taxExpense || 0;
  const net = incomeStatement?.netProfit || (opIncome - interest - tax);

  // SVG Chart Geometry
  const chartHeight = 280;
  const chartWidth = 720;
  const padding = { top: 30, right: 30, bottom: 50, left: 60 };
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;

  // Compute waterfall steps
  // 1: Revenue (Base)
  // 2: -COGS (Step down)
  // 3: Gross Profit (Subtotal)
  // 4: -OpEx (Step down)
  // 5: Operating Income (Subtotal)
  // 6: -Interest & Tax (Step down)
  // 7: Net Profit (Final)
  const steps = [
    { label: 'Revenue', val: rev, type: 'start', start: 0, end: rev, color: '#1e40af' },
    { label: 'COGS', val: -cogs, type: 'decrease', start: rev, end: rev - cogs, color: '#b91c1c' },
    { label: 'Gross Profit', val: gross, type: 'subtotal', start: 0, end: gross, color: '#059669' },
    { label: 'OpEx', val: -opex, type: 'decrease', start: gross, end: gross - opex, color: '#dc2626' },
    { label: 'Operating Inc', val: opIncome, type: 'subtotal', start: 0, end: opIncome, color: '#0284c7' },
    { label: 'Int & Tax', val: -(interest + tax), type: 'decrease', start: opIncome, end: net, color: '#d97706' },
    { label: 'Net Profit', val: net, type: 'final', start: 0, end: net, color: net >= 0 ? '#047857' : '#b91c1c' },
  ];

  const maxVal = Math.max(rev * 1.1, 1);
  const yScale = (val) => graphHeight - (val / maxVal) * graphHeight;

  const barWidth = 55;
  const stepSpacing = graphWidth / steps.length;

  return (
    <div className="section-card">
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <DollarSign size={22} color="var(--color-profit)" />
            <span>Profit & P&L Waterfall Statement</span>
          </h2>
          <p className="section-subtitle">
            Visual progression showing how top-line Revenue steps down through cost of goods, operating expenses, debt interest, and taxes to yield Net Profit.
          </p>
        </div>
      </div>

      {/* Margins Summary Grid */}
      <div className="debt-metrics-container">
        <div className="debt-metric-box">
          <span className="debt-metric-label">Gross Margin</span>
          <div className="debt-metric-value" style={{ color: 'var(--color-asset)' }}>
            {metrics?.grossMargin || 0}%
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Gross Profit: {formatCurrency(gross)}
          </span>
        </div>

        <div className="debt-metric-box">
          <span className="debt-metric-label">Operating Margin (EBIT)</span>
          <div className="debt-metric-value" style={{ color: '#0284c7' }}>
            {metrics?.operatingMargin || 0}%
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Operating Income: {formatCurrency(opIncome)}
          </span>
        </div>

        <div className="debt-metric-box">
          <span className="debt-metric-label">Net Profit Margin</span>
          <div className="debt-metric-value" style={{ color: net >= 0 ? 'var(--color-asset)' : 'var(--color-debt)' }}>
            {metrics?.netMargin || 0}%
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Bottom Line: {formatCurrency(net)}
          </span>
        </div>

        <div className="debt-metric-box">
          <span className="debt-metric-label">Return on Assets (ROA)</span>
          <div className="debt-metric-value" style={{ color: 'var(--color-asset)' }}>
            {metrics?.returnOnAssets || 0}%
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Efficiency generating profit from assets
          </span>
        </div>
      </div>

      {/* Waterfall SVG Chart */}
      <div className="chart-container">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="chart-svg">
          {/* Y Axis reference lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = padding.top + graphHeight * (1 - pct);
            const val = maxVal * pct;
            return (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="var(--border-subtle)"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  fill="var(--text-muted)"
                  fontSize="10"
                  textAnchor="end"
                >
                  {formatCurrency(val)}
                </text>
              </g>
            );
          })}

          {/* Waterfall Bars */}
          {steps.map((step, idx) => {
            const x = padding.left + idx * stepSpacing + (stepSpacing - barWidth) / 2;
            const yTop = padding.top + yScale(Math.max(step.start, step.end));
            const yBottom = padding.top + yScale(Math.min(step.start, step.end));
            const h = Math.max(3, yBottom - yTop);

            const isHovered = hoveredBar === idx;

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredBar(idx)}
                onMouseLeave={() => setHoveredBar(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Connecting dotted connector to previous bar */}
                {idx > 0 && (
                  <line
                    x1={x - (stepSpacing - barWidth) / 2}
                    y1={padding.top + yScale(step.start)}
                    x2={x}
                    y2={padding.top + yScale(step.start)}
                    stroke="var(--text-muted)"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Main Bar */}
                <rect
                  x={x}
                  y={yTop}
                  width={barWidth}
                  height={h}
                  rx="3"
                  fill={step.color}
                  opacity={isHovered ? 0.85 : 1}
                  style={{ transition: 'all 0.15s ease' }}
                />

                {/* Amount Label on top of bar */}
                <text
                  x={x + barWidth / 2}
                  y={yTop - 6}
                  fill="var(--text-primary)"
                  fontSize="9.5"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {formatCurrency(step.val)}
                </text>

                {/* Step Label below X-axis */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - padding.bottom + 18}
                  fill="var(--text-secondary)"
                  fontSize="10"
                  fontWeight={step.type === 'final' ? '700' : '500'}
                  textAnchor="middle"
                >
                  {step.label}
                </text>

                {/* Percent of revenue label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - padding.bottom + 32}
                  fill="var(--text-muted)"
                  fontSize="8.5"
                  textAnchor="middle"
                >
                  {rev > 0 ? `${Math.round((Math.abs(step.val) / rev) * 100)}% rev` : ''}
                </text>
              </g>
            );
          })}
        </svg>

        {hoveredBar !== null && (
          <div style={{
            marginTop: '0.5rem',
            background: 'var(--bg-card-subtle)',
            padding: '0.4rem 0.8rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)'
          }}>
            <strong>{steps[hoveredBar].label}:</strong> {formatCurrency(steps[hoveredBar].val)} ({rev > 0 ? Math.round((Math.abs(steps[hoveredBar].val) / rev) * 100) : 0}% of Top-line Revenue)
          </div>
        )}
      </div>
    </div>
  );
}
