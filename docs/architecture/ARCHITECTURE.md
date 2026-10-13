# System Architecture & Technical Design Specification

## 1. Overview
The **Enterprise Employee Salary Management System (ESMS)** is architected to deliver sub-10ms response times on queries across 10,000+ employees while maintaining strict ACID transactional integrity and multi-currency consistency.

---

## 2. High-Level Architecture

```text
┌────────────────────────────────────────────────────────┐
│                      Client Layer                      │
│        React 19 + TypeScript + Vite + Tailwind CSS     │
│       - Analytics Dashboard (Chart.js / Lucide)        │
│       - Server-side Data Grid & Filter Bar             │
│       - Salary Modification Modal (Zod Form)           │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / JSON
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Backend API Layer                    │
│             Node.js + Express + TypeScript             │
│       - REST API Routes (/api/employees, /api/analytics│
│       - Shared Zod Validation Middleware               │
│       - Service Layer (SalaryService, AnalyticsService)│
└───────────────────────────┬────────────────────────────┘
                            │ Prisma ORM Client
                            ▼
┌────────────────────────────────────────────────────────┐
│                 Data Persistence Layer                 │
│              SQLite Relational Database                │
│       - 3NF Normalized Schema                          │
│       - B-Tree Composite Indexes                       │
│       - Atomic Transactions ($transaction)             │
└────────────────────────────────────────────────────────┘
```

---

## 3. Relational Database Normalization (3NF)

To prevent data redundancy, update anomalies, and inconsistencies present in Excel spreadsheets, the schema is decomposed into 5 distinct entities:

```mermaid
erDiagram
    DEPARTMENT ||--o{ EMPLOYEE : employs
    COUNTRY ||--o{ EMPLOYEE : hosts
    EMPLOYEE ||--o{ SALARY : receives
    EMPLOYEE ||--o{ SALARY_AUDIT_LOG : tracks

    DEPARTMENT {
        string id PK
        string code UK
        string name
    }

    COUNTRY {
        string id PK
        string code UK
        string name
        string currency
        float exchangeRateToUSD
    }

    EMPLOYEE {
        string id PK
        string employeeCode UK
        string firstName
        string lastName
        string email UK
        string gender
        string departmentId FK
        string countryId FK
        string status
        datetime hireDate
    }

    SALARY {
        string id PK
        string employeeId FK
        float baseSalary
        float bonus
        float deductions
        float netSalary
        string currency
        datetime effectiveDate
        boolean isCurrent
    }

    SALARY_AUDIT_LOG {
        string id PK
        string employeeId FK
        float previousBase
        float newBase
        string currency
        string changeReason
        string changedBy
        datetime changedAt
    }
```

---

## 4. Performance Strategy for 10,000+ Records

1. **Server-Side Pagination & Projection:**
   * Queries use `skip` and `take` at the database level with lightweight projection (only fetching necessary fields).
2. **Targeted B-Tree Indexing:**
   * Index on `[departmentId, countryId]` for rapid multi-filter combinations.
   * Unique B-Tree indexes on `employeeCode` and `email` for $O(1)$ lookups.
   * Composite index on `[employeeId, isCurrent]` for instantaneous salary retrieval.
3. **Database Transactions (`prisma.$transaction`):**
   * Updating an employee's compensation is strictly executed inside an atomic transaction:
     ```typescript
     await prisma.$transaction(async (tx) => {
       // 1. Mark existing salary record isCurrent = false
       // 2. Insert new salary record isCurrent = true
       // 3. Create immutable SalaryAuditLog entry
     });
     ```
   * If any step fails, the entire transaction rolls back, preventing data corruption.

---

## 5. Dual-Tier Validation Pipeline

* **Layer 1 (Client-Side):** Real-time Zod validation provides instant user feedback before submitting forms.
* **Layer 2 (Server-Side):** Strict Express request middleware validates payloads against the exact same Zod schema, rejecting malformed requests with `400 Bad Request`.

---

## 6. REST API Endpoints Specification

| Method | Endpoint | Description | Query / Body Payload | Response Key Metrics |
| :---: | :--- | :--- | :--- | :--- |
| **GET** | `/api/health` | System & DB health check | None | `{ status, databaseProvider, timestamp }` |
| **GET** | `/api/metadata/departments` | Master departments list | None | Array of departments with headcount |
| **GET** | `/api/metadata/countries` | Master jurisdictions list | None | Array of countries with currency & USD rates |
| **GET** | `/api/employees` | Paginated search & multi-filter | `page, limit, search, departmentId, countryId, gender, status, sortBy, sortOrder` | `{ data: EmployeeDTO[], meta: PaginationMeta }` |
| **GET** | `/api/employees/:id` | Single employee details | None | Employee with salary and full audit logs |
| **PUT** | `/api/employees/:id/salary` | Transactional salary update | `{ baseSalary, bonus, deductions, currency, changeReason, changedBy }` | Updated salary DTO with audit log creation |
| **GET** | `/api/analytics/summary` | Executive compensation KPIs | None | Total payroll (USD), avg, median, headcount |
| **GET** | `/api/analytics/by-department`| Department spend distribution | None | Department spend, headcount, min/max, % share |
| **GET** | `/api/analytics/by-country` | Jurisdictional spend | None | Country spend, local currency vs USD, % share |
| **GET** | `/api/analytics/pay-equity` | Gender pay gap analytics | None | Male vs Female vs NB avg, parity ratio |
| **GET** | `/api/analytics/salary-bands` | Compensation bell curve | None | Counts & percentages across 5 salary tiers |

