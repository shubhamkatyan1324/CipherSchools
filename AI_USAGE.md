# AI Usage Log: Key Architectural & Engineering Decisions

This document logs 5 key engineering decisions made during the development of the **CipherSchools LLD Practice Platform**. It details how AI assistance was leveraged during pair programming, what recommendations were accepted or modified, and the technical trade-offs behind each decision.

---

## Decision 1: Evaluator Extensibility Abstraction

### Context
We needed an extensible evaluation engine to score candidate Low-Level Design (LLD) submissions. The engine required AI integration (using Google Gemini) for subjective design-quality analysis (e.g., evaluating coupling, cohesion, and pattern choices) alongside an offline rule-based evaluator for structural validation.

### What AI Suggested
An elaborate `EvaluatorFactory` class with dynamic reflection, plugin registries, and multi-tenant module loaders for OpenAI, Anthropic, and Gemini services.

### What I Accepted
A simple `Evaluator` interface ([`evaluator.interface.ts`](file:///c:/Users/shubh/Desktop/CipherSchools/apps/api/src/evaluation/evaluator.interface.ts)) defining a unified `evaluate()` contract, implemented by `AIEvaluator` and `RuleBasedEvaluator`, orchestrated directly by `EvaluationService`.

### What I Rejected or Changed
Rejected the `EvaluatorFactory` class and reflection-based dynamic registries.

### Why
Adding a factory abstraction for two evaluators introduced unnecessary indirection. Direct constructor injection inside `EvaluationService` adheres strictly to the Open-Closed Principle (OCP) while keeping the codebase lightweight, readable, and easy to maintain.

### Outcome
Both `AIEvaluator` and `RuleBasedEvaluator` implement `Evaluator`. `EvaluationService` cleanly coordinates evaluation without extra factory boilerplate.

---

## Decision 2: Submission Persistence and Failure Resilience

### Context
Evaluating LLD submissions relies on third-party LLM APIs, which can experience network latency, rate limits, or transient errors. We needed a workflow that prevents data loss if evaluation fails.

### What AI Suggested
Running AI evaluation in-memory first and saving both the submission text and evaluation output together in a single atomic database transaction after AI execution finishes.

### What I Accepted
A two-phase submission pipeline:
1. Persist the `Submission` snapshot immediately to the database and update `Attempt` status to `EVALUATING`.
2. Execute `AIEvaluator` inside a `try-catch` block, smoothly falling back to `RuleBasedEvaluator` if the API key is missing or the request fails.
3. Save the resulting `Evaluation` and transition `Attempt` status to `COMPLETED`.

### What I Rejected or Changed
Rejected atomic single-transaction persistence executed after AI invocation.

### Why
If the AI API times out or fails, saving after AI invocation risks losing the candidate's typed design solution. Persisting the submission snapshot first guarantees candidate work is safely stored in the database regardless of evaluation outcome.
*Trade-off*: Requires an initial database write before evaluation begins.

### Outcome
The `Submission` snapshot is persisted before calling `EvaluationService`. If Gemini is unavailable or throws an exception, the system catches the error, logs a safe message, and completes evaluation using `RuleBasedEvaluator`.

---

## Decision 3: Database Migration from SQLite to Containerized PostgreSQL

### Context
The application initially used an SQLite file database (`dev.db`) for local prototyping. To better simulate production environments and handle concurrent read/write transactions cleanly, we needed a robust relational database setup.

### What AI Suggested
Installing a host-level PostgreSQL database instance on default port `5432` or configuring cloud database connections directly during local development.

### What I Accepted
Migrating the database provider in Prisma ([`schema.prisma`](file:///c:/Users/shubh/Desktop/CipherSchools/apps/api/prisma/schema.prisma)) from `"sqlite"` to `"postgresql"`, paired with a containerized PostgreSQL 16 service in [`docker-compose.yml`](file:///c:/Users/shubh/Desktop/CipherSchools/docker-compose.yml) mapped to host port `5433` (`5433:5432`).

### What I Rejected or Changed
Rejected host-level uncontainerized PostgreSQL installations and default port `5432` mapping.

### Why
Using Docker Compose ensures a reproducible database environment across machines. Mapping host port `5433` prevents port collisions with native PostgreSQL services running on developer host machines.
*Trade-off*: SQLite required zero installation, whereas PostgreSQL via Docker requires Docker runtime on local development environments.

### Outcome
The platform runs PostgreSQL 16 in Docker, managed via Prisma ORM. Running `docker compose up -d` provides an isolated relational database ready for schema pushes and seeding.

---

## Decision 4: Frontend Production API Base Configuration

### Context
Preparing the Vite + React frontend for static hosting (e.g., Vercel) while ensuring local development continues to work seamlessly with the Vite dev server proxy (`/api`).

### What AI Suggested
Hardcoding production backend domain URLs in source code or adding server-side reverse-proxy configuration files (`vercel.json`).

### What I Accepted
Environment-driven API base URL resolution in [`api.ts`](file:///c:/Users/shubh/Desktop/CipherSchools/apps/web/src/services/api.ts):
```typescript
const rawBase = import.meta.env.VITE_API_BASE_URL || '/api';
const API_BASE = rawBase.replace(/\/+$/, '');
```
paired with a clean [`apps/web/.env.example`](file:///c:/Users/shubh/Desktop/CipherSchools/apps/web/.env.example) template.

### What I Rejected or Changed
Rejected hardcoded production domain URLs and mandatory server-side rewrite rules.

### Why
This approach preserves zero-config local development (`/api` mapped via Vite proxy to `http://localhost:3000`), while allowing the frontend deployed on Vercel to later target a separately deployed backend URL via `VITE_API_BASE_URL`. Trimming trailing slashes prevents URL duplication issues (e.g., `/api/api/problems`).

### Outcome
Local development uses `/api` seamlessly via dev proxy. Production static builds accept `VITE_API_BASE_URL` without code modifications.

---

## Decision 5: Deterministic Validation Before Subjective Evaluation

### Context
Candidate submissions can sometimes be incomplete or missing mandatory sections. We needed to prevent invalid submissions from sending useless requests to third-party LLM APIs.

### What AI Suggested
Sending all raw candidate text directly to the LLM and instructing the prompt to detect whether sections were missing or too short.

### What I Accepted
A stage-1 **Deterministic Validation Gate** in `RuleBasedEvaluator` ([`rule-based-evaluator.service.ts`](file:///c:/Users/shubh/Desktop/CipherSchools/apps/api/src/evaluation/rule-based-evaluator.service.ts)) that enforces mandatory sections and minimum character lengths before any LLM request is initiated.

### What I Rejected or Changed
Rejected relying on the LLM for basic structural validation.

### Why
Delegating structural checks to an LLM wastes API quota and adds latency to invalid requests. Fast deterministic validation fails fast locally with clear HTTP 400 feedback.

### Outcome
Submissions must pass deterministic structural checks first. Once validated, subjective evaluation proceeds via `AIEvaluator` (or `RuleBasedEvaluator` fallback if AI is offline).
