import React from 'react';
import { CheckCircle2, AlertOctagon, Wand2 } from 'lucide-react';

const formatCurrency = (val) => {
  if (val === undefined || val === null) return '$0';
  return `$${val.toLocaleString()}`;
};

export default function BalanceEquationBanner({ report, onAutoBalance }) {
  if (!report) return null;

  const totalAssets = report.assets?.totalAssets || 0;
  const totalLiabilities = report.liabilities?.totalLiabilities || 0;
  const totalEquity = report.equity?.totalEquity || 0;
  const totalFinanced = totalLiabilities + totalEquity;
  const diff = totalAssets - totalFinanced;
  const isBalanced = Math.abs(diff) < 1;

  return (
    <div className="equation-banner">
      <div className="equation-formula">
        <div className="eq-item">
          <span className="eq-label">Assets</span>
          <span className="eq-val asset">{formatCurrency(totalAssets)}</span>
        </div>

        <span className="eq-sym">=</span>

        <div className="eq-item">
          <span className="eq-label">Liabilities</span>
          <span className="eq-val debt">{formatCurrency(totalLiabilities)}</span>
        </div>

        <span className="eq-sym">+</span>

        <div className="eq-item">
          <span className="eq-label">Equity</span>
          <span className="eq-val equity">{formatCurrency(totalEquity)}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div className={`balance-status-badge ${isBalanced ? 'balanced' : 'unbalanced'}`}>
          {isBalanced ? (
            <>
              <CheckCircle2 size={16} />
              <span>Balanced (Equation Holds)</span>
            </>
          ) : (
            <>
              <AlertOctagon size={16} />
              <span>
                Imbalance: {diff > 0 ? '+' : ''}{formatCurrency(diff)}
              </span>
            </>
          )}
        </div>

        {!isBalanced && onAutoBalance && (
          <button 
            className="btn btn-outline" 
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
            onClick={onAutoBalance}
            title="Automatically adjust Retained Earnings to re-balance the sheet"
          >
            <Wand2 size={13} />
            <span>Auto-Balance</span>
          </button>
        )}
      </div>
    </div>
  );
}
