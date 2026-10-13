# Product Requirements Document (PRD)
## Enterprise Salary Management System (ESMS)

**Document Version:** 1.0.0  
**Target Audience:** Engineering, Product, HR Leadership  
**Primary Persona:** HR Manager (Global Operations)  
**Organization Scale:** 10,000 Employees across multiple countries  

---

### 1. Executive Summary & Problem Framing
The organization currently tracks and operates salary data for **10,000 employees distributed across multiple countries and currencies** using disparate Excel spreadsheets. This legacy operational mode introduces critical pain points:
* **Severe Performance & Concurrency Bottlenecks:** Opening and computing formulae across large spreadsheet files is slow, error-prone, and prone to merge conflicts.
* **Lack of Executive Visibility:** Answering foundational executive questions—such as *"How does the organization pay people?"*, *"What is our departmental spend by geography?"*, and *"Do we have pay parity gaps across genders or salary bands?"*—requires days of manual pivot-table synthesis.
* **Audit & Compliance Risk:** Spreadsheets lack automated audit trails for salary modifications, historical change tracking, and role-based data validation.

**Product Vision:** Deliver a modern, high-performance, web-based salary intelligence and operations platform that enables the HR Manager to manage compensation records at scale and extract immediate strategic insights into global compensation.

---

### 2. User Persona & Key Jobs-To-Be-Done (JTBD)
* **Persona:** HR Manager (Global Operations & Compensation).
* **Primary JTBD 1 (Operational Management):** *"When an employee joins, changes roles, or receives a raise, I want to view, search, filter, and adjust their compensation securely with dual-layer validation so our data is consistently accurate."*
* **Primary JTBD 2 (Executive Compensation Insights):** *"When executive leadership requests compensation audits, I want real-time analytics on company-wide spend, country distribution, department payroll, currency normalization, and pay equity so I can answer questions authoritatively in seconds."*

---

### 3. Product Scope & Core Capabilities

#### A. Compensation Analytics Engine ("How the Org Pays People")
* **Global KPI Metrics:** Total payroll expenditure (normalized to USD benchmark), average salary, median salary, and active headcounts.
* **Payroll Breakdown by Department & Country:** Multi-dimensional aggregated spend and average compensation across departments (Engineering, Sales, Marketing, HR, Finance, Product, Operations) and regions (US, UK, India, Germany, Canada, Singapore).
* **Pay Equity & Distribution Analysis:** Gender pay gap analysis and compensation spread across standardized salary grades/bands (Entry, Mid, Senior, Lead, Executive).
* **Multi-Currency Normalization:** Dynamic conversion of local currencies (USD, GBP, EUR, INR, CAD, SGD) into unified reporting benchmarks using base exchange rates.

#### B. Scalable Employee Compensation Directory
* **Server-Side Operations for 10,000 Records:** Zero client-side freezing. Database-indexed server-side pagination, multi-column sorting, debounced full-text search (Name, Email, Employee Code), and multi-criteria filtering (Department, Country, Gender, Salary Band).
* **Single Employee Detail & History:** View base salary, allowances/bonuses, deductions, net compensation, and historical salary revisions.
* **Salary Adjustments with Audit Trail:** Interactive adjustment workflow with dual validation (Frontend + Backend Zod schemas) that logs previous salary, new salary, adjustment reason, and timestamp atomically.

---

### 4. Deliberately Out-of-Scope (Non-Goals) & Strategic Rationale

To deliver an exceptional, robust, and zero-defect solution within the assessment timeline, the following features have been intentionally excluded:

| Feature Out of Scope | Strategic & Engineering Rationale |
| :--- | :--- |
| **Full Direct-Deposit Payroll Processing** (Bank ACH/Wire integrations) | Bank disbursement requires third-party clearing rails and banking licenses. The core goal is **salary data management and compensation intelligence**, not payment gateway execution. |
| **Complex Dynamic Tax Code Engines per Jurisdiction** | Localized payroll taxes (e.g., US 401k/W-2 vs. Indian TDS/PF vs. UK PAYE) vary by thousands of tax jurisdictions. A standardized deduction model is implemented, leaving specialized tax filing to external ERPs. |
| **Self-Service Employee Portal** | The target persona is explicitly the **HR Manager**. Building employee logins and individual paystub views dilutes focus from HR analytics and administrative workflows. |
| **Real-time Live Forex Trading Feeds** | Real-time currency fluctuation introduces non-deterministic reporting variances during quarterly reviews. Centralized, configurable corporate exchange rates ensure predictable and deterministic reporting. |

---

### 5. Non-Functional & Technical Excellence Criteria
* **Query Latency:** Sub-50ms query latency for 10,000 records via composite B-tree indexing on foreign keys and search fields.
* **Data Integrity & Normalization:** Strictly normalized 3rd Normal Form (3NF) relational database preventing data duplication and update anomalies.
* **Transactional Atomicity (ACID):** All salary updates and audit logs execute inside isolated database transactions (`prisma.$transaction`).
* **Test Reliability:** 100% deterministic unit & integration tests covering calculation algorithms, currency conversions, and API routes.
