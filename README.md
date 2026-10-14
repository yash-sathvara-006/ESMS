# Enterprise Employee Salary Management System (ESMS)

An enterprise-grade, high-performance Salary Management System designed for HR Managers to manage salary data for **10,000+ employees** across multiple countries, currencies, and departments, transitioning organizations away from error-prone Excel spreadsheets.

---

## 🏗️ Architecture & Monorepo Structure

This project follows a clean **Enterprise Monorepo** architecture:

```text
ESMS/
├── apps/
│   ├── backend-esms/         # Node.js + Express + TypeScript + Prisma ORM
│   │   ├── prisma/           # Schema, migrations, SQLite dev.db & 10k seed script
│   │   ├── src/              # Controllers, services, routes, middlewares
│   │   └── tests/            # Deterministic unit & integration tests (30 tests)
│   └── web-esms/             # React 19 + Vite + TypeScript + Tailwind CSS
│       ├── src/
│       │   ├── components/   # UI primitives (Button, Input, Modal, etc.) & features
│       │   │   └── ui/       # Design System primitives (Card, Badge, Skeleton, etc.)
│       │   ├── services/     # Typed API client
│       │   └── index.css     # Systematic CSS variable tokens
│       └── public/           # Static assets
├── packages/
│   └── shared-types/         # Shared Zod validation schemas & TypeScript DTOs
├── docs/
│   ├── prd/
│   │   └── PRD.md            # One-Page Product Requirements Document
│   ├── architecture/
│   │   ├── ARCHITECTURE.md   # DB 3NF schema, indexing, transaction specs
│   │   └── SEEDING_AND_DATA_STRATEGY.md # 10k seed benchmarks & trade-offs
│   └── artifacts/
│       └── AI_COLLABORATION_AND_PROMPTS.md # AI collaboration log & steers
├── .gitignore
├── package.json              # Monorepo workspaces runner
└── README.md                 # Setup & execution guide
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, TypeScript, Material UI (`@mui/material`), Tailwind CSS, Lucide Icons, Chart.js, react-hot-toast, react-loading-skeleton |
| **Design System** | Payscape Light Theme (`src/theme/theme.ts`) with custom CSS variables (`--color-*`, `--font-*`, `--space-*`, `--radius-*`) |
| **UI Components** | Reusable atomic primitives (`DataTable`, `Card`, `Button`, `Input`, `Select`, `Badge`, `Modal`, `ProgressBar`, `Skeleton`) |
| **Backend** | Node.js, Express 5, TypeScript, Prisma ORM, Zod, tsx |
| **Database** | SQLite *(Relational 3NF with B-tree indexing for ultra-fast 10k queries)* |
| **Validation** | Dual-tier Zod validation (Shared contracts between frontend and backend) |
| **Testing** | Vitest, Supertest (30/30 automated tests passing in ~2.5s) |

---

## 📋 Prerequisites

Before running the project on any machine, ensure the following are installed:
* **Node.js**: v18.0.0 or higher (v20+ recommended)
* **npm**: v9.0.0 or higher
* **Git**

Check your versions:
```bash
node -v
npm -v
git --version
```

---

## 🚀 Part 1: First-Time Project Setup (પહેલી વાર પ્રોજેક્ટ સેટઅપ કરવા માટે)

Follow these step-by-step instructions when setting up the project on a fresh machine:

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd ESMS
```

### Step 2: Install All Dependencies
Run this single command from the **root directory**. It automatically installs dependencies across all workspaces (`web-esms`, `backend-esms`, and `shared-types`):
```bash
npm install
```

### Step 3: Setup Environment Variables (`.env`)
Create the `.env` configuration files for both backend and frontend from their templates:

#### On Windows (PowerShell):
```powershell
cp apps/backend-esms/.env.example apps/backend-esms/.env
cp apps/web-esms/.env.example apps/web-esms/.env
```

#### On Linux / macOS (Bash):
```bash
cp apps/backend-esms/.env.example apps/backend-esms/.env
cp apps/web-esms/.env.example apps/web-esms/.env
```

> **Default Values Configured:**
> - Backend (`apps/backend-esms/.env`):
>   ```env
>   PORT=5000
>   NODE_ENV=development
>   DATABASE_URL="file:./dev.db"
>   CORS_ORIGIN="http://localhost:5173"
>   AUTO_SEED=true
>   SEED_EMPLOYEE_COUNT=10000
>   ```
> - Frontend (`apps/web-esms/.env`):
>   ```env
>   VITE_API_BASE_URL="http://localhost:5000/api"
>   ```

### Step 4: Initialize Database & Seed 10,000 Employees

You have two ways to execute this step:

#### Method A: From Root Directory (Recommended):
```bash
npm run db:migrate
npm run db:seed
```

#### Method B: Navigating into the Backend Folder:
```bash
cd apps/backend-esms
npm run db:push
npm run db:seed
cd ../..
```

*(Note: The backend also has an automated **Auto-Bootstrap** engine. If `dev.db` is empty or missing, starting the backend will automatically seed all 10,000 records in ~3.6 seconds.)*

---

## ⚡ Part 2: Running & Managing the Application (રોજબરોજ ઉપયોગ માટેના કમાન્ડ્સ)

After the initial setup is complete, use the following commands to run, test, and inspect the project.

### 1. Start Both Backend & Frontend Concurrently (Full System)

Runs Backend on `http://localhost:5000` and Frontend on `http://localhost:5173` together:

* **From Root Directory:**
  ```bash
  npm run dev
  ```

---

### 2. Start Backend Server Only (`http://localhost:5000`)

* **Option A — From Root Directory:**
  ```bash
  npm run dev:backend
  ```

* **Option B — Inside `apps/backend-esms` Folder:**
  ```bash
  cd apps/backend-esms
  npm run dev
  ```

---

### 3. Start Frontend App Only (`http://localhost:5173`)

* **Option A — From Root Directory:**
  ```bash
  npm run dev:web
  ```

* **Option B — Inside `apps/web-esms` Folder:**
  ```bash
  cd apps/web-esms
  npm run dev
  ```

---

### 4. Check & Inspect Database via GUI (Prisma Studio)

Prisma Studio provides a rich visual web interface to browse, filter, and inspect all **10,000 employees**, salary details, country exchange rates, and audit log history:

* **Option A — From Root Directory:**
  ```bash
  npm run db:studio
  ```

* **Option B — Inside `apps/backend-esms` Folder:**
  ```bash
  cd apps/backend-esms
  npm run db:studio
  ```

Open **[http://localhost:5555](http://localhost:5555)** in your browser to inspect the database visually.

---

### 5. Run the Automated Test Suite (30 Production Tests)

Runs 30 comprehensive, deterministic tests covering salary math, multi-currency conversion, Zod schema validation, transaction rollbacks, and HTTP contracts:

* **Option A — From Root Directory:**
  ```bash
  npm test
  ```

* **Option B — Inside `apps/backend-esms` Folder:**
  ```bash
  cd apps/backend-esms
  npm test
  ```

---

### 6. Build All Workspaces for Production

Compiles TypeScript for backend, builds production bundles for frontend, and packages shared types:

* **Option A — From Root Directory (All Workspaces):**
  ```bash
  npm run build
  ```

* **Option B — Inside Specific Folders:**
  - Build Backend:
    ```bash
    cd apps/backend-esms && npm run build
    ```
  - Build Frontend:
    ```bash
    cd apps/web-esms && npm run build
    ```

---

## 🔍 Verification & URL Endpoints Summary

Once the development server is running, verify the application with these links:

| Component | URL | Expected Response |
| :--- | :--- | :--- |
| **Frontend Application** | [http://localhost:5173](http://localhost:5173) | HR Manager Dashboard with 5 Executive KPIs, 4 Charts, and 10k Data Grid |
| **Backend Health Check** | [http://localhost:5000/api/health](http://localhost:5000/api/health) | `{"status":"success","message":"ESMS Backend Server is running smoothly!"}` |
| **Analytics Summary API** | [http://localhost:5000/api/analytics/summary](http://localhost:5000/api/analytics/summary) | Aggregated payroll data ($879.7M USD, 10,000 headcount) |
| **Employee Paginated API** | [http://localhost:5000/api/employees?page=1&limit=25](http://localhost:5000/api/employees?page=1&limit=25) | Paginated list with pagination metadata headers |
| **Prisma Studio (GUI)** | [http://localhost:5555](http://localhost:5555) | Visual database browser for all SQLite tables |

---

## 🔑 Key Engineering Highlights

1. **Server-Side Data Operations for Scale:**
   Searching, multi-column filtering, sorting, and pagination are strictly handled server-side to ensure silky-smooth performance with 10,000 records without client-side lag.
2. **Normalized 3NF Relational Database:**
   Separated into `departments`, `countries`, `employees`, `salaries`, and `salary_audit_logs` to eliminate data redundancy and prevent update anomalies.
3. **Database Transactions (`prisma.$transaction`):**
   Salary updates and audit log entries are executed atomically to guarantee strict ACID compliance.
4. **Dual-Tier Validation:**
   Shared Zod schemas ensure invalid data is blocked on the client side for UX and rejected on the API server for data integrity.
5. **Systematic Design Tokens & Reusable Component System:**
   Centralized CSS tokens in `index.css` (`--color-*`, `--font-*`, `--space-*`, `--radius-*`, `--shadow-*`) combined with atomic reusable components (`Button`, `Input`, `Select`, `Badge`, `Card`, `Modal`).
6. **Polished Feedback & Loading UX:**
   - **Notifications:** Integrated `react-hot-toast` configured at **top-right** with dark-mode styling for atomic salary modification feedback.
   - **Skeleton Loaders:** Reusable `Skeleton` component powered by `react-loading-skeleton` with pre-configured dark theme colors across KPIs, charts, data tables, and modal audit logs.
