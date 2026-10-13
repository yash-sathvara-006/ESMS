# Enterprise Employee Salary Management System (ESMS)

An enterprise-grade, high-performance Salary Management System designed for HR Managers to manage salary data for **10,000+ employees** across multiple countries, currencies, and departments, transitioning organizations away from error-prone Excel spreadsheets.

---

## 🏗️ Architecture & Monorepo Structure

This project follows a clean **Enterprise Monorepo** architecture:

```text
ESMS/
├── apps/
│   ├── backend-esms/         # Node.js + Express + TypeScript + Prisma ORM
│   │   ├── prisma/           # Schema, migrations, and 10k seed script
│   │   ├── src/              # Controllers, services, routes, middleware
│   │   └── tests/            # Deterministic unit & integration tests
│   └── web-esms/             # React + Vite + TypeScript + Tailwind CSS
│       ├── src/              # Components, hooks, services, charts
│       └── public/           # Static assets
├── packages/
│   └── shared-types/         # Shared Zod validation schemas & TypeScript DTOs
├── docs/
│   ├── prd/
│   │   └── PRD.md            # One-Page Product Requirements Document
│   └── architecture/
│       └── ARCHITECTURE.md   # DB 3NF schema, indexing, transaction specs
├── .gitignore
├── package.json              # Monorepo workspaces runner
└── README.md                 # Setup & execution guide
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS, Lucide Icons, Chart.js |
| **Backend** | Node.js, Express, TypeScript, Prisma ORM, Zod, tsx |
| **Database** | SQLite *(Relational 3NF with B-tree indexing for ultra-fast 10k queries)* |
| **Validation** | Dual-tier Zod validation (Shared between frontend and backend) |
| **Testing** | Vitest, Supertest |

---

## 📋 Prerequisites

Before running the project on any machine, ensure the following are installed:
* **Node.js**: v18.0.0 or higher (v20+ recommended)
* **npm**: v9.0.0 or higher
* **Git**

---

## 🚀 Step-by-Step Setup Guide (Quick Start)

Follow these steps to set up and run the project from scratch on any new machine:

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ESMS
```

### 2. Install Dependencies
Run `npm install` from the **root directory** to install all workspace dependencies across frontend, backend, and shared packages:
```bash
npm install
```

### 3. Environment Variables Setup
Copy the `.env.example` templates to `.env` in the backend and frontend apps:

#### Backend (`apps/backend-esms/.env`):
```bash
# On Windows PowerShell
cp apps/backend-esms/.env.example apps/backend-esms/.env
```
Default backend values:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
CORS_ORIGIN="http://localhost:5173"
```

#### Frontend (`apps/web-esms/.env`):
```bash
# On Windows PowerShell
cp apps/web-esms/.env.example apps/web-esms/.env
```
Default frontend values:
```env
VITE_API_BASE_URL="http://localhost:5000/api"
```

### 4. Database Setup & 10,000 Employee Seeding
Generate the Prisma client, run migrations, and seed 10,000 realistic employee records:
```bash
npm run db:migrate
npm run db:seed
```

### 5. Start Development Servers
You can start both Backend and Frontend concurrently with a single command from the root directory:
```bash
npm run dev
```

Alternatively, you can run them individually in separate terminal windows:
* **Backend only:** `npm run dev:backend` *(Starts on http://localhost:5000)*
* **Frontend only:** `npm run dev:web` *(Starts on http://localhost:5173)*

### 6. Verify Installation
* **Backend Health Check:** Open [http://localhost:5000/api/health](http://localhost:5000/api/health) in your browser. You should receive:
  ```json
  {
    "status": "success",
    "message": "ESMS Backend Server is running smoothly!"
  }
  ```
* **Frontend Application:** Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Running Tests

Execute fast, deterministic unit and integration tests:
```bash
npm run test
```

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
