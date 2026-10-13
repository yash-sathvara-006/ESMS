# Intentional AI Collaboration & Prompt Engineering Log

## 1. Philosophy & Engineering Framing
In accordance with the assessment expectations (*"Demonstrate intentional use of AI tools while maintaining strong engineering fundamentals, correctness, and quality"*), AI was utilized as a **collaborative pair programmer and accelerator under strict human architectural guidance**, rather than an autonomous black box.

### The Human-in-the-Loop Operational Workflow:
```text
┌─────────────────────────────────┐
│     Human Developer Lead        │
│  - Sets architectural standards │
│  - Approves PRD & constraints   │
│  - Reviews implementation plans │
└────────────────┬────────────────┘
                 │ Strategic Instructions & Constraints
                 ▼
┌─────────────────────────────────┐
│       AI Coding Assistant       │
│  - Formulates technical plans   │
│  - Drafts 3NF schemas & tests   │
│  - Generates batch algorithms   │
└────────────────┬────────────────┘
                 │ Draft Implementation
                 ▼
┌─────────────────────────────────┐
│  Verification & Benchmarking    │
│  - TypeScript strict compile    │
│  - 10k data uniqueness audit    │
│  - Live API curl response check │
└─────────────────────────────────┘
```

---

## 2. Phase-by-Phase Prompt & Instruction Engineering Log

### Phase 1: Product Framing & One-Page PRD
* **Objective:** Establish clear boundaries for an enterprise salary management tool for an HR Manager persona, transitioning away from Excel.
* **Core Human Instruction / Prompt Pattern:**
  > *"Analyze the problem statement for 10,000 multi-country employees. Formulate a 1-page PRD that clearly articulates what we are building, and critically, what we are DELIBERATELY leaving out and why. Do not build bank payouts or employee portals; justify why they distract from compensation intelligence."*
* **Key AI Output:** Created [docs/prd/PRD.md](../prd/PRD.md), outlining deliberate exclusions (Banking ACH/Stripe, Employee Self-Service, Tax Filing) with solid risk-mitigation reasoning.

---

### Phase 2: Relational Normalization (3NF) & Prisma Schema
* **Objective:** Convert flat, error-prone spreadsheet columns into a third normal form (3NF) relational model.
* **Core Human Instruction / Prompt Pattern:**
  > *"Design a 3NF normalized schema for employees, salaries, departments, and countries. Countries must not be static enums; they must be dynamic master records storing native currency and exchange rate to USD. Add composite B-tree indexes for fast querying over 10,000 rows."*
* **Key AI Output:** Generated `schema.prisma` with 5 distinct models: `Department`, `Country`, `Employee`, `Salary` (with `isCurrent` flag), and `SalaryAuditLog` (for immutable tracking).

---

### Phase 3: Ultra-Fast 10,000 Seeding Algorithm
* **Objective:** Eliminate the 3-5 minute bottleneck of single-row inserts and avoid SQLite lock contention.
* **Core Human Instruction / Prompt Pattern:**
  > *"Write an ultra-fast seed script for exactly 10,000 employees. Use a deterministic PRNG (Mulberry32) so test numbers are identical across machines. Generate realistic compensation according to local country economics. Use batch transactions in chunks of 1,000 so the entire database populates in under 5 seconds."*
* **Engineering Pivot / Human Steer:**
  * When TypeScript complained that `prisma/seed.ts` was outside `rootDir`, the logic was refactored into `src/db/seed.ts` with `prisma/seed.ts` as a thin delegator.
  * Benchmark achieved: **3.63 seconds** for 20,016 total database records.
* **Audit Verification:** 10,000 unique employee codes, 10,000 unique corporate emails, 0% duplicate rows.

---

### Phase 4: Server-Side REST APIs & Compensation Intelligence
* **Objective:** Ensure all heavy lifting (search, multi-column filter, pagination, salary USD normalization) occurs server-side to guarantee client UI smoothness.
* **Core Human Instruction / Prompt Pattern:**
  > *"Implement server-side search, multi-filter, and pagination in Express using indexed Prisma queries. Build strategic analytics endpoints answering: Total Payroll USD, Average/Median Salary, Department Spend Distribution, Country Spend, Gender Pay Equity Ratio, and Salary Bands. All salary edits must use atomic prisma.$transaction with audit logging."*
* **Engineering Pivot / Human Steer:**
  * Express 5 introduced a breaking change where `req.query` is an immutable getter. The validation middleware was adjusted to store validated parameters on `(req as any).validatedQuery` without attempting illegal property reassignments.

---

### Phase 5: Deterministic Unit Testing Suite
* **Objective:** Fast, repeatable unit tests covering core business calculations, math precision, and API validation.
* **Core Human Instruction / Prompt Pattern:**
  > *"Author deterministic unit tests using Vitest. Test salary currency conversions, net salary math (base + bonus - deductions), Zod validation edge cases, and analytics aggregation logic with isolated mock inputs."*

---

## 3. Key Architectural Takeaways of Intentional AI Use

1. **Velocity Without Technical Debt:**
   AI accelerated boilerplate creation (Zod schemas, DTOs, seed data generators), allowing the human engineer to focus on concurrency control, transaction boundaries, and indexing strategies.
2. **Zero-Hallucination Engineering:**
   Every AI-generated module was immediately verified with live compiler checks (`npx tsc --noEmit`), automated SQLite integrity audits, and real HTTP calls (`curl` and `fetch`).
3. **Product-First Framing:**
   AI was guided to think from the shoes of the **HR Manager**, ensuring that API responses provided actionable answers to compensation questions (such as gender pay parity and departmental spend ratios).
