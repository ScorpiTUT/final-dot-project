import React, { useState } from 'react';
import { X, Building2 } from 'lucide-react';

export default function CompanyModal({ isOpen, onClose, onCompanyCreated }) {
  const [name, setName] = useState('');
  const [ticker, setTicker] = useState('');
  const [industry, setIndustry] = useState('Technology');
  const [currency, setCurrency] = useState('USD');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !ticker) {
      setError('Company Name and Ticker Symbol are required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onCompanyCreated({
        name,
        ticker: ticker.toUpperCase(),
        industry,
        currency,
        description,
      });
      setName('');
      setTicker('');
      setDescription('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create company profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem' }}>
            <Building2 size={18} color="var(--color-equity)" />
            <span>Add New Corporate Entity</span>
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

            <div className="form-group">
              <label className="form-label">Company Legal Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., Nova Robotics Inc"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid-2" style={{ marginBottom: 0 }}>
              <div className="form-group">
                <label className="form-label">Ticker Symbol *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., NVRO"
                  maxLength="6"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Industry</label>
                <select
                  className="form-control"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                >
                  <option value="Technology">Technology</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Retail">Retail</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Energy">Energy</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Reporting Currency</label>
              <select
                className="form-control"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="USD">USD ($ - US Dollar)</option>
                <option value="EUR">EUR (€ - Euro)</option>
                <option value="GBP">GBP (£ - British Pound)</option>
                <option value="CAD">CAD ($ - Canadian Dollar)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Company Description</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Brief summary of business model, core products, and market focus..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Company'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
