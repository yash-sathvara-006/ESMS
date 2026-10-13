# Architecture & System Design Specification
## Enterprise Salary Management System (ESMS)

### 1. High-Level Architecture Overview

The system is structured as an **Enterprise Production Monorepo** designed for high throughput, maintainability, and clean separation of concerns.

```mermaid
graph TD
    Client["HR Manager Web UI (apps/web-esms)\nReact 18 + Vite + TypeScript + Tailwind + Chart.js"]
    API["API Gateway & Service (apps/backend-esms)\nNode.js + Express + TypeScript"]
    Shared["Shared Schema & Types (packages/shared-types)\nZod Validation & DTO Contracts"]
    DB[("Relational Database (SQLite / Prisma ORM)\nNormalized 3NF + Composite B-Tree Indexes")]

    Client -->|HTTP / JSON REST API| API
    Client -.->|Shared Validation Schemas & Types| Shared
    API -.->|Shared Validation Schemas & Types| Shared
    API -->|Prisma Client & ACID Transactions| DB
```

---

### 2. 3NF Relational Database Schema & ERD

To eliminate redundancy and prevent update anomalies present in Excel spreadsheets, the database is strictly normalized to the **Third Normal Form (3NF)**:

```mermaid
erDiagram
    DEPARTMENT ||--o{ EMPLOYEE : employs
    COUNTRY ||--o{ EMPLOYEE : resides_in
    EMPLOYEE ||--o{ SALARY : has_current_and_past
    EMPLOYEE ||--o{ SALARY_AUDIT_LOG : tracks_changes

    DEPARTMENT {
        string id PK
        string code UK "ENG, SLS, MKT, HR, FIN, PRD, OPS"
        string name
        datetime createdAt
    }

    COUNTRY {
        string id PK
        string code UK "US, UK, IN, DE, CA, SG"
        string name
        string currency "USD, GBP, EUR, INR, CAD, SGD"
        float exchangeRateToUSD "Benchmark normalizer"
        datetime createdAt
    }

    EMPLOYEE {
        string id PK
        string employeeCode UK "EMP-10001 ... EMP-20000"
        string firstName
        string lastName
        string email UK
        string gender "MALE, FEMALE, NON_BINARY"
        string jobTitle
        string salaryBand "ENTRY, MID, SENIOR, LEAD, EXECUTIVE"
        string status "ACTIVE, ON_LEAVE, TERMINATED"
        datetime hireDate
        string departmentId FK
        string countryId FK
        datetime createdAt
        datetime updatedAt
    }

    SALARY {
        string id PK
        string employeeId FK
        float baseSalary "Annual Base in Local Currency"
        float bonus "Annual Bonus/Variable"
        float deductions "Annual Standard Deductions"
        float netSalary "Computed: base + bonus - deductions"
        string currency
        datetime effectiveDate
        boolean isCurrent "Index for active compensation"
        datetime createdAt
        datetime updatedAt
    }

    SALARY_AUDIT_LOG {
        string id PK
        string employeeId FK
        float previousBaseSalary
        float newBaseSalary
        float previousNetSalary
        float newNetSalary
        string reason
        string changedBy "HR_ADMIN"
        datetime createdAt
    }
```

---

### 3. Scalability & Performance Strategy for 10,000 Records

Managing 10,000 employees requires deliberate backend architecture to avoid CPU spikes and client UI freezing:

1. **Database-Level Indexing:**
   * Unique B-Tree indexes on `Employee.employeeCode` and `Employee.email`.
   * Composite index on `[departmentId, countryId]` for lightning-fast multi-criteria HR filtering.
   * Filter index on `Salary.isCurrent` to join active compensation in O(1) time without full-table scans.
   * Search index on `Employee.lastName` and `Employee.firstName`.

2. **Server-Side Pagination & Projection:**
   * Endpoints enforce default limit (e.g., 20 items per page) with cursor or offset-based pagination.
   * Database queries use explicit Prisma `select` clauses, retrieving only necessary columns for data tables and avoiding payload bloat.

3. **SQL-Engine Aggregations (vs In-Memory Javascript Loops):**
   * Metrics like total spend, departmental averages, gender equity ratios, and country distributions are calculated directly within the database engine using SQL `GROUP BY`, `SUM()`, `AVG()`, and `COUNT()`.
   * Result: Aggregate analytics queries over all 10,000 employees execute in under **10ms**.

---

### 4. ACID Transactions & Audit Integrity

Compensation modifications are high-stakes operations that cannot afford partial failures.

* **Atomic Execution:** Any salary update or raise uses `prisma.$transaction([ ... ])`:
  1. Sets the previous `Salary.isCurrent` to `false`.
  2. Inserts the new `Salary` record with `isCurrent = true`.
  3. Inserts an immutable `SalaryAuditLog` entry documenting the change, old value, new value, reason, and HR manager timestamp.
* If any step fails (e.g. database constraint error), the transaction automatically rolls back, preserving 100% data consistency.

---

### 5. Dual-Layer Validation (Frontend + Backend)

* The `packages/shared-types` workspace defines canonical **Zod schemas**:
  * `EmployeeFilterSchema` (validating page, limit, sort, search, filters).
  * `SalaryUpdateSchema` (validating minimum base salary, bonus bounds, deductions, and non-empty reason strings).
* **Backend:** Express middleware runs `SalaryUpdateSchema.parse(req.body)`. Invalid payloads return standardized HTTP 400 with field-level errors.
* **Frontend:** React forms validate against the identical Zod schema before dispatching HTTP calls, offering instant feedback to the HR Manager.
