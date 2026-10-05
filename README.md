# EquiBalance 📊
### Corporate Balance Sheet, Debt, Profit & Asset Intelligence Platform

EquiBalance is a modular Full-Stack (MERN) financial intelligence application that allows corporate executives, financial analysts, and accountants to build, audit, and visualize **Balance Sheets**, inspect **Debt & Leverage**, monitor **Profit Margins (P&L)**, and evaluate **Asset Allocation** with interactive visual charts and real-time stress testing.

---

## 🚀 Key Modules

1. **Balance Sheet Builder & Real-Time Equilibrium Validator**:
   - Enforces the foundational accounting equation: $\text{Total Assets} = \text{Total Liabilities} + \text{Shareholder Equity}$.
   - Live equilibrium badge alerts whenever a balance sheet is out of balance by even $1.
   - One-click **Auto-Balance** helper adjusting Retained Earnings.
   - Full in-place editing of line items with subtotal rollups and CSV export.

2. **Debt & Leverage Structure Intelligence**:
   - Tracks Short-Term Debt vs. Long-Term Bonds.
   - Solvency and leverage metrics: **Debt-to-Equity (D/E)**, **Debt-to-Assets**, and **Interest Coverage Ratio**.
   - Visual gauge of credit risk and debt maturity schedule.

3. **Profit & P&L Statement Engine**:
   - Step-down accounting from Top-line Revenue $\rightarrow$ COGS $\rightarrow$ Gross Profit $\rightarrow$ Operating Expenses (R&D, SG&A) $\rightarrow$ EBIT $\rightarrow$ Taxes & Debt Interest $\rightarrow$ **Net Profit**.
   - **Interactive SVG Waterfall Chart** showing step-by-step impact of deductions.
   - Profitability margin scorecards (Gross Margin %, Operating Margin %, Net Margin %, ROA, ROE).

4. **Asset Composition & Liquidity Intelligence**:
   - Liquid Reserves (Cash, Receivables, Marketable Securities) vs. Fixed Productive Assets (PP&E, Intangibles).
   - **Net Working Capital** ($\text{Current Assets} - \text{Current Liabilities}$) tracking.
   - **Current Ratio** and **Quick Ratio (Acid-Test)** liquidity gauges.
   - Interactive SVG asset distribution donut chart.

5. **Multi-Period Financial Trends**:
   - Interactive multi-line trend charts comparing historical quarters and fiscal years.
   - Toggle views between **Capital Structure (Assets vs Debt vs Equity)** and **Growth (Revenue vs Net Profit)**.

6. **"What-If" Financial Scenario Simulator**:
   - Real-time stress-test sliders for Debt expansion/paydown, Revenue shocks, and cost inflation.
   - Live recalculation of Debt-to-Equity, Net Margin, and **Altman Z-Score** bankruptcy classification.

---

## 💻 Tech Stack

- **Frontend**: React 18, Vite, Lucide Icons, Custom Corporate Fintech CSS Design System (no heavy utility dependencies, pure responsive styling with glassmorphism & dark fintech palette).
- **Backend**: Node.js, Express.js REST API with Mongoose ODM.
- **Database**: MongoDB (Supports MongoDB Atlas URI and features seamless fallback to an embedded in-memory MongoDB server for zero-configuration startup).

---

## 🛠️ Getting Started

### 1. Run the Backend API
```bash
cd server
npm install
npm start
```
The server will start on port `5000` and automatically connect to MongoDB (or launch an embedded in-memory database) and pre-seed sample companies (Apex Cloud Systems, Titan Heavy Industries, OmniRetail Global).

### 2. Run the React Client
```bash
cd client
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.
