import React from 'react';
import { 
  Building2, 
  PlusCircle, 
  FileSpreadsheet, 
  BarChart3, 
  Scale, 
  DollarSign, 
  PieChart, 
  LineChart, 
  Sliders,
  Layers,
  Sun,
  Moon
} from 'lucide-react';

export default function Navbar({
  companies,
  selectedCompany,
  onSelectCompany,
  reports,
  selectedReport,
  onSelectReport,
  activeTab,
  setActiveTab,
  onOpenNewCompanyModal,
  onOpenNewReportModal,
  theme,
  onToggleTheme,
}) {
  return (
    <header className="navbar">
      <div className="nav-content">
        {/* Brand */}
        <div className="brand-section">
          <div className="brand-icon">
            <Scale size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="brand-title">EquiBalance</span>
              <span className="brand-badge">Financial Intelligence</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Balance Sheet • Debt • Profit • Asset Analytics
            </div>
          </div>
        </div>

        {/* Company & Fiscal Period Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="company-selector-bar">
            <Building2 size={16} color="var(--color-equity)" />
            <select
              className="select-input"
              value={selectedCompany?._id || ''}
              onChange={(e) => {
                const found = companies.find((c) => c._id === e.target.value);
                if (found) onSelectCompany(found);
              }}
              title="Select Corporate Entity"
            >
              {companies.map((comp) => (
                <option key={comp._id} value={comp._id}>
                  {comp.name} ({comp.ticker})
                </option>
              ))}
            </select>
          </div>

          <div className="company-selector-bar">
            <FileSpreadsheet size={16} color="var(--color-asset)" />
            <select
              className="select-input"
              value={selectedReport?._id || ''}
              onChange={(e) => {
                const found = reports.find((r) => r._id === e.target.value);
                if (found) onSelectReport(found);
              }}
              disabled={!reports || reports.length === 0}
              title="Select Fiscal Period Report"
            >
              {reports && reports.length > 0 ? (
                reports.map((rep) => (
                  <option key={rep._id} value={rep._id}>
                    {rep.periodLabel || `${rep.period} ${rep.fiscalYear}`}
                  </option>
                ))
              ) : (
                <option value="">No reports found</option>
              )}
            </select>
          </div>

          <div className="nav-actions">
            <button
              className="theme-toggle-btn"
              onClick={onToggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Corporate Light' : 'Executive Midnight'} Theme`}
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <button
              className="btn btn-outline"
              onClick={onOpenNewCompanyModal}
              title="Add New Company Profile"
            >
              <PlusCircle size={15} />
              <span>New Company</span>
            </button>
            <button
              className="btn btn-primary"
              onClick={onOpenNewReportModal}
              title="Create New Balance Sheet Period"
            >
              <PlusCircle size={15} />
              <span>New Period</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="nav-tabs-wrapper" style={{ marginTop: '0.75rem' }}>
        <nav className="nav-tabs">
          <button
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <BarChart3 size={16} />
            <span>Executive Overview</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'balance-sheet' ? 'active' : ''}`}
            onClick={() => setActiveTab('balance-sheet')}
          >
            <Scale size={16} />
            <span>Balance Sheet Ledger</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'debt' ? 'active' : ''}`}
            onClick={() => setActiveTab('debt')}
          >
            <Layers size={16} />
            <span>Debt & Leverage</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'profit' ? 'active' : ''}`}
            onClick={() => setActiveTab('profit')}
          >
            <DollarSign size={16} />
            <span>Profit & P&L Waterfall</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'assets' ? 'active' : ''}`}
            onClick={() => setActiveTab('assets')}
          >
            <PieChart size={16} />
            <span>Asset Composition</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'trends' ? 'active' : ''}`}
            onClick={() => setActiveTab('trends')}
          >
            <LineChart size={16} />
            <span>Multi-Period Trends</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'scenarios' ? 'active' : ''}`}
            onClick={() => setActiveTab('scenarios')}
          >
            <Sliders size={16} />
            <span>What-If Simulator</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
