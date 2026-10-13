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
| **5** | Deterministic Unit Testing Suite | ⏳ **In Progress** | Fast unit tests for salary math, currency conversions, and analytics. |
| **6** | Frontend Dashboard & Data Grid | 🕒 **Pending** | React 19 UI, Chart.js analytics ("How Org Pays People"), Edit Modal. |
| **7** | Production Polish & Demo Readiness | 🕒 **Pending** | Final README instructions, verification, and demo delivery. |
