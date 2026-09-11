# Complete Beginner's Guide to CipherSchools LLD Practice Platform

Welcome! This guide is designed to teach you every single part of your **Low-Level Design (LLD) Practice Platform** codebase from scratch.

Whether you are new to Object-Oriented Programming (OOP), SOLID principles, design patterns, NestJS, Prisma, or React, this document will explain everything using clear analogies, actual snippets from your codebase, and real interview preparation strategies.

---

## PART 1 — WHAT DID I BUILD?

### 1. What problem does this platform solve?
In technical interviews (especially at product-based companies), candidates are often asked to create a **Low-Level Design (LLD)** for real-world software systems (e.g., Parking Lot, Elevator System, Rate Limiter). Candidates struggle because existing platforms like LeetCode focus on Data Structures & Algorithms (DSA), while system design platforms only provide static reading material.

**CipherSchools LLD Practice Platform** is an interactive practice & evaluation platform. It gives users structured LLD problem statements, lets them write out their class designs, relationships, and design pattern choices in a guided workspace, and then automatically evaluates their design using AI (with an offline fallback) to provide instant, rubric-based feedback.

---

### 2. Who is the user?
The user is a software developer or student preparing for software engineering LLD interviews.

---

### 3. What does the user do from beginning to end?
1. **Browse Problems**: Views a curated list of LLD problems on the **Home Page** (`/`).
2. **Read Problem Statement**: Selects a problem (e.g., "Parking Lot System") to review its description, core requirements, constraints, and thinking points (`/problem/parking-lot-system`).
3. **Start an Attempt**: Clicks "Start Design Problem", which creates a new **Attempt** in the database and launches the interactive editor workspace (`/attempt/:id`).
4. **Draft Design**: Fills out 8 structured design sections:
   - Requirements & Assumptions
   - Class Definitions & Entities
   - Class Responsibilities
   - Class Relationships & Dependencies
   - Interfaces & Abstractions
   - Key Design Decisions & Trade-offs
   - Edge Cases & Concurrency
   - Pseudocode / Code Snippets
5. **Submit Design**: Clicks "Submit Design for Evaluation".
6. **View Feedback**: Gets navigated to the **Feedback Page** (`/attempt/:id/feedback`), which displays:
   - Overall Score (0 to 100)
   - Summary & Evaluator Type (`[AI Evaluated]` or `[Rule-Based Fallback]`)
   - Strengths, Weaknesses, and Actionable Recommendations
   - Section-by-section breakdown with scores (0–10), evidence from candidate text, concerns, and suggestions.
7. **Retry / Improve**: Reads the feedback, returns to the workspace or creates a new attempt to refine their design.

---

### 4. Complete Example: The Parking Lot System Journey

Let's trace a user named Alex attempting the **Parking Lot System** problem:

```
[User: Alex]
    │
    ▼ 1. Chooses "Parking Lot System" on HomePage
[ProblemDetailsPage (/problem/parking-lot-system)]
    │
    ▼ 2. Clicks "Start Design Problem" (POST /api/problems/parking-lot-system/attempts)
[Database creates Attempt (Status: IN_PROGRESS)]
    │
    ▼ 3. Redirected to WorkspacePage (/attempt/att-123)
[Fills 8 LLD text fields: Vehicle classes, ParkingSpot, Ticket, Strategy pattern for pricing]
    │
    ▼ 4. Clicks "Submit for Evaluation" (POST /api/attempts/att-123/submissions)
[Backend Pipeline Executes]:
   ├─► a. Validate State Transition (IN_PROGRESS -> SUBMITTED)
   ├─► b. Deterministic Gate Check (Min 10 chars per section)
   ├─► c. Persist Submission v1 to SQLite DB
   ├─► d. Transition Attempt status to EVALUATING
   ├─► e. Run Evaluation Engine (Gemini AI -> Rule-Based Fallback)
   ├─► f. Save Evaluation & Criteria to DB
   └─► g. Transition Attempt status to COMPLETED
    │
    ▼ 5. Frontend redirects to FeedbackPage (/attempt/att-123/feedback)
[Displays Score: 85/100, Strengths, Weaknesses, Criteria Scores & Feedback]
    │
    ▼ 6. Alex clicks "Retry / New Attempt"
[Creates Attempt 2, starts fresh with versioned tracking]
```

---

## PART 2 — PROJECT STRUCTURE

Here is how your project workspace is organized:

```
CipherSchools/
├── apps/
│   ├── api/                  # Backend NestJS Application
│   │   ├── prisma/           # Database Schema & Seed Data
│   │   └── src/
│   │       ├── attempts/     # Attempt management & evaluation triggering
│   │       ├── domain/       # Core business logic (Enums & State Machine)
│   │       ├── evaluation/   # Evaluation Engine (AI & Rule-Based Evaluators)
│   │       ├── problems/     # Problem catalog service & controller
│   │       ├── submissions/  # Submission Data Transfer Objects (DTOs)
│   │       ├── app.module.ts # Main NestJS dependency injection module
│   │       └── main.ts       # Backend entry point (starts server on port 3001)
│   └── web/                  # Frontend React + Vite Application
│       └── src/
│           ├── components/   # UI components (Header, Badges, Toasts)
│           ├── pages/        # Main route pages (Home, Details, Workspace, Feedback, History)
│           ├── services/     # API fetch client layer
│           ├── types/        # TypeScript type interfaces
│           ├── App.tsx       # React Router setup
│           └── main.tsx      # React DOM entry point
└── docs/                     # Documentation files
```

### Important Files Deep Dive

#### 1. `apps/api/src/domain/state-machine/attempt-state-machine.ts`
* **What is this file?** A standalone TypeScript class implementing the state transition rules for an `Attempt`.
* **Why does it exist?** To prevent invalid lifecycle state changes (e.g. evaluating an attempt that was never submitted).
* **What does it contain?** `ALLOWED_TRANSITIONS` lookup table, `canTransition()`, and `validateTransition()`.
* **Who calls/uses it?** `AttemptsService.submitSolution()`.
* **What would break if removed?** The state machine protection would vanish, allowing invalid API calls to corrupt attempt workflow states.

#### 2. `apps/api/src/evaluation/evaluator.interface.ts`
* **What is this file?** TypeScript interface contract defining what an `Evaluator` MUST implement (`evaluate()`).
* **Why does it exist?** Establishes the **Strategy Design Pattern** and **Dependency Inversion Principle (DIP)**.
* **What does it contain?** `Evaluator` interface, `EvaluationResult`, `CriterionEvaluationResult`, `EvaluatorProblemContext`, `EvaluatorSubmissionContext`.
* **Who calls/uses it?** `EvaluationService`, `AIEvaluator`, and `RuleBasedEvaluator`.
* **What would break if removed?** Polymorphic evaluation would break; services would become tightly coupled to specific evaluator classes.

#### 3. `apps/api/src/evaluation/evaluation.service.ts`
* **What is this file?** The evaluation orchestrator service.
* **Why does it exist?** Coordinates structural validation and chooses whether to invoke `AIEvaluator` or fallback to `RuleBasedEvaluator`.
* **What does it contain?** `performDeterministicValidation()` and `runEvaluation()`.
* **Who calls/uses it?** `AttemptsService.submitSolution()`.
* **What would break if removed?** The backend wouldn't know how to evaluate submissions or fallback when AI fails.

#### 4. `apps/api/src/evaluation/ai-evaluator.service.ts`
* **What is this file?** The Google Gemini AI implementation of the `Evaluator` interface.
* **Why does it exist?** Calls Google's Gemini LLM with a detailed rubric prompt to score user submissions dynamically.
* **What does it contain?** `evaluate()`, `buildPrompt()`, and `parseAndValidateResponse()`.
* **Who calls/uses it?** `EvaluationService.runEvaluation()`.
* **What would break if removed?** AI-powered dynamic evaluation feedback would be unavailable.

#### 5. `apps/api/src/evaluation/rule-based-evaluator.service.ts`
* **What is this file?** The deterministic rule-based implementation of the `Evaluator` interface.
* **Why does it exist?** Serves as an instant validation gate AND offline evaluation fallback when no AI key is present or AI fails.
* **What does it contain?** `validateSubmissionStructure()` and heuristic evaluators for all 8 criteria.
* **Who calls/uses it?** `EvaluationService`.
* **What would break if removed?** Structural validation checks and offline evaluation fallback would break.

#### 6. `apps/api/src/attempts/attempts.service.ts`
* **What is this file?** The main business logic service for practice attempts.
* **Why does it exist?** Orchestrates creating attempts, retrieving history, persisting submissions, executing evaluation, and persisting feedback.
* **What does it contain?** `createAttempt()`, `getAttempt()`, `getAttemptsByProblem()`, `submitSolution()`, and `formatAttemptResponse()`.
* **Who calls/uses it?** `AttemptsController`.
* **What would break if removed?** The core feature of submitting and retrieving LLD attempts would fail.

#### 7. `apps/api/prisma/schema.prisma`
* **What is this file?** The database schema specification for Prisma ORM.
* **Why does it exist?** Defines database models (`Problem`, `Attempt`, `Submission`, `Evaluation`, `EvaluationCriterion`) and generates type-safe database access code.
* **What does it contain?** Data models, field types, primary keys, foreign keys, and cascading deletion rules.
* **Who calls/uses it?** Prisma CLI and `PrismaService`.
* **What would break if removed?** Database migrations, client code generation, and database interactions would cease working.

#### 8. `apps/web/src/pages/WorkspacePage.tsx`
* **What is this file?** The React frontend interactive LLD editor page.
* **Why does it exist?** Gives users an intuitive, tabbed or section-based form to write their LLD design solution.
* **What does it contain?** Form state for all 8 sections, validation error triggers, and submit handling.
* **Who calls/uses it?** React Router at path `/attempt/:id`.
* **What would break if removed?** Users would have no interface to write or submit their LLD designs.

---

## PART 3 — DATABASE

Your application uses **Prisma ORM** with an **SQLite** database (`apps/api/prisma/dev.db`).

### 1. Prisma Schema Breakdown

Here are the 5 core models in `apps/api/prisma/schema.prisma`:

```
┌──────────────┐       1:N       ┌──────────────┐
│   Problem    │ ───────────────>│   Attempt    │
└──────────────┘                 └──────────────┘
                                        │
                                     1:N│
                                        ▼
                                 ┌──────────────┐
                                 │  Submission  │
                                 └──────────────┘
                                        │
                                     1:1│
                                        ▼
                                 ┌──────────────┐
                                 │  Evaluation  │
                                 └──────────────┘
                                        │
                                     1:N│
                                        ▼
                                 ┌─────────────────────┐
                                 │ EvaluationCriterion │
                                 └─────────────────────┘
```

* **`Problem`**: Represents an LLD problem (e.g. Parking Lot System). Stores slug, title, difficulty, description, requirements (JSON), constraints (JSON), and thinkingPoints (JSON).
* **`Attempt`**: Represents a user's session trying to solve a problem. Stores `problemId`, `status` (`IN_PROGRESS`, `SUBMITTED`, `EVALUATING`, `COMPLETED`, `FAILED`), and timestamps.
* **`Submission`**: Represents a specific snapshot of the user's LLD answer text. Stores `attemptId`, `version` (1, 2, 3...), and all text sections (`requirements`, `classes`, `responsibilities`, etc.).
* **`Evaluation`**: Represents the evaluation outcome for a specific submission (1-to-1 with `Submission`). Stores `submissionId`, `overallScore`, `summary`, `strengths`, `weaknesses`, `recommendations`.
* **`EvaluationCriterion`**: Detailed breakdown of evaluation across specific criteria (1-to-Many with `Evaluation`). Stores `criterionKey`, `score` (0-10), `evidence`, `concern`, `suggestion`, `confidence`.

---

### 2. Why is `Attempt` separate from `Submission`?

**Concept**:
- An **Attempt** is the *journey/session* (e.g. "My attempt on Parking Lot System on Sept 10").
- A **Submission** is an immutable *snapshot of work* submitted at a specific point in time (v1, v2, v3).

**Real-world Example**:
```
Attempt 1 (ID: att-001, Status: COMPLETED)
 ├── Submission v1 (Score: 65/100) -> Candidate missed thread safety
 └── User clicks "Retry" / updates submission in same attempt context:
 └── Submission v2 (Score: 90/100) -> Added Mutex locks & State Pattern
```
By separating them:
1. You maintain full **version history** of how a candidate improved over time.
2. If evaluation fails (e.g., AI timeout), the `Submission` remains safely stored in DB while `Attempt` status marks `FAILED`. The user's typed work is never lost!

---

### 3. Key Concepts Explained
* **Primary Key (`@id @default(uuid())`)**: A unique identifier for every row (e.g. `c7b9e...`). Guarantees no two rows ever collide.
* **Foreign Key (`@relation(...)`)**: A column in one table linking to the Primary Key of another table (e.g. `attemptId` in `Submission` references `id` in `Attempt`).
* **Cascade Delete (`onDelete: Cascade`)**: If an `Attempt` is deleted, Prisma automatically deletes all associated `Submission` and `Evaluation` rows, preventing orphaned data.
* **Why Prisma?** Prisma provides type-safe database queries in TypeScript, automatic migrations, and auto-generated SQL.
* **Why SQLite?** SQLite is a zero-configuration, lightweight file-based SQL database ideal for local development, rapid testing, and standalone interview demonstrations.

---

## PART 4 — OOP CONCEPTS USED IN MY PROJECT

Object-Oriented Programming (OOP) is at the heart of this project. Here is how core OOP concepts appear in your code:

---

### 1. Class
* **Analogy**: A blueprint for building houses. The blueprint isn't a house itself, but specifies what rooms and features a house will have.
* **In Your Code**: `AttemptStateMachine` in `apps/api/src/domain/state-machine/attempt-state-machine.ts`.
* **Snippet**:
```typescript
export class AttemptStateMachine {
  private static readonly ALLOWED_TRANSITIONS = { ... };
  public static canTransition(...) { ... }
}
```
* **Why Useful**: Groups state validation functions into a cohesive blueprint module.

---

### 2. Object
* **Analogy**: An actual house built from the blueprint.
* **In Your Code**: An instance of `EvaluationService` created by NestJS's Dependency Injection system.
* **Snippet**:
```typescript
const service = new EvaluationService(ruleBasedEvaluator, aiEvaluator);
```
* **Why Useful**: Enables runtime memory allocation and state management for services.

---

### 3. Encapsulation
* **Analogy**: A car dashboard. You press the gas pedal to accelerate; you don't manually inject fuel into the engine cylinders yourself. Internal mechanics are hidden.
* **In Your Code**: Private methods in `AIEvaluator` (`apps/api/src/evaluation/ai-evaluator.service.ts`).
* **Snippet**:
```typescript
export class AIEvaluator implements Evaluator {
  // Public method exposed to outside world
  public async evaluate(...) { ... }

  // Private helper methods hidden inside the class
  private buildPrompt(...) { ... }
  private parseAndValidateResponse(...) { ... }
}
```
* **Why Useful**: Keeps caller code clean. External callers only call `evaluate()`; they don't need to know how prompt construction or JSON parsing works inside.

---

### 4. Abstraction
* **Analogy**: An ATM machine interface. You insert your card and request $50. You don't need to know the bank's database server IP or internal transaction log format.
* **In Your Code**: `Evaluator` interface in `apps/api/src/evaluation/evaluator.interface.ts`.
* **Snippet**:
```typescript
export interface Evaluator {
  evaluate(
    problem: EvaluatorProblemContext,
    submission: EvaluatorSubmissionContext
  ): Promise<EvaluationResult>;
}
```
* **Why Useful**: Hides complex evaluation logic behind a simple 1-method contract (`evaluate`).

---

### 5. Interface
* **Analogy**: An electrical wall socket. Any appliance matching the 3-prong plug contract (lamp, TV, laptop charger) can plug in and draw power.
* **In Your Code**: `Evaluator` interface implemented by both `AIEvaluator` and `RuleBasedEvaluator`.
* **Snippet**:
```typescript
export class AIEvaluator implements Evaluator { ... }
export class RuleBasedEvaluator implements Evaluator { ... }
```
* **Why Useful**: Guarantees that any evaluator class will have an `evaluate()` method matching exact input/output types.

---

### 6. Polymorphism
* **Analogy**: A TV remote "Power" button. Pressing it turns on a Sony TV, a Samsung TV, or an LG TV. The action is the same, but the internal execution depends on the target device.
* **In Your Code**: `EvaluationService` executing `.evaluate()` on whichever evaluator object is active.
* **Snippet**:
```typescript
// Inside EvaluationService:
const evaluator: Evaluator = useAI ? this.aiEvaluator : this.ruleBasedEvaluator;
const result = await evaluator.evaluate(problem, submission);
```
* **Why Useful**: `EvaluationService` doesn't care whether `evaluator` is AI or Rule-Based—it calls `.evaluate()` polymorphically!

---

### 7. Composition
* **Analogy**: A Computer "HAS-A" CPU and "HAS-A" Hard Drive. It does not inherit from CPU.
* **In Your Code**: `EvaluationService` HAS-A `RuleBasedEvaluator` and HAS-A `AIEvaluator`.
* **Snippet**:
```typescript
@Injectable()
export class EvaluationService {
  constructor(
    private readonly ruleBasedEvaluator: RuleBasedEvaluator,
    private readonly aiEvaluator: AIEvaluator
  ) {}
}
```
* **Why Useful**: Prefers flexibility over rigid inheritance hierarchies. `EvaluationService` combines existing services easily.

---

## PART 5 — SOLID PRINCIPLES

Let's evaluate how SOLID principles are applied in your codebase:

---

### 1. Single Responsibility Principle (SRP)
* **Definition**: A class should have one, and only one, reason to change.
* **In Your Code**: `AttemptStateMachine` (`apps/api/src/domain/state-machine/attempt-state-machine.ts`).
* **Why it fits**: It ONLY handles state transition validity. It does not handle database operations, HTTP requests, or AI scoring.
* **Honest Assessment**: **Genuinely followed.** `AttemptStateMachine` has a single, razor-sharp responsibility.

---

### 2. Open-Closed Principle (OCP)
* **Definition**: Software entities should be open for extension, but closed for modification.
* **In Your Code**: `Evaluator` interface (`apps/api/src/evaluation/evaluator.interface.ts`).
* **Why it fits**: If you want to add an `OpenAIEvaluator` or `ClaudeEvaluator`, you create a new class implementing `Evaluator`. You don't need to modify existing evaluator implementations.
* **Honest Assessment**: **Genuinely followed.** The interface allows adding new evaluation engines cleanly.

---

### 3. Dependency Inversion Principle (DIP)
* **Definition**: High-level modules should not depend on low-level modules. Both should depend on abstractions.
* **In Your Code**: `AIEvaluator` and `RuleBasedEvaluator` depend on the `Evaluator` interface abstraction.
* **Honest Assessment**: **Slight stretch in NestJS injection.** While both classes implement `Evaluator`, `EvaluationService` directly injects `RuleBasedEvaluator` and `AIEvaluator` by class reference in constructor parameters due to NestJS default token injection. However, conceptually DIP is respected because both implement the abstract `Evaluator` contract.

---

## PART 6 — DESIGN PATTERNS

### 1. Strategy Design Pattern (Evaluator Abstraction)

* **Pattern Name**: **Strategy Pattern**
* **Problem it Solves**: Allows selecting an algorithm at runtime without coupling the caller to concrete algorithm implementations.
* **Where it Appears**: `apps/api/src/evaluation/`
* **Classes / Interfaces Involved**:
  - `Evaluator` (Strategy Interface)
  - `AIEvaluator` (Concrete Strategy 1)
  - `RuleBasedEvaluator` (Concrete Strategy 2)
  - `EvaluationService` (Context / Orchestrator)

#### Execution Flow Diagram:

```
                  ┌──────────────────────┐
                  │  EvaluationService   │
                  └──────────┬───────────┘
                             │
            Is GEMINI_API_KEY present & working?
                       ┌─────┴─────┐
                   YES │           │ NO / FAILURE
                       ▼           ▼
             ┌───────────┐       ┌──────────────────────┐
             │AIEvaluator│       │  RuleBasedEvaluator  │
             └─────┬─────┘       └──────────┬───────────┘
                   │                        │
                   └───────────┬────────────┘
                               ▼
                    Implements: Evaluator
```

* **What would code look like without it?**
  Without Strategy Pattern, `EvaluationService` would contain huge nested `if-else` blocks with mixed prompt generation, HTTP API calls, and heuristic regex parsing all hardcoded into one 500-line function.
* **When NOT to use this pattern?**
  If you only have one evaluation method that will never change or vary, adding Strategy Pattern introduces unnecessary interface boilerplate.

---

## PART 7 — STATE MACHINE

Your project enforces attempt lifecycle progression using `AttemptStateMachine` located at `apps/api/src/domain/state-machine/attempt-state-machine.ts`.

### 1. The State Diagram

```
 (Start)
    │
    ▼
┌─────────────┐   submitSolution()   ┌───────────┐
│ IN_PROGRESS │ ────────────────────>│ SUBMITTED │
└─────────────┘                      └─────┬─────┘
                                           │
                                           ▼
┌───────────┐     eval succeeds      ┌───────────┐
│ COMPLETED │ <───────────────────── │ EVALUATING│
└───────────┘                        └─────┬─────┘
                                           │ eval fails
                                           ▼
                                     ┌───────────┐
                                     │  FAILED   │
                                     └─────┬─────┘
                                           │ retry
                                           └────► (Back to EVALUATING)
```

---

### 2. State Transition Rules Code (`attempt-state-machine.ts`)

```typescript
export class AttemptStateMachine {
  private static readonly ALLOWED_TRANSITIONS: Record<AttemptStatus, AttemptStatus[]> = {
    [AttemptStatus.IN_PROGRESS]: [AttemptStatus.SUBMITTED],
    [AttemptStatus.SUBMITTED]: [AttemptStatus.EVALUATING],
    [AttemptStatus.EVALUATING]: [AttemptStatus.COMPLETED, AttemptStatus.FAILED],
    [AttemptStatus.COMPLETED]: [], // Terminal state
    [AttemptStatus.FAILED]: [AttemptStatus.EVALUATING], // Allows retrying evaluation
  };

  public static canTransition(currentStatus: AttemptStatus, targetStatus: AttemptStatus): boolean {
    const allowed = this.ALLOWED_TRANSITIONS[currentStatus] || [];
    return allowed.includes(targetStatus);
  }

  public static validateTransition(currentStatus: AttemptStatus, targetStatus: AttemptStatus): void {
    if (!this.canTransition(currentStatus, targetStatus)) {
      throw new InvalidStateTransitionException(currentStatus, targetStatus);
    }
  }
}
```

### 3. What invalid transitions does it prevent?
- Cannot jump directly from `IN_PROGRESS` to `COMPLETED`.
- Cannot modify or resubmit an attempt that is already `COMPLETED`.
- Prevents concurrent submission race conditions from forcing invalid state jumps.

---

## PART 8 — BACKEND REQUEST FLOW

Let's trace a real API call step-by-step: `POST /api/attempts/:id/submissions`

```
1. HTTP POST Request received at AttemptsController
   │ Path: /api/attempts/att-101/submissions
   │ Body: CreateSubmissionDto { requirements: "...", classes: "...", ... }
   ▼
2. AttemptsController.submitSolution(id, dto)
   │ Validates DTO using ValidationPipe (min length 10 chars per section)
   ▼
3. AttemptsService.submitSolution(attemptId, dto)
   │ Reads Attempt from database via PrismaService
   ▼
4. Domain State Machine Validation
   │ Calls AttemptStateMachine.validateTransition(IN_PROGRESS, SUBMITTED)
   ▼
5. Deterministic Validation Gate
   │ Calls EvaluationService.performDeterministicValidation(payload)
   │ Ensures all 8 required sections contain at least 10 non-whitespace chars
   ▼
6. Database Submission Persistence
   │ Calculates version = attempt.submissions.length + 1
   │ Creates new Submission record in SQLite via Prisma
   ▼
7. Update Attempt Status
   │ Updates Attempt status to EVALUATING in database
   ▼
8. Run Evaluation Strategy
   │ Calls EvaluationService.runEvaluation(problemContext, submissionPayload)
   │ Checks for GEMINI_API_KEY:
   │   - If present: AIEvaluator.evaluate()
   │   - If missing/fails: RuleBasedEvaluator.evaluate()
   ▼
9. Persist Evaluation Results
   │ Creates Evaluation record in SQLite DB with JSON serialized feedback arrays
   │ Creates 8 EvaluationCriterion rows
   ▼
10. Update Attempt Status to COMPLETED
    │ Updates Attempt status to COMPLETED in DB
    ▼
11. Return Formatted Response
    │ Formats attempt object with full problem, submissions, and evaluation breakdown
    └─► Returns JSON response with 201 Created status to React client
```

---

## PART 9 — EVALUATION ENGINE

The evaluation pipeline guarantees high quality and resilience through a 3-tier architecture:

```
                  ┌─────────────────────────────────────┐
                  │ 1. Deterministic Validation Gate    │
                  │    (Fails fast if missing sections) │
                  └──────────────────┬──────────────────┘
                                     │ Passes
                                     ▼
                  ┌─────────────────────────────────────┐
                  │ 2. AI Evaluator (Gemini LLM)        │
                  │    (Structured JSON Prompt Rubric)  │
                  └──────────────────┬──────────────────┘
                                     │ API Key Missing / Exception / Malformed JSON
                                     ▼
                  ┌─────────────────────────────────────┐
                  │ 3. Rule-Based Fallback Evaluator    │
                  │    (Offline Heuristic Evaluator)    │
                  └─────────────────────────────────────┘
```

### Safety & Resilience Matrix:

| Scenario | What Happens? | Is User Data Lost? |
| :--- | :--- | :--- |
| **Incomplete Submission** (e.g. `< 10` chars) | Fails fast at Step 1 (`BadRequestException`). | **No.** Nothing saved to DB yet; user stays in editor. |
| **Gemini API Works** | Evaluates submission, returns score & criteria. Attempt state -> `COMPLETED`. | **No.** Saved safely. |
| **Gemini API Key Missing** | `EvaluationService` logs warning, uses `RuleBasedEvaluator`. Attempt state -> `COMPLETED`. | **No.** Saved safely. |
| **Gemini Throws Exception / Times out** | Caught in `try-catch` inside `EvaluationService`, falls back to `RuleBasedEvaluator`. Attempt state -> `COMPLETED`. | **No.** Saved safely. |
| **AI Returns Malformed JSON** | `AIEvaluator.parseAndValidateResponse` throws error; caught by `EvaluationService`; falls back to `RuleBasedEvaluator`. | **No.** Saved safely. |
| **Total Evaluation Exception** | `AttemptsService` `try-catch` catches error, updates Attempt status to `FAILED`. | **No!** Submission snapshot was persisted in DB at Step 6 before evaluation began! |

---

## PART 10 — FRONTEND FLOW

Your React frontend (`apps/web`) is built with Vite, React Router, TailwindCSS, and Lucide icons.

### Key Pages & Responsibilities:

1. **`HomePage.tsx`** (`/`):
   - **Role**: Displays problem catalog cards with difficulty badges and key features.
   - **API Calls**: `api.getProblems()`.

2. **`ProblemDetailsPage.tsx`** (`/problem/:slug`):
   - **Role**: Displays problem statement, constraints, thinking points, and attempt history link.
   - **API Calls**: `api.getProblemBySlug(slug)`, `api.createAttempt(slug)`.

3. **`WorkspacePage.tsx`** (`/attempt/:id`):
   - **Role**: Tabbed/sectioned editor for drafting LLD designs across 8 sections.
   - **State**: Form text values, active section tab, submitting spinner.
   - **API Calls**: `api.getAttempt(id)`, `api.submitSolution(id, payload)`.

4. **`FeedbackPage.tsx`** (`/attempt/:id/feedback`):
   - **Role**: Rich score dashboard displaying overall score, evaluator badge, strengths, weaknesses, and criteria breakdown.
   - **API Calls**: `api.getAttempt(id)`.

5. **`AttemptHistoryPage.tsx`** (`/problem/:slug/history`):
   - **Role**: Lists past attempts for a problem with scores and dates.
   - **API Calls**: `api.getAttemptsByProblem(slug)`.

---

## PART 11 — ARCHITECTURE DIAGRAM & RESPONSIBILITIES

```
┌─────────────────────────────────────────────────────────────┐
│                 React Frontend (Vite)                       │
│  HomePage | ProblemDetailsPage | WorkspacePage | Feedback  │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / REST API Calls
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  NestJS REST Controller                     │
│       AttemptsController  |  ProblemsController             │
└──────────────────────────────┬──────────────────────────────┘
                               │ DTO Validation Pipes
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer                           │
│       AttemptsService    |  EvaluationService               │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌─────────────────────────────┐ ┌─────────────────────────────┐
│       Domain Logic          │ │      Evaluation Engine      │
│    AttemptStateMachine      │ │ AIEvaluator / RuleBasedEval │
└──────────────┬──────────────┘ └──────────────┬──────────────┘
               │                               │
               └───────────────┬───────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     Prisma ORM Layer                        │
│             PrismaService (Type-Safe Queries)               │
└──────────────────────────────┬──────────────────────────────┘
                               │ SQL
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    SQLite Database                          │
│                      (dev.db)                               │
└─────────────────────────────────────────────────────────────┘
```

---

## PART 12 — ARCHITECTURAL DECISIONS

1. **Modular Monolith vs. Microservices**:
   - **Decision**: Modular Monolith.
   - **Why**: Keeps setup simple, zero network latency between services, easy single-command deployment (`npm run dev`).

2. **SQLite vs. PostgreSQL**:
   - **Decision**: SQLite via Prisma.
   - **Why**: Zero external database dependencies required. Works out of the box on any developer machine.

3. **Structured Text Inputs vs. Interactive Canvas**:
   - **Decision**: Structured 8-section text documentation.
   - **Why**: Real LLD interviews focus heavily on class design, responsibility allocation, interfaces, trade-offs, and edge cases, which are best expressed in text and code rather than visual drag-and-drop boxes.

4. **AI Evaluator with Offline Fallback**:
   - **Decision**: Primary Gemini AI evaluation with deterministic Rule-Based fallback.
   - **Why**: Guarantees system availability even without API keys or internet access.

5. **Attempt vs. Submission Separation**:
   - **Decision**: 1-to-Many relationship between Attempt and Submission.
   - **Why**: Preserves historical design revisions and ensures user work is never lost if evaluation fails.

---

## PART 13 — WHAT IS ACTUALLY IMPRESSIVE? (BRUTALLY HONEST)

### What is genuinely good?
- **Resilient Fallback Design**: The evaluation pipeline cleanly falls back from AI to Rule-Based evaluation without crashing.
- **Strict State Machine**: `AttemptStateMachine` prevents invalid lifecycle transitions.
- **Safety Data Persistence**: Persisting `Submission` before invoking evaluation prevents data loss.
- **Clean Separation of Concerns**: Modular domain, evaluation, and HTTP layers.

### What is average?
- **Rule-Based Evaluator**: Uses keyword matching and text heuristics. It is effective as a fallback, but simple.
- **Synchronous Evaluation**: Evaluation runs inside the HTTP request cycle. Works fine for single users, but heavy LLM delays (3-5 sec) hold the HTTP connection open.

### What is over-engineered?
- Having both `Attempt` and `Submission` when the frontend currently displays primarily the latest submission per attempt. (Though architectural separation is great for interviews!).

### Honest Feedback on Docs vs. Code:
- The code strictly implements what is documented! There are no fake pattern claims—Strategy Pattern and State Machine are genuinely written and executed in the source code.

---

## PART 14 — CODE YOU MUST UNDERSTAND FOR INTERVIEWS

### MUST UNDERSTAND (Study these line-by-line):
1. `apps/api/src/evaluation/evaluator.interface.ts` (Strategy Interface)
2. `apps/api/src/evaluation/evaluation.service.ts` (Evaluation Orchestrator & Fallback logic)
3. `apps/api/src/domain/state-machine/attempt-state-machine.ts` (State Machine rules)
4. `apps/api/src/attempts/attempts.service.ts` (`submitSolution` function)
5. `apps/api/prisma/schema.prisma` (Database models & relations)

### SHOULD UNDERSTAND:
1. `apps/api/src/evaluation/ai-evaluator.service.ts` (Gemini API integration & JSON schema prompt)
2. `apps/api/src/evaluation/rule-based-evaluator.service.ts` (Deterministic checks)
3. `apps/web/src/pages/WorkspacePage.tsx` (Frontend form handling)

### NICE TO UNDERSTAND:
1. `apps/api/src/problems/problems.service.ts` (Problem catalog queries)
2. `apps/web/src/services/api.ts` (Fetch wrapper)

---

## PART 15 — INTERVIEW QUESTIONS & ANSWERS

### Level 1: Basic Concept Questions

#### Q1: What is this project, and what problem does it solve?
* **What interviewer is testing**: Can you concisely explain a product's value proposition?
* **Beginner Explanation**: It's a web platform for practicing software design interviews with instant feedback.
* **Strong Answer**: "I built an interactive Low-Level Design (LLD) practice platform. It provides candidates with structured LLD problem statements, a guided 8-section design workspace, and an automated evaluation engine that uses AI with a rule-based fallback to evaluate designs against industry rubrics."
* **Likely Follow-up**: "Why structured text instead of UML diagrams?" -> *Answer: LLD interviews focus on class responsibilities, interfaces, design patterns, and concurrency trade-offs, which are best articulated through structured code and documentation.*

---

### Level 2: Technology & Database Choices

#### Q2: Why did you separate `Attempt` and `Submission` in your database?
* **What interviewer is testing**: Data modeling and failure handling skills.
* **Beginner Explanation**: Attempt is the overall session, submission is the version of text sent.
* **Strong Answer**: "I separated `Attempt` and `Submission` to achieve two goals: versioning and data safety. A candidate can retry a problem multiple times under the same attempt session. Crucially, during evaluation, the submission is saved to the database *before* calling the evaluation engine. If AI evaluation fails or times out, the submission text is safe and never lost."
* **Likely Follow-up**: "How does Prisma handle cascading deletes?" -> *Answer: In `schema.prisma`, `onDelete: Cascade` ensures deleting an attempt cleans up dependent submissions and evaluations.*

---

### Level 3: Architecture & Design Patterns

#### Q3: Where did you use the Strategy Pattern in this project?
* **What interviewer is testing**: Real understanding of GoF Design Patterns.
* **Beginner Explanation**: In the evaluation system, where AI and Rule-Based evaluators both follow the same interface.
* **Strong Answer**: "I used the Strategy Pattern for the Evaluation Engine. I defined an `Evaluator` interface with an `evaluate()` contract. Both `AIEvaluator` (which calls Gemini API) and `RuleBasedEvaluator` (offline heuristics) implement this interface. `EvaluationService` acts as the orchestrator, selecting or falling back between strategies at runtime without coupling caller code to concrete implementations."
* **Likely Follow-up**: "How would you add an OpenAI evaluator?" -> *Answer: Simply create `OpenAIEvaluator implements Evaluator` and register it in `EvaluationService`.*

---

### Level 4: Deep Technical & Production Readiness

#### Q4: What happens if the Gemini AI API fails during evaluation?
* **What interviewer is testing**: Fault tolerance and resilience.
* **Beginner Explanation**: It logs a warning and uses the rule-based evaluator instead.
* **Strong Answer**: "Our system implements a multi-tier fallback mechanism. First, `EvaluationService` attempts evaluation via `AIEvaluator`. If the API key is missing, or if Gemini throws a network error, timeout, or malformed JSON error, `EvaluationService` catches the exception, logs a warning, and seamlessly falls back to `RuleBasedEvaluator`. The user still receives feedback, and their submission remains safe."
* **Likely Follow-up**: "How would you scale evaluation for thousands of concurrent users?" -> *Answer: Move evaluation out of the synchronous HTTP request cycle into a background job queue (e.g. BullMQ with Redis).*

---
