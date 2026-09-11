# Low-Level Design (LLD) Practice Platform

An engineering-focused, polished MVP of a **LeetCode-like Low-Level Design (LLD) Practice Platform** built for the Cipher Schools Internship Assignment.

---

## Overview

The **LLD Practice Platform** enables software engineers to practice object-oriented design problems, structure their class architectures, receive instant automated feedback scored across an **8-Dimension Rubric**, and iteratively improve their designs across versioned attempt histories.

### Key Learner Workflow
1. **Choose an LLD Problem**: Browse benchmark problems (*Parking Lot*, *Elevator System*, *Vending Machine*, *Library Management System*).
2. **Understand Requirements**: Review functional scope, system constraints, and evaluation pointers.
3. **Design Workspace**: Fill structured design sections (Requirements, Scope Assumptions, Classes, Responsibilities, Interfaces, Relationships, Edge Cases & Concurrency, Pseudocode).
4. **Deterministic Validation Gate**: Malformed or empty submissions fail fast, preserving system resources and preventing invalid requests.
5. **Evaluation & Feedback (Flagship UI)**: Receive structured 8-dimension rubric evaluation scored out of 100 with evidence citations, identified design concerns, actionable suggestions, and confidence scores.
6. **Attempt History & Retry**: Review past attempts and create new revision attempts (v1, v2, v3) without losing previous submission history.

---

## Architecture & Technology Stack

```
CipherSchools/
├── apps/
│   ├── api/          # NestJS + Prisma ORM + SQLite + Vitest
│   └── web/          # React 18 + Vite + Tailwind CSS + React Router
├── docs/
│   ├── DESIGN.md           # Domain entities, state machine & ADRs
│   ├── RESEARCH.md         # Problem background & competitive analysis
│   ├── INTERVIEW_PREP.md   # 20+ Verbal interview Q&A
│   └── IMPLEMENTATION_PLAN.md # Architectural blueprint & verification plan
├── AI_USAGE.md       # Documented AI-assisted design decisions
└── README.md
```

### Technology Selection
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide React icons, React Router DOM v6.
- **Backend**: Node.js, NestJS, TypeScript, Prisma ORM.
- **Database**: SQLite (`dev.db`) for zero-dependency local setup.
- **AI Engine**: Strategy Pattern implementing `@google/generative-ai` (Gemini 1.5 Flash) with fallback to deterministic heuristic `RuleBasedEvaluator` when no API key is set.
- **Testing**: Vitest for unit & state machine testing.

---

## Quickstart & Installation

### Prerequisites
- **Node.js**: v18+ or v20+ or v24+
- **NPM**: v9+ or v10+ or v11+

### 1. Install Dependencies
From the repository root:
```bash
# Install root & workspace packages
npm install --prefix apps/api
npm install --prefix apps/web
```

### 2. Setup SQLite Database & Seed Data
```bash
# Push Prisma schema and seed 4 LLD benchmark problems
cd apps/api
npx prisma db push
npx prisma db seed
```

### 3. Configure Environment Variables (Optional AI Key)
Create `apps/api/.env`:
```env
DATABASE_URL="file:./dev.db"
PORT=3000
GEMINI_API_KEY="your-optional-gemini-api-key"
```
> **Note**: If `GEMINI_API_KEY` is omitted, the platform seamlessly falls back to the deterministic `RuleBasedEvaluator` engine!

---

## Running the Application

### Single Command (Starts Both Backend & Frontend Concurrently)

```bash
npm run dev
```

This single command launches both servers in parallel:
- **Backend API**: `http://localhost:3000/api`
- **Frontend Web App**: `http://localhost:5173`

---

## Running Automated Tests

```bash
# Run Vitest domain & evaluator test suite
npm --prefix apps/api test
```

Unit test coverage includes:
- `AttemptStateMachine` state transition validation (`IN_PROGRESS` → `SUBMITTED` → `EVALUATING` → `COMPLETED` / `FAILED`; invalid transition rejection).
- `RuleBasedEvaluator` deterministic structural validation gate & 8-dimension fallback scoring.

---

## Evaluation Rubric Dimensions

Every submission is evaluated against **8 Fixed Criteria**:
1. **Requirement Understanding**: Accuracy in capturing functional and non-functional scope.
2. **Class Responsibilities**: Single Responsibility Principle (SRP) enforcement.
3. **Coupling & Cohesion**: High internal cohesion with loose module coupling.
4. **Encapsulation & Interfaces**: Information hiding and dependence on abstractions.
5. **Abstraction / Design Patterns**: Justified usage of GoF design patterns (Strategy, Factory, Observer, State, etc.).
6. **Extensibility**: Adherence to Open-Closed Principle (OCP).
7. **Edge Cases & Testability**: Concurrency locks, boundary states, and mockability.
8. **Quality of Explanation**: Depth of design rationale and clarity of trade-offs.

---

## Limitations & Future Enhancements
- **Multi-user Authentication**: Simplified to lightweight default learner sessions for 2-day MVP scope.
- **Visual Diagram Editor**: Purposely avoided spending 80% of development time on UI canvas mechanics; structured text provides direct evidence for rubric evaluation.
- **Asynchronous Message Queues**: Designed as an in-process synchronous state transition pipeline; can be extended with BullMQ / Redis queues for high-volume concurrency in production.
