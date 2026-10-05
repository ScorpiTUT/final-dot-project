const API_BASE = '/api';

export const api = {
  // Companies
  async getCompanies() {
    const res = await fetch(`${API_BASE}/companies`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch companies');
    return json.data;
  },

  async getCompanyById(id) {
    const res = await fetch(`${API_BASE}/companies/${id}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch company');
    return json.data;
  },

  async createCompany(data) {
    const res = await fetch(`${API_BASE}/companies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to create company');
    return json.data;
  },

  async deleteCompany(id) {
    const res = await fetch(`${API_BASE}/companies/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to delete company');
    return json;
  },

  // Reports
  async getReportsByCompany(companyId) {
    const res = await fetch(`${API_BASE}/reports/company/${companyId}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch reports');
    return json.data;
  },

  async getReportById(id) {
    const res = await fetch(`${API_BASE}/reports/${id}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch report');
    return json.data;
  },

  async createOrUpdateReport(data) {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to save financial report');
    return json.data;
  },

  async deleteReport(id) {
    const res = await fetch(`${API_BASE}/reports/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to delete report');
    return json;
  },

  // Analytics
  async getCompanyTrends(companyId) {
    const res = await fetch(`${API_BASE}/analytics/trends/${companyId}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch trends');
    return json.data;
  },

  async simulateScenario(scenarioData) {
    const res = await fetch(`${API_BASE}/analytics/scenario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scenarioData),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to simulate scenario');
    return json.data;
  },
};
