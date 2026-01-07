# TinyGenesy Codebase Improvements Roadmap

This document outlines proposed improvements to the codebase, organized by priority and effort.

---

## 🔴 High Priority

### 1. API Response Typing & Validation
**Effort:** Medium | **Impact:** High

**Current State:**
- Request bodies are cast without validation (`as { leadIds?: number[] }`)
- No runtime schema validation

**Proposed Changes:**
- Add Zod for runtime request validation
- Generate OpenAPI spec from schemas
- Use generated types on the frontend (e.g., via `openapi-typescript`)
- Add response validation in development mode

---

### 2. Database Indexing & Query Optimization
**Effort:** Low | **Impact:** Medium

**Current State:**
- No indexes defined beyond primary keys
- Duplicate lead detection queries full table scans

**Proposed Changes:**
```prisma
model lead {
  @@index([firstName, lastName])  // Duplicate detection
  @@index([email])                // Unique lookup
  @@index([createdAt])            // Sorting
}
```

---

### 3. Environment Configuration
**Effort:** Low | **Impact:** Medium

**Current State:**
- No validation of required environment variables at startup

**Proposed Changes:**
- Use `envalid` or similar for typed env validation
- Fail fast on missing required configuration

---

## 🟡 Medium Priority

### 4. Backend Code Modularization
**Effort:** Medium | **Impact:** Medium

**Current State:**
- All route handlers and business logic live in `index.ts` (~400 lines)
- No separation between routing, controllers, and services
- Difficult to test business logic in isolation
- Growing file becomes harder to navigate

**Proposed Changes:**
- Extract route definitions to `routes/leads.ts`
- Create controller layer (`controllers/leadsController.ts`) for request/response handling
- Create service layer (`services/leadsService.ts`) for business logic
- Keep `index.ts` minimal (app setup, middleware, route mounting)

**Example Structure:**
```
src/
├── index.ts              # App setup only
├── routes/
│   └── leads.ts          # Route definitions
├── controllers/
│   └── leadsController.ts # Request handling
└── services/
    └── leadsService.ts   # Business logic
```

---

### 5. Frontend Component Modularization
**Effort:** Medium | **Impact:** Medium

**Current State:**
- `LeadsList.tsx` is a "God Component" handling logic for data fetching, multiple mutations (delete, verify, enrich), modal states, and complex UI rendering.
- Logic is tightly coupled with UI, making components hard to reuse or test.

**Proposed Changes:**
- Extract sub-components for specific UI sections (e.g., `LeadsTable`, `EnrichDropdown`, `ImportModal`).
- Implement custom hooks (e.g., `useLeadsQuery`, `useLeadMutations`) to separate business logic from UI components.
- Use a state management pattern or context for shared states like selection and filter settings.

---

### 6. Error Handling Standardization
**Effort:** Medium | **Impact:** Medium

**Current State:**
- Inconsistent error handling patterns across API endpoints
- Generic error messages that don't help debugging
- No centralized error logging

**Proposed Changes:**
- Create an `AppError` class with error codes and HTTP status mapping
- Implement Express error middleware for consistent response formatting
- Add structured logging (e.g., Pino) with request correlation IDs
- Return actionable error messages in development, sanitized in production

---

### 7. Test Coverage Expansion
**Effort:** High | **Impact:** High

**Current State:**
- Unit tests exist for utilities (`csvParser.test.ts`, `messageGenerator.test.ts`)
- No integration tests for API endpoints
- No Temporal workflow tests

**Proposed Changes:**
- Add API integration tests with `supertest`
- Add Temporal workflow tests using the test client

---

## 🟢 Low Priority / Nice to Have

### 8. Temporal Workflow Improvements
**Effort:** Low | **Impact:** Low

**Current State:**
- Activities bundled in single file (`utils.ts`)

**Proposed Changes:**
- Organize activities by domain (`emailActivities.ts`, `phoneActivities.ts`)

---

### 9. API Rate Limiting
**Effort:** Low | **Impact:** Low (until scale)

**Proposed Changes:**
- Add rate limiting middleware (express-rate-limit)
- Implement per-provider rate limiters for external APIs
- Add retry-after headers for rate limited responses

---
