# Enterprise Employee Salary Management System (ESMS)

An enterprise-grade, high-performance web platform built to manage and analyze compensation data for **10,000+ employees** across multiple countries, roles, and currencies. Designed specifically for the **HR Manager** to replace cumbersome Excel spreadsheets and answer strategic compensation questions with real-time analytics.

---

## 🏛 Architecture & Tech Stack

This project is built as a production-ready **Monorepo**:

* **Frontend (`apps/web-esms`):** React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Chart.js.
* **Backend (`apps/backend-esms`):** Node.js, Express, TypeScript, Prisma ORM, SQLite / Relational DB.
* **Shared Types (`packages/shared-types`):** Canonical Zod schemas and DTO TypeScript interfaces shared across UI and API.
* **Documentation (`docs/`):**
  * [`docs/prd/PRD.md`](docs/prd/PRD.md): One-page Product Requirements Document.
  * [`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md): Database normalization (3NF), ERD diagrams, and performance design.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
* Node.js v18+ (tested on Node v20/v24)
* npm v9+

### 2. Setup & Installation
```bash
# Clone the repository
git clone <repo-url>
cd ESMS

# Install all monorepo dependencies
npm install
```

### 3. Database Generation & 10,000 Records Seeding
```bash
# Generate Prisma client and initialize database schema
npm run db:push

# Seed 10,000 realistic employees across 6 countries & currencies
npm run seed
```

### 4. Running the Application
```bash
# Start both Backend API and Frontend Web UI concurrently
npm run dev
```

* **Frontend UI:** `http://localhost:5173`
* **Backend API:** `http://localhost:5000/api`

### 5. Running Tests
```bash
# Run deterministic unit and integration test suite
npm test
```
