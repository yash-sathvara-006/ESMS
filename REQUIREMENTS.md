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
| **5** | Deterministic Backend Testing Suite (32 Tests) | ✅ **Completed** | 5 suites (32/32 passed in ~2.6s): Salary Math, Zod Validation, Analytics Metrics, Transactions, API Contracts & Dynamic Timeframe. |
| **6** | Frontend Dashboard, UI Library & Skeletons | ✅ **Completed** | React 19 UI, Reusable UI Component Library (`Button`, `Input`, `Select`, `Badge`, `Card`, `Modal`, `MonthYearPicker`), CSS tokens (`index.css`), `react-hot-toast` at top-right, `react-loading-skeleton` wrapper (`Skeleton.tsx`), Chart.js compensation analytics ("How Org Pays People"), 10k Server-side Grid, Transactional Salary Modal. |
| **7** | Frontend Automated Testing Suite (34 Tests) | ✅ **Completed** | 10 suites (34/34 passed in ~27s): Reusable Design System Components, MonthYearPicker dropdowns, Business Logic Salary Modal & Calculations, API Client, and Page-Level Views (`DashboardPage`, `EmployeesPage`). |
| **8** | Production Polish & Verification | ✅ **Completed** | 66/66 Full-Stack Monorepo Tests Passing (`npm test`), strict TypeScript verification (0 errors), and comprehensive documentation. |

---

## 🎯 Assessment Expectations & Requirement Alignment Matrix

| Evaluation Criteria | System Evidence & Implementation Location |
| :--- | :--- |
| **Clarity in Thought & Structured Problem Solving** | Clear 1-Page PRD ([PRD.md](docs/prd/PRD.md)) focusing on the HR Manager persona; explicit non-goals (excluded banking payouts/taxes to preserve timeline focus). |
| **Strong Engineering Fundamentals & 3NF Design** | Relational 3NF architecture ([ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md)); composite B-tree indexes for fast 10k querying; zero duplicate employee codes/emails. |
| **Thoughtful Architecture & Reliability** | ACID transaction boundaries (`prisma.$transaction`) on salary modifications; immutable audit trail; automated seeding auto-bootstrap; server-side pagination to eliminate client lag. |
| **Production-Quality Code & Tests (66 Tests)** | 66 deterministic unit & integration tests across 15 suites (32 Backend + 34 Frontend) passing with 100% success rate; dual-tier Zod validation; zero multi-currency math drift; independent per-section month/year timeframe analytics; rigorous component test coverage. |
| **Intentional AI Collaboration with Quality** | Documented prompt logs and architectural course-corrections ([AI_COLLABORATION_AND_PROMPTS.md](docs/artifacts/AI_COLLABORATION_AND_PROMPTS.md)); human-in-the-loop steering. |

---

## 🧪 Comprehensive Automated Testing Matrix (66 Production Tests across 15 Suites)

The full-stack test suite contains **zero dummy or hardcoded mock passes**. All tests validate real algorithmic edge cases, live database mutations in SQLite (`dev.db`), end-to-end HTTP responses via Supertest, and complete React user interactions via Vitest and React Testing Library.

```bash
# Run the complete full-stack suite (all 66 tests across backend & frontend):
npm test
```

---

### Part A: Backend Automated Testing Matrix (30 Tests across 5 Suites)

#### 1. Suite 1: Salary Math & Multi-Currency Engine (`tests/salary-calculations.test.ts`) - 6 Tests
* **Test 1.1:** Net salary calculation precision (`baseSalary + bonus - deductions`).
* **Test 1.2:** Boundary handling with zero bonus and zero deductions.
* **Test 1.3:** Normalized USD conversion across all 8 global jurisdictions (USD, GBP, EUR, INR, SGD, CAD, AUD, JPY).
* **Test 1.4:** Reconciliation against database master country exchange rates.
* **Test 1.5:** Numeric scale and large integer overflow handling (e.g., 15M+ JPY calculations).
* **Test 1.6:** Bonus and deduction ratio constraint validation.

#### 2. Suite 2: Dual-Tier Zod Schema Validation (`tests/zod-validation.test.ts`) - 7 Tests
* **Test 2.1:** Sensible default assignments for employee query filters (`page: 1, limit: 25, sortBy: employeeCode`).
* **Test 2.2:** URL string numeric coercion (`page: "3"` coerced into number `3`).
* **Test 2.3:** Rejection of `limit > 100` to prevent memory exhaustion and DoS vulnerabilities.
* **Test 2.4:** Strict rejection of invalid gender and employee status enums.
* **Test 2.5:** Acceptance of well-formed salary update payloads.
* **Test 2.6:** Rejection of negative base salaries, negative bonuses, and negative deductions.
* **Test 2.7:** Strict enforcement of 3-character ISO currency codes and minimum change reason lengths.

#### 3. Suite 3: Compensation Analytics Math (`tests/analytics-math.test.ts`) - 6 Tests
* **Test 3.1:** Exact median calculation across both odd and even dataset sample sizes.
* **Test 3.2:** Department spend share distribution percentages summing to exactly 100%.
* **Test 3.3:** Global jurisdiction spend normalization into USD without floating-point precision error.
* **Test 3.4:** Gender pay parity equity ratio ($Female / Male$) and zero-division protection.
* **Test 3.5:** Salary band distribution covering the full continuum (<$50k to $160k+) without gaps or overlaps.
* **Test 3.6:** Zero active employee headcount edge case returning safe zeroed metrics without crashing.

#### 4. Suite 4: Transactional Integrity & Audit Logging (`tests/transaction-audit.test.ts`) - 4 Tests
* **Test 4.1:** Real SQLite mutation: atomically rotates `isCurrent: false` on previous salary and inserts new active salary.
* **Test 4.2:** Real SQLite verification: asserts creation of immutable `SalaryAuditLog` row with previous and new compensation differentials.
* **Test 4.3:** Invariant check: guarantees exactly one active salary record remains flagged as `isCurrent` per employee.
* **Test 4.4:** Atomic rollback: throws error and aborts transaction when non-existent employee ID is targeted.

#### 5. Suite 5: HTTP REST API Integration Contracts (`tests/api-integration.test.ts`) - 9 Tests
* **Test 5.1:** `GET /api/health` returns HTTP 200 with status `'success'` and active database provider.
* **Test 5.2:** `GET /api/metadata/departments` returns all 8 organizational departments.
* **Test 5.3:** `GET /api/metadata/countries` returns all 8 global jurisdictions with exchange rates.
* **Test 5.4:** `GET /api/employees` executes server-side pagination over 10,000 seeded records with 25 records/page and meta headers.
* **Test 5.5:** `GET /api/employees?search=EMP-00001` performs fast indexed server-side lookup.
* **Test 5.6:** `GET /api/analytics/summary` aggregates all 10,000 active employees in real-time, verifying total payroll > $500M ($879.7M).
* **Test 5.7:** `PUT /api/employees/:id/salary` validates payloads and returns HTTP 400 Bad Request with field-level error messages.
* **Test 5.8:** `GET /api/analytics/timeframe` dynamically retrieves database available years range and current period.
* **Test 5.9:** `GET /api/analytics/summary?year=2024&month=6` executes point-in-time headcount calculation (`hireDate <= asOfDate`).

---

### Part B: Frontend Automated Testing Matrix (33 Tests across 10 Suites)

Environment: **Vitest + React Testing Library + JSDOM + `@testing-library/jest-dom`**

#### 6. Suite 6: Button Component (`src/components/ui/__tests__/Button.test.tsx`) - 6 Tests
* **Test 6.1:** Renders button children and labels properly.
* **Test 6.2:** Triggers `onClick` handler when clicked by user.
* **Test 6.3:** Enforces `disabled` state and prevents click event emission.
* **Test 6.4:** Displays loading spinner (`CircularProgress`) and blocks interaction when `isLoading: true`.
* **Test 6.5:** Renders left and right accessory icons (`leftIcon`, `rightIcon`).
* **Test 6.6:** Renders distinct design token variants (`primary`, `secondary`, `outline`, `ghost`, `danger`).

#### 7. Suite 7: Status & Level Badge Component (`src/components/ui/__tests__/Badge.test.tsx`) - 3 Tests
* **Test 7.1:** Renders string labels accurately in Chip container.
* **Test 7.2:** Gracefully falls back to `children` nodes when label is omitted.
* **Test 7.3:** Correctly styles all status color themes (`emerald`, `purple`, `rose`, `amber`, `neutral`).

#### 8. Suite 8: Card Surface Container (`src/components/ui/__tests__/Card.test.tsx`) - 3 Tests
* **Test 8.1:** Renders encapsulated child content and children components.
* **Test 8.2:** Conditionally renders card header with title and subtitle typography.
* **Test 8.3:** Accommodates `headerRight` action buttons and utility controls.

#### 9. Suite 9: Debounced Search Input (`src/components/ui/__tests__/SearchInput.test.tsx`) - 3 Tests
* **Test 9.1:** Renders search input with placeholder text and search icon.
* **Test 9.2:** Dispatches immediate `onChange` event on every keystroke.
* **Test 9.3:** Throttles and dispatches `onDebouncedChange` only after the 350ms debounce quiet period using fake timers.

#### 10. Suite 10: Server-Side Data Table Grid (`src/components/ui/__tests__/DataTable.test.tsx`) - 4 Tests
* **Test 10.1:** Renders table column headers and multiple rows of cell data.
* **Test 10.2:** Displays helpful custom empty state message when records array is empty.
* **Test 10.3:** Dispatches `onRowClick` handler with target row entity.
* **Test 10.4:** Operates pagination controls (Next / Previous buttons) and dispatches target page index.

#### 11. Suite 11: Transactional Salary Edit Modal (`src/components/__tests__/SalaryEditModal.test.tsx`) - 5 Tests
* **Test 11.1:** Renders targeted employee profile, employee code, department, and current compensation breakdown.
* **Test 11.2:** Returns `null` and prevents DOM mounting when `isOpen: false` or `employee: null`.
* **Test 11.3:** Enforces strict audit governance by validating minimum 3-character change reason before submission.
* **Test 11.4:** Dynamically calculates and displays live net salary (`Base + Bonus - Deductions`) in real-time as inputs change.
* **Test 11.5:** Submits sanitized compensation payload via `api.updateSalary` and executes modal dismissal callbacks.

#### 12. Suite 12: Typed API Client Service (`src/services/__tests__/api.test.ts`) - 3 Tests
* **Test 12.1:** Formats query parameters into search URL and returns paginated `{ data, meta }` response.
* **Test 12.2:** Serializes JSON body and issues HTTP `PUT` request with headers for salary alterations.
* **Test 12.3:** Intercepts HTTP error responses and throws structured error messages from backend payload.

#### 13. Suite 13: Compensation Analytics Dashboard (`src/pages/__tests__/DashboardPage.test.tsx`) - 2 Tests
* **Test 13.1:** Mounts dashboard, mocks Chart.js canvas elements, fetches strategic metrics from `/api/analytics/summary`, and asserts rendering of "How we pay people" header, total headcount ($10,000$), and department spend distribution table.
* **Test 13.2:** Renders independent month and year filters (`MonthYearPicker`) for both "Average salary by country" and "Salary distribution" sections in their respective card headers (`headerRight`).

#### 14. Suite 14: Employee Directory Page (`src/pages/__tests__/EmployeesPage.test.tsx`) - 1 Test
* **Test 14.1:** Mounts directory under `MemoryRouter`, loads filter metadata (departments, countries), populates 10,000 employee grid, and displays employee profile alongside synchronized master-detail side panel.

#### 15. Suite 15: Dynamic MonthYearPicker Component (`src/components/ui/__tests__/MonthYearPicker.test.tsx`) - 4 Tests
* **Test 15.1:** Renders selected month and year interactive dropdown buttons with accessible labels.
* **Test 15.2:** Opens month dropdown listbox and triggers `onChange(newMonth, year)` upon option selection.
* **Test 15.3:** Opens year dropdown listbox and triggers `onChange(month, newYear)` upon option selection.
* **Test 15.4:** Enforces `disabled` state on both dropdown triggers when disabled prop is true.


