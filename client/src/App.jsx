import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MetricCards from './components/MetricCards';
import BalanceEquationBanner from './components/BalanceEquationBanner';
import BalanceSheetLedger from './components/BalanceSheetLedger';
import DebtAnalyzer from './components/DebtAnalyzer';
import ProfitWaterfall from './components/ProfitWaterfall';
import AssetCompositionChart from './components/AssetCompositionChart';
import TrendAnalytics from './components/TrendAnalytics';
import ScenarioSimulator from './components/ScenarioSimulator';
import CompanyModal from './components/CompanyModal';
import ReportModal from './components/ReportModal';
import { api } from './services/api';
import { Building2, Calendar, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState('light');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Apply theme to html root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Modals
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Fetch initial companies on mount
  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getCompanies();
      setCompanies(data);
      if (data.length > 0) {
        const defaultComp = data[0];
        setSelectedCompany(defaultComp);
        await loadReportsForCompany(defaultComp._id);
      }
    } catch (err) {
      console.error('Failed to load companies:', err);
      setError(err.message || 'Unable to connect to EquiBalance backend server.');
    } finally {
      setLoading(false);
    }
  };

  const loadReportsForCompany = async (companyId) => {
    try {
      const repData = await api.getReportsByCompany(companyId);
      setReports(repData);
      if (repData.length > 0) {
        setSelectedReport(repData[0]);
      } else {
        setSelectedReport(null);
      }
    } catch (err) {
      console.error('Failed to load reports for company:', err);
    }
  };

  const handleSelectCompany = async (company) => {
    setSelectedCompany(company);
    await loadReportsForCompany(company._id);
  };

  const handleSelectReport = (report) => {
    setSelectedReport(report);
  };

  const handleCompanyCreated = async (newCompanyData) => {
    const created = await api.createCompany(newCompanyData);
    await loadCompanies();
    setSelectedCompany(created);
    await loadReportsForCompany(created._id);
  };

  const handleReportCreated = async (newReportPayload) => {
    const saved = await api.createOrUpdateReport(newReportPayload);
    await loadReportsForCompany(saved.companyId);
    setSelectedReport(saved);
  };

  const handleSaveReport = async (updatedReportDraft) => {
    const saved = await api.createOrUpdateReport(updatedReportDraft);
    // Refresh reports list
    await loadReportsForCompany(saved.companyId);
    setSelectedReport(saved);
    return saved;
  };

  const handleAutoBalance = async () => {
    if (!selectedReport) return;
    const copy = JSON.parse(JSON.stringify(selectedReport));
    const currentEquityWithoutRetained =
      (copy.equity.commonStock || 0) +
      (copy.equity.additionalPaidInCapital || 0) +
      (copy.equity.otherComprehensiveIncome || 0);

    const requiredEquity = copy.assets.totalAssets - copy.liabilities.totalLiabilities;
    copy.equity.retainedEarnings = Math.max(0, requiredEquity - currentEquityWithoutRetained);
    await handleSaveReport(copy);
  };

  return (
    <div className="app-container">
      {/* Navbar */}
      <Navbar
        companies={companies}
        selectedCompany={selectedCompany}
        onSelectCompany={handleSelectCompany}
        reports={reports}
        selectedReport={selectedReport}
        onSelectReport={handleSelectReport}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewCompanyModal={() => setIsCompanyModalOpen(true)}
        onOpenNewReportModal={() => setIsReportModalOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content */}
      <main className="main-content">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-asset)', fontSize: '1.2rem', fontWeight: 600 }}>
              <RefreshCw className="spin" size={24} />
              <span>Connecting to EquiBalance Financial Database...</span>
            </div>
          </div>
        ) : error ? (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            textAlign: 'center',
            maxWidth: '600px',
            margin: '3rem auto'
          }}>
            <AlertCircle size={36} color="var(--color-debt)" style={{ marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Backend Connection Required</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {error}
            </p>
            <button className="btn btn-primary" onClick={loadCompanies}>
              <RefreshCw size={15} />
              <span>Retry Connection</span>
            </button>
          </div>
        ) : !selectedCompany ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <h2>No Corporate Entity Selected</h2>
            <p style={{ color: 'var(--text-muted)' }}>Create a company profile or select one from the dropdown to start.</p>
          </div>
        ) : (
          <>
            {/* Selected Company Header Banner */}
            <div className="company-header">
              <div className="company-header-info">
                <h1>
                  <span>{selectedCompany.name}</span>
                  <span className="ticker-pill">{selectedCompany.ticker}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    {selectedCompany.industry} • Established {selectedCompany.foundedYear || 2018}
                  </span>
                </h1>
                <p>{selectedCompany.description || 'Corporate financial statements and balance sheet audit.'}</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Active Reporting Period
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end', fontWeight: 700, color: 'var(--color-asset)' }}>
                    <Calendar size={15} />
                    <span>{selectedReport?.periodLabel || 'No Period Report'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Accounting Equation Equilibrium Banner */}
            {selectedReport && (
              <BalanceEquationBanner
                report={selectedReport}
                onAutoBalance={handleAutoBalance}
              />
            )}

            {/* KPI Cards */}
            {selectedReport && (
              <MetricCards
                report={selectedReport}
                currency={selectedCompany.currency}
              />
            )}

            {/* TAB CONTENTS */}
            {activeTab === 'dashboard' && (
              <>
                <div className="grid-2">
                  <ProfitWaterfall report={selectedReport} />
                  <AssetCompositionChart report={selectedReport} />
                </div>
                <DebtAnalyzer report={selectedReport} />
              </>
            )}

            {activeTab === 'balance-sheet' && (
              <BalanceSheetLedger
                report={selectedReport}
                onSaveReport={handleSaveReport}
              />
            )}

            {activeTab === 'debt' && (
              <DebtAnalyzer report={selectedReport} />
            )}

            {activeTab === 'profit' && (
              <ProfitWaterfall report={selectedReport} />
            )}

            {activeTab === 'assets' && (
              <AssetCompositionChart report={selectedReport} />
            )}

            {activeTab === 'trends' && (
              <TrendAnalytics companyId={selectedCompany._id} />
            )}

            {activeTab === 'scenarios' && (
              <ScenarioSimulator report={selectedReport} />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <CompanyModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        onCompanyCreated={handleCompanyCreated}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        company={selectedCompany}
        onReportCreated={handleReportCreated}
      />
    </div>
  );
}
