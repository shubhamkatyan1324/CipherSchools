# AI Usage Log: Key Architectural Decisions

This document details 4 key AI-assisted design and coding decisions made during the development of the **LLD Practice Platform**, explicitly highlighting suggestions accepted, rejected, and technical rationale.

---

## Decision 1: Evaluator Extensibility Abstraction (Factory vs Pure Strategy)

- **WHAT AI SUGGESTED**: An elaborate `EvaluatorFactory` class with dynamic reflection, plugin registries, and multi-tenant dynamic loader modules for OpenAI, Anthropic, Gemini, and Rule-Based engines.
- **WHAT WE ACCEPTED**: Clean `Evaluator` Strategy interface and `EvaluationService` orchestration logic.
- **WHAT WE REJECTED**: `EvaluatorFactory` class and dynamic reflection registries.
- **WHY**: For a 2-day MVP, an additional factory abstraction introduced unnecessary complexity without adding value. Standard constructor injection of `RuleBasedEvaluator` and `AIEvaluator` inside `EvaluationService` is far simpler, cleaner, and fully adheres to the Open-Closed Principle (OCP).

---

## Decision 2: Submission Persistence vs Evaluation Order

- **WHAT AI SUGGESTED**: Running evaluation in-memory first, and only persisting the submission and evaluation to SQLite together in a single atomic database transaction after AI evaluation finishes successfully.
- **WHAT WE ACCEPTED**: Two-phase persistence: Persist `Submission` snapshot *first*, transition attempt state to `EVALUATING`, then run evaluation and record `Evaluation` output.
- **WHAT WE REJECTED**: Atomic single-transaction save after AI response.
- **WHY**: If the AI API experiences network timeouts, rate limits, or malformed outputs, saving after AI invocation risks losing the learner's entire submission text. Persisting the submission snapshot first ensures learner work is never lost.

---

## Decision 3: Deterministic Validation Gate before LLM Prompting

- **WHAT AI SUGGESTED**: Sending all learner text inputs directly to the LLM and letting the LLM evaluate whether the submission was empty, incomplete, or malformed.
- **WHAT WE ACCEPTED**: Stage 1 **Deterministic Validation Gate** in `RuleBasedEvaluator` checking mandatory fields, min character counts, and structural completeness before calling AI.
- **WHAT WE REJECTED**: Relying on LLM for basic structural input validation.
- **WHY**: Calling third-party LLMs for empty or 2-word submissions wastes API token quota and introduces unnecessary latency. Failing fast deterministically locally is cheaper, faster, and more reliable.

---

## Decision 4: Rubric Structure & Score Normalization

- **WHAT AI SUGGESTED**: Allowing the LLM to return arbitrary floating-point scores, custom criterion names, and variable length arrays of criteria.
- **WHAT WE ACCEPTED**: Fixed 8-dimension `RubricCriterion` enum with normalized integer scores (0 to 10 per criterion, 0 to 100 overall) and strict JSON schema validation.
- **WHAT WE REJECTED**: Arbitrary LLM criterion keys and unvalidated score outputs.
- **WHY**: Unvalidated LLM output can yield unpredictable scores (e.g. 15/10) or missing criteria. Enforcing strict enum validation guarantees consistent UI rendering across all 8 rubric cards.
