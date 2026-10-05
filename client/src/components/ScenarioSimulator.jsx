import React, { useState, useEffect } from 'react';
import { Sliders, RotateCcw, AlertTriangle, ShieldCheck, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { api } from '../services/api';

const formatCurrency = (val) => {
  if (val === undefined || val === null) return '$0';
  const abs = Math.abs(val);
  const sign = val < 0 ? '-' : '';
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(1)}K`;
  return `${sign}$${val.toLocaleString()}`;
};

export default function ScenarioSimulator({ report }) {
  const [debtDeltaPct, setDebtDeltaPct] = useState(0);
  const [revenueDeltaPct, setRevenueDeltaPct] = useState(0);
  const [cogsDeltaPct, setCogsDeltaPct] = useState(0);
  const [opexDeltaPct, setOpexDeltaPct] = useState(0);

  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (report?._id) {
      runSimulation();
    }
  }, [report?._id, debtDeltaPct, revenueDeltaPct, cogsDeltaPct, opexDeltaPct]);

  const runSimulation = async () => {
    try {
      setLoading(true);
      const res = await api.simulateScenario({
        reportId: report._id,
        debtDeltaPct,
        revenueDeltaPct,
        cogsDeltaPct,
        opexDeltaPct,
      });
      setSimResult(res);
    } catch (err) {
      console.error('Scenario simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setDebtDeltaPct(0);
    setRevenueDeltaPct(0);
    setCogsDeltaPct(0);
    setOpexDeltaPct(0);
  };

  if (!report) return null;

  const base = simResult?.baseline;
  const sim = simResult?.simulated;
  const deltas = simResult?.deltas;

  return (
    <div className="section-card">
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <Sliders size={22} color="var(--color-warning)" />
            <span>"What-If" Financial Scenario Simulator</span>
          </h2>
          <p className="section-subtitle">
            Stress-test corporate balance sheet resilience by simulating debt spikes, revenue shocks, or cost inflation in real-time.
          </p>
        </div>

        <button className="btn btn-outline" onClick={handleReset}>
          <RotateCcw size={15} />
          <span>Reset Parameters</span>
        </button>
      </div>

      <div className="grid-2">
        {/* Sliders Column */}
        <div>
          {/* Debt Slider */}
          <div className="slider-group">
            <div className="slider-header">
              <span className="slider-title">Debt Expansion / Payoff</span>
              <span className="slider-value" style={{ color: debtDeltaPct > 0 ? 'var(--color-debt)' : debtDeltaPct < 0 ? 'var(--color-asset)' : 'var(--text-primary)' }}>
                {debtDeltaPct > 0 ? `+${debtDeltaPct}%` : `${debtDeltaPct}%`}
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="100"
              step="5"
              value={debtDeltaPct}
              onChange={(e) => setDebtDeltaPct(parseInt(e.target.value))}
              className="range-input"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <span>-50% (De-leveraging)</span>
              <span>0% (Baseline)</span>
              <span>+100% (Doubling Debt)</span>
            </div>
          </div>

          {/* Revenue Slider */}
          <div className="slider-group">
            <div className="slider-header">
              <span className="slider-title">Top-Line Revenue Growth / Decline</span>
              <span className="slider-value" style={{ color: revenueDeltaPct > 0 ? 'var(--color-asset)' : revenueDeltaPct < 0 ? 'var(--color-debt)' : 'var(--text-primary)' }}>
                {revenueDeltaPct > 0 ? `+${revenueDeltaPct}%` : `${revenueDeltaPct}%`}
              </span>
            </div>
            <input
              type="range"
              min="-40"
              max="60"
              step="5"
              value={revenueDeltaPct}
              onChange={(e) => setRevenueDeltaPct(parseInt(e.target.value))}
              className="range-input"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <span>-40% (Recession)</span>
              <span>0% (Baseline)</span>
              <span>+60% (Hypergrowth)</span>
            </div>
          </div>

          {/* COGS Slider */}
          <div className="slider-group">
            <div className="slider-header">
              <span className="slider-title">Cost of Goods Sold (COGS) Delta</span>
              <span className="slider-value" style={{ color: cogsDeltaPct > 0 ? 'var(--color-debt)' : 'var(--text-primary)' }}>
                {cogsDeltaPct > 0 ? `+${cogsDeltaPct}%` : `${cogsDeltaPct}%`}
              </span>
            </div>
            <input
              type="range"
              min="-20"
              max="30"
              step="2"
              value={cogsDeltaPct}
              onChange={(e) => setCogsDeltaPct(parseInt(e.target.value))}
              className="range-input"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <span>-20% (Supply Efficiencies)</span>
              <span>0%</span>
              <span>+30% (Inflation Spike)</span>
            </div>
          </div>

          {/* OpEx Slider */}
          <div className="slider-group">
            <div className="slider-header">
              <span className="slider-title">Operating Expenses (OpEx) Delta</span>
              <span className="slider-value" style={{ color: opexDeltaPct > 0 ? 'var(--color-debt)' : 'var(--text-primary)' }}>
                {opexDeltaPct > 0 ? `+${opexDeltaPct}%` : `${opexDeltaPct}%`}
              </span>
            </div>
            <input
              type="range"
              min="-20"
              max="30"
              step="2"
              value={opexDeltaPct}
              onChange={(e) => setOpexDeltaPct(parseInt(e.target.value))}
              className="range-input"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <span>-20% (Cost Cutting)</span>
              <span>0%</span>
              <span>+30% (Aggressive Hiring)</span>
            </div>
          </div>
        </div>

        {/* Results Comparison Column */}
        <div>
          {sim && base && (
            <div style={{ background: 'var(--bg-card-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>
                Baseline vs. Simulated Outcome
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {/* Total Debt Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Debt</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{formatCurrency(base.totalDebt)}</span>
                    <ArrowRight size={13} color="var(--text-muted)" />
                    <strong style={{ color: 'var(--color-debt)' }}>{formatCurrency(sim.totalDebt)}</strong>
                  </div>
                </div>

                {/* Net Profit Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Net Profit (P&L)</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{formatCurrency(base.netProfit)}</span>
                    <ArrowRight size={13} color="var(--text-muted)" />
                    <strong style={{ color: sim.netProfit >= 0 ? 'var(--color-asset)' : 'var(--color-debt)' }}>
                      {formatCurrency(sim.netProfit)}
                    </strong>
                  </div>
                </div>

                {/* Debt-to-Equity Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Debt-to-Equity (D/E)</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{base.debtToEquity}x</span>
                    <ArrowRight size={13} color="var(--text-muted)" />
                    <strong style={{ color: sim.debtToEquity > 1.5 ? 'var(--color-debt)' : 'var(--color-asset)' }}>
                      {sim.debtToEquity}x
                    </strong>
                  </div>
                </div>

                {/* Net Margin Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Net Margin %</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{base.netMargin}%</span>
                    <ArrowRight size={13} color="var(--text-muted)" />
                    <strong style={{ color: sim.netMargin >= 0 ? 'var(--color-asset)' : 'var(--color-debt)' }}>
                      {sim.netMargin}%
                    </strong>
                  </div>
                </div>

                {/* Altman Z-Score Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Altman Z-Score</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{base.altmanZScore}</span>
                    <ArrowRight size={13} color="var(--text-muted)" />
                    <strong style={{ color: sim.altmanZScore >= 2.99 ? 'var(--color-asset)' : sim.altmanZScore >= 1.81 ? 'var(--color-warning)' : 'var(--color-debt)' }}>
                      {sim.altmanZScore} ({sim.solvencyZone})
                    </strong>
                  </div>
                </div>
              </div>

              {/* Actionable Narrative Alerts */}
              <div style={{ marginTop: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                  Stress-Test Insights
                </span>
                <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {simResult?.insights && simResult.insights.length > 0 ? (
                    simResult.insights.map((ins, i) => (
                      <div key={i} style={{
                        fontSize: '0.8rem',
                        background: 'rgba(15, 23, 42, 0.7)',
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        borderLeft: '3px solid var(--color-warning)'
                      }}>
                        {ins}
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Adjust the sliders to view real-time stress testing insights.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
