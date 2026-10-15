# ESMS Frontend Web Application (`apps/web-esms`)

The enterprise user interface for the **Enterprise Employee Salary Management System (ESMS)**, built with React 19, TypeScript, Material UI, and Tailwind CSS. It is specifically tailored for the **HR Manager** persona to manage compensation data for **10,000+ employees** across 8 countries and currencies with sub-10ms response times and zero client-side lag.

---

## 🎨 Architectural & Design Highlights

1. **Payscape Light Theme & Design System Tokens:**
   - Systematic color tokens defined in `src/index.css` (`--color-primary-*`, `--color-neutral-*`, `--radius-*`, `--shadow-*`).
   - Material UI (`@mui/material`) configured with custom theme overrides (`src/theme/theme.ts`) featuring royal purple (`#4f46e5`), soft lavender background (`#eeeffe`), and crisp elevated card surfaces.
2. **Atomic Reusable UI Component Primitives (`src/components/ui/`):**
   - **`Button`**: Supports 5 design token variants (`primary`, `secondary`, `outline`, `ghost`, `danger`), loading spinners (`CircularProgress`), disabled states, and icon slots.
   - **`Badge`**: Status chips supporting emerald, purple, rose, amber, and neutral color mappings.
   - **`Card`**: Elevated surface container with header, subtitle, and `headerRight` utility slot.
   - **`SearchInput`**: Debounced search component dispatching instant input events and 350ms debounced queries for indexed backend search.
   - **`DataTable`**: Generic, type-safe data grid with responsive column headers, custom empty state messaging, row click handlers, and pagination controls.
   - **`MonthYearPicker`**: Custom dual dropdown timeframe selector matching Payscape light theme tokens with accessible trigger buttons and animated listbox menus for point-in-time salary analytics.
   - **`Skeleton`**: Custom skeleton loader integrated with dark-mode and light-mode tokens.
3. **Strategic Compensation Analytics ("How the Org Pays People"):**
   - 5 Executive KPI summary cards ($879.7M payroll, 10,000 headcount, average/median benchmarks).
   - 4 Chart.js visualizations: Departmental spend breakdown, geographic payroll shares, gender pay equity parity ratio, and salary band distributions.
   - **Dynamic Point-in-Time Filters**: Dynamic Month & Year selectors populated from database tenure records with non-blocking `useTransition` rendering.
4. **10,000 Employee Directory & Master-Detail Inspection:**
   - Server-side multi-column filtering (department, country, status), sorting, and indexed pagination.
   - Master-detail side panel displaying selected employee profile, pay band position gauge, and salary history.
   - Transactional salary adjustment modal validating audit reasons and updating compensation via atomic backend transactions.
5. **Modern React 19 Performance Hooks & State Architecture:**
   - **`useReducer`**: Consolidated multi-API hydration in `DashboardPage` (reducing 5 state renders to 1 atomic pass) and centralized 6 filter/pagination states in `EmployeesPage`.
   - **`useDeferredValue` & `useTransition`**: Non-blocking asynchronous search input and non-blocking filter reset transitions, preserving 60 FPS typing over 10,000 indexed records.
   - **`useRef` & `AbortController`**: Prevents race conditions and memory leaks by cancelling stale in-flight paginated queries when filters or pages change rapidly.
   - **`useLayoutEffect`**: Pre-paint scroll restoration resetting table scroll position smoothly when page index changes.
   - **`useMemo` & `useCallback`**: Memoized `DataTable` column definitions, Chart.js dataset configurations, and currency formatters to avoid re-renders.
   - **`useId`**: WAI-ARIA accessible component IDs for inputs, selects, and chart regions.

---

## 🧪 Frontend Automated Testing Suite (34 Tests across 10 Suites)

The frontend test suite is powered by **Vitest + React Testing Library + JSDOM + `@testing-library/jest-dom`**, providing comprehensive, deterministic coverage of UI components, interactive forms, financial calculations, API communication, and page-level integrations.

### Test Execution Commands

```bash
# Run all frontend tests once (from apps/web-esms directory):
npm test

# Run frontend tests in interactive watch mode:
npm run test:watch

# Or run from the monorepo root:
npm run test:web
npm run test:web:watch
```

---

### Test Suite Directory & Coverage Breakdown

All test suites are co-located in `__tests__` directories alongside the code they validate:

```text
src/
├── components/
│   ├── __tests__/
│   │   └── SalaryEditModal.test.tsx      # 5 Tests: Form validation, math, & submission
│   └── ui/
│       └── __tests__/
│           ├── Button.test.tsx           # 6 Tests: Variants, loading, & events
│           ├── Badge.test.tsx            # 3 Tests: Chips & color themes
│           ├── Card.test.tsx             # 3 Tests: Header, children, & slots
│           ├── SearchInput.test.tsx      # 3 Tests: Debounce timer & input events
│           ├── DataTable.test.tsx        # 4 Tests: Columns, rows, empty, pagination
│           └── MonthYearPicker.test.tsx  # 4 Tests: Month/year selection, toggles, disabled
├── pages/
│   └── __tests__/
│       ├── DashboardPage.test.tsx        # 2 Tests: KPIs, charts, & independent section filters
│       └── EmployeesPage.test.tsx        # 1 Test: 10k table & master-detail panel
├── services/
│   └── __tests__/
│       └── api.test.ts                   # 3 Tests: Query params, PUT body, & errors
└── test/
    └── setup.ts                          # JSDOM matchers & auto-cleanup configuration
```

#### Detailed Test Specifications:

1. **`Button.test.tsx` (6 Tests):**
   - Validates label rendering, `onClick` handler execution, `disabled` interaction blocking, `isLoading` circular spinner behavior, left/right icon placement, and primary/secondary/danger design variants.
2. **`Badge.test.tsx` (3 Tests):**
   - Validates text chip rendering, fallback to React children, and styling across color themes (`emerald`, `purple`, `rose`, `amber`, `neutral`).
3. **`Card.test.tsx` (3 Tests):**
   - Validates child DOM encapsulation, title/subtitle header rendering, and `headerRight` action button slots.
4. **`SearchInput.test.tsx` (3 Tests):**
   - Validates placeholder and search icon rendering, immediate `onChange` keystroke dispatch, and 350ms `onDebouncedChange` timer throttling via Vitest fake timers.
5. **`DataTable.test.tsx` (4 Tests):**
   - Validates dynamic column headers and cell records, custom empty state displays, row click events, and Previous/Next pagination triggers.
6. **`MonthYearPicker.test.tsx` (4 Tests):**
   - Validates rendering accessible month/year dropdown trigger buttons, opening month listbox menu and selecting a new month (`onChange(newMonth, year)`), opening year listbox menu and selecting a new year (`onChange(month, newYear)`), and verifying `disabled` state behavior.
7. **`SalaryEditModal.test.tsx` (5 Tests):**
   - Validates employee profile and current compensation display, unmounting when closed, minimum 3-character audit reason validation, real-time dynamic net salary calculation (`baseSalary + bonus - deductions`), and API submission payload handling.
8. **`api.test.ts` (3 Tests):**
   - Validates URL parameter serialization for pagination/filtering, HTTP PUT JSON payload creation with headers, and structured error handling on failed requests.
9. **`DashboardPage.test.tsx` (2 Tests):**
   - Validates full page mounting, Chart.js canvas mocking, fetching `/api/analytics/summary`, and rendering the "How we pay people" header, total headcount ($10,000$), and department spend distribution table.
   - Validates independent month and year filters (`MonthYearPicker`) for both "Average salary by country" and "Salary distribution" in their respective card headers (`headerRight`), ensuring isolated point-in-time updates.
10. **`EmployeesPage.test.tsx` (1 Test):**
   - Validates mounting under `MemoryRouter`, fetching department/country filter options, loading the 10,000 employee data table, and displaying the synchronized master-detail inspection panel.

---

## 🛠️ Build & Development Commands

```bash
# Start local development server (http://localhost:5173):
npm run dev

# Run TypeScript type-checker without emitting output:
npx tsc --noEmit

# Compile production bundle into dist/:
npm run build

# Preview production build locally:
npm run preview
```
