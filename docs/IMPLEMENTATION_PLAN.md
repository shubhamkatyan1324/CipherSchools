# Architecture & Implementation Plan - LLD Practice Platform

An engineering-focused, polished MVP of a **LeetCode-like Low-Level Design (LLD) Practice Platform** built for the Cipher Schools Internship Assignment.

---

## 1. Architectural Principles & Refined Design

### 1.1 Evaluator Architecture & Extensibility
The platform uses the **Strategy Pattern** for evaluations without unnecessary factory abstractions:
```
               EvaluationService
                       ↓
                   Evaluator
                   /       \
         AIEvaluator      RuleBasedEvaluator
```
- **Deterministic Validation Gate**: Before invoking AI evaluation, every submission passes through deterministic checks (required fields, non-empty content, structural validity, duplicate submission detection). Invalid submissions fail fast with deterministic feedback without sending prompts to the LLM.
- **`AIEvaluator`**: Evaluates valid submissions against a fixed 8-dimension Rubric using LLM APIs (`@google/genai` or OpenAI) configured via environment variables. Fallback to `RuleBasedEvaluator` when no API key is set or when AI fails.

### 1.2 Attempt vs Submission Domain Model
- **`Attempt`**: Represents a learner's practice session for a specific LLD problem. Controls the lifecycle state machine (`IN_PROGRESS` → `SUBMITTED` → `EVALUATING` → `COMPLETED` / `FAILED`).
- **`Submission`**: An **immutable versioned snapshot** of the learner's design solution (Version 1, Version 2, etc.) tied to an `Attempt`. Persisted to SQLite *before* evaluation starts so a submission is never lost, even if AI evaluation fails.

### 1.3 Rubric Domain Concept
The rubric is a first-class domain model consisting of **8 Fixed Criteria**:
1. `Requirement Understanding`
2. `Class Responsibilities`
3. `Coupling & Cohesion`
4. `Encapsulation & Interfaces`
5. `Abstraction / Design Patterns`
6. `Extensibility`
7. `Edge Cases & Testability`
8. `Quality of Explanation`

Each criterion returns: `criterion`, `score` (0-10), `maxScore` (10), `evidence`, `concern`, `suggestion`, `confidence` (0.0 - 1.0).

---

## 2. Directory Structure

```
CipherSchools/
├── apps/
│   ├── api/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   ├── src/
│   │   │   ├── domain/
│   │   │   │   ├── models/          # Attempt, Submission, Problem, Evaluation
│   │   │   │   ├── enums/           # AttemptStatus, RubricCriterion
│   │   │   │   ├── state-machine/   # Attempt state machine rules
│   │   │   │   └── value-objects/   # RubricScore, FeedbackItem
│   │   │   ├── evaluation/
│   │   │   │   ├── evaluator.interface.ts
│   │   │   │   ├── rule-based-evaluator.service.ts
│   │   │   │   ├── ai-evaluator.service.ts
│   │   │   │   └── evaluation.service.ts
│   │   │   ├── problems/
│   │   │   ├── attempts/
│   │   │   ├── submissions/
│   │   │   └── main.ts
│   │   └── test/                    # Integration & unit tests
│   └── web/
│       ├── src/
│       │   ├── components/          # RubricCard, ScoreBadge, StateStepper
│       │   ├── pages/               # Home, ProblemDetails, DesignWorkspace, FeedbackView, AttemptHistory
│       │   ├── services/            # API client
│       │   └── App.tsx
├── docs/
│   ├── DESIGN.md
│   ├── RESEARCH.md
│   ├── INTERVIEW_PREP.md
│   └── IMPLEMENTATION_PLAN.md
├── AI_USAGE.md
└── README.md
```

---

## 3. Phased Implementation Roadmap

### Phase 1: Core Research & Domain Documentation
- Write `docs/RESEARCH.md`: Target problem, existing tools, gaps, product strategy.
- Write `docs/DESIGN.md`: Detailed domain entities, responsibilities, state transition matrix, evaluator strategy, decision logs.

### Phase 2: Backend Architecture & Database (NestJS + Prisma + SQLite)
- Initialize monorepo project structure with `apps/api` and `apps/web`.
- Configure `prisma/schema.prisma` with `Problem`, `Attempt`, `Submission`, `Evaluation`, and `EvaluationCriterion`.
- Seed 4 initial LLD problems:
  - Parking Lot
  - Elevator System
  - Vending Machine
  - Library Management System
- Implement Prisma seed script (`npx prisma db seed`).

### Phase 3: Domain State Machine & Evaluator Pipeline
- Implement `AttemptStateMachine` enforcing valid state transitions.
- Implement `RuleBasedEvaluator` (deterministic gate and fallback evaluator).
- Implement `AIEvaluator` using `@google/genai` / OpenAI structured response schema with fallback handling.
- Implement `EvaluationService` orchestrating: Deterministic check → Persist submission → Evaluator execution → Evaluation outcome update.

### Phase 4: REST API Controllers & DTOs
- `GET /api/problems`: List all 4 LLD problems.
- `GET /api/problems/:slug`: Get detailed problem specs & requirements.
- `POST /api/problems/:slug/attempts`: Start a practice attempt.
- `GET /api/attempts/:id`: Get attempt state, submissions, and latest evaluation.
- `POST /api/attempts/:id/submissions`: Submit solution, trigger evaluation, return structured feedback.
- `GET /api/problems/:slug/attempts`: Get attempt history for a problem.

### Phase 5: Frontend UI (React + Vite + Tailwind CSS)
- Build 5 focused views:
  1. **Home / Problem List**: Modern developer UI with difficulty badges & quick access.
  2. **Problem Details**: Specification view with requirements, constraints, and thinking points.
  3. **Practice Workspace**: Tabbed structured text submission form (Requirements, Classes & Responsibilities, Relationships & Interfaces, Edge Cases & Pseudocode).
  4. **Evaluation / Feedback Page**: **The flagship UI screen** featuring overall score gauge, 8 rubric breakdown cards with evidence citations, concerns, and actionable suggestions.
  5. **Attempt History**: Practice progression view concerning scores across attempts with retry triggers.

### Phase 6: Automated Testing & Verification
- Unit tests for domain state machine state transitions.
- Unit tests for `RuleBasedEvaluator` and `AIEvaluator` response parsing / error handling.
- API integration tests (Supertest/Vitest) for attempt creation, submission persistence, and idempotency/duplicate submission handling.

### Phase 7: Documentation & Interview Readiness
- Write `README.md` with environment setup, seed instructions, execution commands.
- Write `docs/INTERVIEW_PREP.md` containing 20+ interview-style Q&A explaining design decisions, alternatives, trade-offs, and scaling paths.
- Write `AI_USAGE.md` documenting 3-5 real AI-assisted design and implementation choices.

---

## 4. Verification Plan

### Automated Tests
- Run `npm test` in `apps/api` to verify unit and API integration tests.

### End-to-End Learner Journey Verification
1. Run `npx prisma db seed`.
2. Start API (`http://localhost:3000`) and Web (`http://localhost:5173`).
3. Complete learner loop: Home → Problem Details → Start Attempt → Fill Workspace → Submit → View Feedback Screen → View Attempt History → Retry Attempt 2.
4. Verify offline fallback behavior when AI API key is missing.
