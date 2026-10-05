import React, { useState, useEffect } from 'react';
import { LineChart, BarChart2, TrendingUp, Layers, Coins } from 'lucide-react';
import { api } from '../services/api';

const formatCurrency = (val) => {
  if (val === undefined || val === null) return '$0';
  const abs = Math.abs(val);
  const sign = val < 0 ? '-' : '';
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(0)}K`;
  return `${sign}$${val.toLocaleString()}`;
};

export default function TrendAnalytics({ companyId }) {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('capital'); // 'capital' (Assets vs Debt vs Equity) or 'profitability' (Revenue vs Net Profit)
  const [hoveredPoint, setHoveredPoint] = useState(null);

  useEffect(() => {
    if (companyId) {
      loadTrends();
    }
  }, [companyId]);

  const loadTrends = async () => {
    try {
      setLoading(true);
      const data = await api.getCompanyTrends(companyId);
      setTrends(data);
    } catch (err) {
      console.error('Failed to load company trends:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="section-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading multi-period financial trends...</p>
      </div>
    );
  }

  if (!trends || trends.length === 0) {
    return (
      <div className="section-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>No historical trend data available for this company yet.</p>
      </div>
    );
  }

  // Chart dimensions
  const chartHeight = 280;
  const chartWidth = 720;
  const pad = { top: 30, right: 40, bottom: 40, left: 65 };
  const w = chartWidth - pad.left - pad.right;
  const h = chartHeight - pad.top - pad.bottom;

  // Find max value for scaling
  let maxVal = 1;
  if (viewMode === 'capital') {
    maxVal = Math.max(...trends.map((t) => Math.max(t.totalAssets, t.totalDebt, t.totalEquity)), 1);
  } else {
    maxVal = Math.max(...trends.map((t) => Math.max(t.revenue, Math.abs(t.netProfit))), 1);
  }
  maxVal = maxVal * 1.15;

  const getX = (idx) => pad.left + (idx / Math.max(trends.length - 1, 1)) * w;
  const getY = (val) => pad.top + h - (Math.max(0, val) / maxVal) * h;

  // Generate SVG polyline path string
  const createPath = (key) => {
    return trends.map((t, idx) => `${getX(idx)},${getY(t[key])}`).join(' ');
  };

  return (
    <div className="section-card">
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <LineChart size={22} color="var(--color-equity)" />
            <span>Multi-Period Financial Trends</span>
          </h2>
          <p className="section-subtitle">
            Observe the historical trajectory of total assets, debt leverage, revenue expansion, and net profit over fiscal quarters.
          </p>
        </div>

        {/* View Toggle */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`btn ${viewMode === 'capital' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setViewMode('capital')}
          >
            <Coins size={14} />
            <span>Assets vs Debt vs Equity</span>
          </button>
          <button
            className={`btn ${viewMode === 'profitability' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setViewMode('profitability')}
          >
            <TrendingUp size={14} />
            <span>Revenue vs Profit</span>
          </button>
        </div>
      </div>

      {/* Chart Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
        {viewMode === 'capital' ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: '12px', height: '3px', background: 'var(--color-asset)', borderRadius: '2px' }} />
              <span>Total Assets</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: '12px', height: '3px', background: 'var(--color-debt)', borderRadius: '2px' }} />
              <span>Total Debt</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: '12px', height: '3px', background: 'var(--color-equity)', borderRadius: '2px' }} />
              <span>Shareholder Equity</span>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: '12px', height: '3px', background: 'var(--color-revenue)', borderRadius: '2px' }} />
              <span>Top-Line Revenue</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: '12px', height: '3px', background: 'var(--color-profit)', borderRadius: '2px' }} />
              <span>Net Profit (P&L)</span>
            </div>
          </>
        )}
      </div>

      {/* SVG Interactive Trend Chart */}
      <div className="chart-container">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="chart-svg">
          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = pad.top + h * (1 - pct);
            const val = maxVal * pct;
            return (
              <g key={idx}>
                <line
                  x1={pad.left}
                  y1={y}
                  x2={chartWidth - pad.right}
                  y2={y}
                  stroke="rgba(255,255,255,0.08)"
                  strokeDasharray="4 4"
                />
                <text
                  x={pad.left - 10}
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

          {/* X Axis Labels */}
          {trends.map((t, idx) => {
            const x = getX(idx);
            return (
              <g key={idx}>
                <line
                  x1={x}
                  y1={pad.top}
                  x2={x}
                  y2={pad.top + h}
                  stroke="rgba(255,255,255,0.04)"
                />
                <text
                  x={x}
                  y={chartHeight - pad.bottom + 20}
                  fill="var(--text-secondary)"
                  fontSize="10"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {t.label}
                </text>
              </g>
            );
          })}

          {/* Trend Lines */}
          {viewMode === 'capital' ? (
            <>
              {/* Assets line */}
              <polyline
                fill="none"
                stroke="var(--color-asset)"
                strokeWidth="3"
                points={createPath('totalAssets')}
              />
              {/* Debt line */}
              <polyline
                fill="none"
                stroke="var(--color-debt)"
                strokeWidth="3"
                points={createPath('totalDebt')}
              />
              {/* Equity line */}
              <polyline
                fill="none"
                stroke="var(--color-equity)"
                strokeWidth="3"
                points={createPath('totalEquity')}
              />
            </>
          ) : (
            <>
              {/* Revenue line */}
              <polyline
                fill="none"
                stroke="var(--color-revenue)"
                strokeWidth="3"
                points={createPath('revenue')}
              />
              {/* Net Profit line */}
              <polyline
                fill="none"
                stroke="var(--color-profit)"
                strokeWidth="3"
                points={createPath('netProfit')}
              />
            </>
          )}

          {/* Interactive Data Points */}
          {trends.map((t, idx) => {
            const x = getX(idx);
            return (
              <g key={idx}>
                {viewMode === 'capital' ? (
                  <>
                    <circle
                      cx={x}
                      cy={getY(t.totalAssets)}
                      r="5"
                      fill="var(--color-asset)"
                      stroke="#0f172a"
                      strokeWidth="2"
                      onMouseEnter={() => setHoveredPoint({ period: t.label, metric: 'Assets', val: t.totalAssets })}
                      onMouseLeave={() => setHoveredPoint(null)}
                      style={{ cursor: 'pointer' }}
                    />
                    <circle
                      cx={x}
                      cy={getY(t.totalDebt)}
                      r="5"
                      fill="var(--color-debt)"
                      stroke="#0f172a"
                      strokeWidth="2"
                      onMouseEnter={() => setHoveredPoint({ period: t.label, metric: 'Debt', val: t.totalDebt })}
                      onMouseLeave={() => setHoveredPoint(null)}
                      style={{ cursor: 'pointer' }}
                    />
                    <circle
                      cx={x}
                      cy={getY(t.totalEquity)}
                      r="5"
                      fill="var(--color-equity)"
                      stroke="#0f172a"
                      strokeWidth="2"
                      onMouseEnter={() => setHoveredPoint({ period: t.label, metric: 'Equity', val: t.totalEquity })}
                      onMouseLeave={() => setHoveredPoint(null)}
                      style={{ cursor: 'pointer' }}
                    />
                  </>
                ) : (
                  <>
                    <circle
                      cx={x}
                      cy={getY(t.revenue)}
                      r="5"
                      fill="var(--color-revenue)"
                      stroke="#0f172a"
                      strokeWidth="2"
                      onMouseEnter={() => setHoveredPoint({ period: t.label, metric: 'Revenue', val: t.revenue })}
                      onMouseLeave={() => setHoveredPoint(null)}
                      style={{ cursor: 'pointer' }}
                    />
                    <circle
                      cx={x}
                      cy={getY(t.netProfit)}
                      r="5"
                      fill="var(--color-profit)"
                      stroke="#0f172a"
                      strokeWidth="2"
                      onMouseEnter={() => setHoveredPoint({ period: t.label, metric: 'Net Profit', val: t.netProfit })}
                      onMouseLeave={() => setHoveredPoint(null)}
                      style={{ cursor: 'pointer' }}
                    />
                  </>
                )}
              </g>
            );
          })}
        </svg>

        {hoveredPoint && (
          <div style={{
            marginTop: '0.5rem',
            background: 'var(--bg-card-subtle)',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)'
          }}>
            <strong>{hoveredPoint.period} • {hoveredPoint.metric}:</strong> {formatCurrency(hoveredPoint.val)}
          </div>
        )}
      </div>
    </div>
  );
}
