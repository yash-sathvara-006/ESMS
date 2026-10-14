# Requirements & Project Artifacts Directory

This document serves as the primary gateway to the technical, architectural, and product specifications for the **Enterprise Employee Salary Management System (ESMS)**.

---

## 📑 Core Project Artifacts & Specifications

1. **One-Page Product Requirements Document (PRD):**
   👉 **[docs/prd/PRD.md](docs/prd/PRD.md)**  
   *Outlines executive summary, HR Manager user persona, core features, deliberate non-goals & exclusions with engineering reasoning, and non-functional requirements.*

2. **System Architecture & 3NF Design Specification:**
   👉 **[docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md)**  
   *Details the 3NF relational normalization, B-tree composite indexing, database transactions (`prisma.$transaction`), and dual-tier Zod validation pipeline.*

3. **Seeding & Data Strategy (10,000 Multi-Country Records):**
   👉 **[docs/architecture/SEEDING_AND_DATA_STRATEGY.md](docs/architecture/SEEDING_AND_DATA_STRATEGY.md)**  
   *Benchmarks the high-speed 3.63s batch seeding algorithm, multi-currency conversion matrix across 8 jurisdictions, zero-configuration auto-bootstrap, uniqueness audit report, and the SQLite vs. PostgreSQL scalability trade-off analysis.*

4. **Intentional AI Collaboration & Prompt Engineering Log:**
   👉 **[docs/artifacts/AI_COLLABORATION_AND_PROMPTS.md](docs/artifacts/AI_COLLABORATION_AND_PROMPTS.md)**  
   *Documents structured prompt design, human-in-the-loop architectural guardrails, technical course-corrections, and verification procedures.*

---

## 🚦 Implementation Milestones Status

| Phase | Milestone | Status | Key Deliverable |
| :---: | :--- | :---: | :--- |
| **1** | Project Setup & Monorepo Baseline | ✅ **Completed** | Clean workspaces (`web-esms`, `backend-esms`, `shared-types`), Git baseline. |
| **2** | 3NF Database Normalization & Prisma | ✅ **Completed** | 5 Relational Models, Foreign keys, B-tree indexes, SQLite `dev.db`. |
| **3** | 10,000 Employees Seeding & Auto-Bootstrap | ✅ **Completed** | Deterministic seed in 3.63s, 10k unique records, zero-config startup. |
| **4** | Backend APIs & Business Logic | ✅ **Completed** | Server-side Search/Filter/Pagination, Analytics Endpoints, Salary Transactions. |
| **5** | Deterministic Unit Testing Suite (30 Tests) | ✅ **Completed** | 5 suites (30/30 passed in 2.38s): Salary Math, Zod Validation, Analytics Metrics, Transactions, API Contracts. |
| **6** | Frontend Dashboard, UI Library & Skeletons | ✅ **Completed** | React 19 UI, Reusable UI Component Library (`Button`, `Input`, `Select`, `Badge`, `Card`, `Modal`), CSS tokens (`index.css`), `react-hot-toast` at top-right, `react-loading-skeleton` wrapper (`Skeleton.tsx`), Chart.js compensation analytics ("How Org Pays People"), 10k Server-side Grid, Transactional Salary Modal. |
| **7** | Production Polish & Demo Readiness | 🕒 **Pending** | Final README instructions, verification, and demo delivery. |

---

## 🎯 Assessment Expectations & Requirement Alignment Matrix

| Evaluation Criteria | System Evidence & Implementation Location |
| :--- | :--- |
| **Clarity in Thought & Structured Problem Solving** | Clear 1-Page PRD ([PRD.md](docs/prd/PRD.md)) focusing on the HR Manager persona; explicit non-goals (excluded banking payouts/taxes to preserve timeline focus). |
| **Strong Engineering Fundamentals & 3NF Design** | Relational 3NF architecture ([ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md)); composite B-tree indexes for fast 10k querying; zero duplicate employee codes/emails. |
| **Thoughtful Architecture & Reliability** | ACID transaction boundaries (`prisma.$transaction`) on salary modifications; immutable audit trail; automated seeding auto-bootstrap; server-side pagination to eliminate client lag. |
| **Production-Quality Code & Tests** | 30 deterministic unit & integration tests across 5 suites passing in < 2.5s; dual-tier Zod validation; zero floating-point multi-currency math drift. |
| **Intentional AI Collaboration with Quality** | Documented prompt logs and architectural course-corrections ([AI_COLLABORATION_AND_PROMPTS.md](docs/artifacts/AI_COLLABORATION_AND_PROMPTS.md)); human-in-the-loop steering. |

---

## 🧪 Comprehensive Automated Testing Matrix (30 Production Tests)

The test suite contains **zero dummy or hardcoded mock passes**. All tests validate real algorithmic edge cases, live database mutations in SQLite (`dev.db`), and end-to-end HTTP responses via Supertest.

### 1. Suite 1: Salary Math & Multi-Currency Engine (`tests/salary-calculations.test.ts`) - 6 Tests
* **Test 1.1:** Net salary calculation precision (`baseSalary + bonus - deductions`).
* **Test 1.2:** Boundary handling with zero bonus and zero deductions.
* **Test 1.3:** Normalized USD conversion across all 8 global jurisdictions (USD, GBP, EUR, INR, SGD, CAD, AUD, JPY).
* **Test 1.4:** Reconciliation against database master country exchange rates.
* **Test 1.5:** Numeric scale and large integer overflow handling (e.g., 15M+ JPY calculations).
* **Test 1.6:** Bonus and deduction ratio constraint validation.

### 2. Suite 2: Dual-Tier Zod Schema Validation (`tests/zod-validation.test.ts`) - 7 Tests
* **Test 2.1:** Sensible default assignments for employee query filters (`page: 1, limit: 25, sortBy: employeeCode`).
* **Test 2.2:** URL string numeric coercion (`page: "3"` coerced into number `3`).
* **Test 2.3:** Rejection of `limit > 100` to prevent memory exhaustion and DoS vulnerabilities.
* **Test 2.4:** Strict rejection of invalid gender and employee status enums.
* **Test 2.5:** Acceptance of well-formed salary update payloads.
* **Test 2.6:** Rejection of negative base salaries, negative bonuses, and negative deductions.
* **Test 2.7:** Strict enforcement of 3-character ISO currency codes and minimum change reason lengths.

### 3. Suite 3: Compensation Analytics Math (`tests/analytics-math.test.ts`) - 6 Tests
* **Test 3.1:** Exact median calculation across both odd and even dataset sample sizes.
* **Test 3.2:** Department spend share distribution percentages summing to exactly 100%.
* **Test 3.3:** Global jurisdiction spend normalization into USD without floating-point precision error.
* **Test 3.4:** Gender pay parity equity ratio ($Female / Male$) and zero-division protection.
* **Test 3.5:** Salary band distribution covering the full continuum (<$50k to $160k+) without gaps or overlaps.
* **Test 3.6:** Zero active employee headcount edge case returning safe zeroed metrics without crashing.

### 4. Suite 4: Transactional Integrity & Audit Logging (`tests/transaction-audit.test.ts`) - 4 Tests
* **Test 4.1:** Real SQLite mutation: atomically rotates `isCurrent: false` on previous salary and inserts new active salary.
* **Test 4.2:** Real SQLite verification: asserts creation of immutable `SalaryAuditLog` row with previous and new compensation differentials.
* **Test 4.3:** Invariant check: guarantees exactly one active salary record remains flagged as `isCurrent` per employee.
* **Test 4.4:** Atomic rollback: throws error and aborts transaction when non-existent employee ID is targeted.

### 5. Suite 5: HTTP REST API Integration Contracts (`tests/api-integration.test.ts`) - 7 Tests
* **Test 5.1:** `GET /api/health` returns HTTP 200 with status `'success'` and active database provider.
* **Test 5.2:** `GET /api/metadata/departments` returns all 8 organizational departments.
* **Test 5.3:** `GET /api/metadata/countries` returns all 8 global jurisdictions with exchange rates.
* **Test 5.4:** `GET /api/employees` executes server-side pagination over 10,000 seeded records with 25 records/page and meta headers.
* **Test 5.5:** `GET /api/employees?search=EMP-00001` performs fast indexed server-side lookup.
* **Test 5.6:** `GET /api/analytics/summary` aggregates all 10,000 active employees in real-time, verifying total payroll > $500M ($879.7M).
* **Test 5.7:** `PUT /api/employees/:id/salary` validates payloads and returns HTTP 400 Bad Request with field-level error messages.

