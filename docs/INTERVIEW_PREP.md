# Interview Preparation Guide: Technical Rationale & Verbal Answers

This guide prepares you to verbally explain every major architectural decision, design pattern, trade-off, and system boundary during technical interviews.

---

## 1. Core Architecture & System Boundaries

### Q1: Why did you choose a modular monolith instead of microservices?
- **DECISION**: Built a monolithic NestJS application with clean domain module boundaries.
- **REASON**: High developer velocity for a 2-day MVP; avoids network latency, distributed tracing overhead, and complex infrastructure deployment.
- **ALTERNATIVES**: Microservices (Problem Service, Submission Service, Evaluation Service) communicating via gRPC/Kafka.
- **TRADE-OFF**: Sacrificed isolated per-service scaling; gained rapid development, type safety, and zero deployment friction.
- **VERBAL INTERVIEW ANSWER**:
  > *"For a 2-day MVP, a modular monolith inside NestJS gives us clear domain separation via Nest modules without incurring microservices network latency or deployment overhead. If evaluation volume grows, we can decompose the Evaluation domain into a dedicated worker service without refactoring core domain models."*

---

### Q2: Why did you choose SQLite with Prisma ORM?
- **DECISION**: SQLite database managed via Prisma ORM.
- **REASON**: Zero-dependency local setup for reviewers (single file `dev.db`); Prisma handles schema migrations seamlessly.
- **ALTERNATIVES**: PostgreSQL via Docker container.
- **TRADE-OFF**: SQLite has write concurrency limits under high parallel loads; gained single-command setup (`npx prisma db push && npx prisma db seed`).
- **VERBAL INTERVIEW ANSWER**:
  > *"SQLite was a deliberate choice for zero-dependency local testing. By placing Prisma ORM in front of SQLite, the application database layer remains fully abstracted. Switching to PostgreSQL in production requires changing just one line in `schema.prisma`."*

---

## 2. Domain Model & Lifecycle

### Q3: Why is `Attempt` separate from `Submission`?
- **DECISION**: `Attempt` represents the practice session and lifecycle state machine; `Submission` represents an **immutable versioned snapshot** (v1, v2, v3).
- **REASON**: Learner practice evolves over time. Conflating them would destroy historical submission data when retrying.
- **ALTERNATIVES**: Storing submission text directly inside the `Attempt` table.
- **TRADE-OFF**: Slightly higher normalized table count; gained full submission history comparison and zero-data-loss guarantees.
- **VERBAL INTERVIEW ANSWER**:
  > *"An Attempt models the learner's overall practice session and enforces state machine transitions. A Submission is an immutable snapshot of their design text at a specific moment. Separating them allows learners to create multiple revisions (v1, v2) under a single attempt history without overwriting previous work."*

---

### Q4: How do you prevent invalid state transitions in the attempt lifecycle?
- **DECISION**: Implemented a domain `AttemptStateMachine` that enforces permitted transitions (`IN_PROGRESS` → `SUBMITTED` → `EVALUATING` → `COMPLETED` / `FAILED`).
- **REASON**: Prevents invalid states such as re-submitting a `COMPLETED` attempt or skipping evaluation.
- **ALTERNATIVES**: Freeform status updates in controllers.
- **TRADE-OFF**: Requires domain validation logic on status updates; gained strict data consistency and testable lifecycle logic.
- **VERBAL INTERVIEW ANSWER**:
  > *"We built an explicit `AttemptStateMachine` domain class. Every state change is validated against an allowed transition matrix. If a request tries to push a `COMPLETED` attempt back to `SUBMITTED`, an `InvalidStateTransitionException` is thrown before any database mutation occurs."*

---

## 3. Evaluation Architecture & AI Isolation

### Q5: Why use the Strategy Pattern for the Evaluator?
- **DECISION**: Defined an `Evaluator` interface implemented by `AIEvaluator` (Gemini API) and `RuleBasedEvaluator` (heuristic fallback).
- **REASON**: Isolates domain practice logic from external AI SDKs; allows running fully offline without API keys.
- **ALTERNATIVES**: Directly embedding Google Gemini SDK calls inside `SubmissionService`.
- **TRADE-OFF**: Requires mapping LLM JSON outputs into standard interfaces; gained 100% provider independence and offline testability.
- **VERBAL INTERVIEW ANSWER**:
  > *"By programming to an `Evaluator` interface, our practice workflow depends on an abstraction rather than a vendor SDK. We can swap Gemini for OpenAI, Claude, or local deterministic rules without touching domain code."*

---

### Q6: Why separate deterministic validation from AI evaluation?
- **DECISION**: A fast **Deterministic Validation Gate** runs before invoking AI evaluation.
- **REASON**: Empty or malformed submissions are caught instantly without wasting LLM token costs or triggering network API delays.
- **ALTERNATIVES**: Passing raw user inputs directly to the LLM.
- **TRADE-OFF**: Adds structural validation checks; gained fast feedback, lower token expenditure, and protection against bad prompts.
- **VERBAL INTERVIEW ANSWER**:
  > *"Deterministic validation acts as a fast gate. It checks for mandatory fields and structural rules before calling the LLM. If a submission fails this gate, it fails fast locally, saving API tokens and preventing malformed inputs from reaching the AI model."*

---

### Q7: What happens if AI evaluation fails or times out?
- **DECISION**: `Submission` snapshot is persisted to database *before* evaluation starts. If AI fails, `EvaluationService` catches the exception and falls back to `RuleBasedEvaluator`, updating status to `COMPLETED` (or `FAILED` on hard crash).
- **REASON**: Learner effort must never disappear due to third-party API issues.
- **ALTERNATIVES**: Wrapping database save and AI call inside an unhandled block that rolls back the submission.
- **TRADE-OFF**: Requires two-phase database updates; gained zero data loss guarantee.
- **VERBAL INTERVIEW ANSWER**:
  > *"Submissions are persisted to SQLite BEFORE evaluation begins. If the Gemini API experiences a timeout or parsing failure, the system gracefully falls back to our deterministic evaluator. The learner's submission is never lost."*

---

## 4. Product Thinking & Trade-offs

### Q8: Why structured text submission instead of a visual UML editor?
- **DECISION**: Text-based structured fields (Requirements, Classes, Responsibilities, Interfaces, Edge Cases, Pseudocode).
- **REASON**: Providing evidence of object-oriented design thought process matters more than aligning SVG arrows. A visual UML canvas takes 80% of dev time without adding evaluation depth.
- **ALTERNATIVES**: Canvas-based drag-and-drop UML diagram editor.
- **TRADE-OFF**: Less visual diagram rendering; gained structured textual data that is directly parseable by rubric evaluation algorithms.
- **VERBAL INTERVIEW ANSWER**:
  > *"In LLD interviews, recruiters evaluate your reasoning about responsibilities, SOLID principles, and trade-offs. Structured text fields capture this evidence clearly while allowing automated rubric engines to analyze class contracts without needing OCR or visual canvas parsers."*

---

## 5. Summary Pitch

### 30-Second Elevator Pitch
> *"I built a LeetCode-like practice platform for Low-Level Design (LLD). Candidates pick benchmark problems like Parking Lot or Elevator System, write structured object-oriented architectures, and receive instant rubric feedback across 8 SOLID design dimensions with evidence citations and actionable suggestions."*

### 2-Minute Project Overview
> *"Most technical interview platforms evaluate code via basic unit tests, which fail to evaluate design quality, coupling, cohesion, or SOLID principles. My LLD Practice Platform solves this by providing a structured design workspace and a dual-stage evaluation pipeline.*
> 
> *First, a deterministic validation gate checks for structural completeness. Then, using the Strategy pattern, our `AIEvaluator` evaluates the design against an 8-dimension rubric—citing evidence, identifying concerns, and giving confidence scores. If API keys are missing or third-party APIs fail, the system falls back to a deterministic rule-based engine.*
> 
> *Architecturally, it's a modular NestJS monolith with Prisma and SQLite, featuring a strict `AttemptStateMachine` to prevent illegal state transitions, and an immutable `Submission` model so learner progress is saved before evaluation. It includes 4 benchmark problems, full test coverage, and a React + Tailwind UI centered around a powerful feedback dashboard."*
