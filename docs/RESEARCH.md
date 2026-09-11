# Research Note: LLD Practice Platform

## 1. The Learner Problem
Software engineering candidates preparing for technical interviews face a major gap:

1. **Algorithm vs. Design Mismatch**: Standard competitive coding platforms (LeetCode, HackerRank, CodeSignal) train candidates to solve algorithmic problems with strict time/space complexity bounds (e.g., $O(N \log N)$ sorting, dynamic programming). However, senior and staff engineering interviews heavily evaluate **Low-Level Design (LLD) & Object-Oriented Design (OOD)**.
2. **Lack of Automated Design Feedback**: In LLD interviews, candidates must design domain models, establish class hierarchies, enforce single responsibility, apply appropriate design patterns, and explain trade-offs. Existing automated platforms cannot evaluate these qualitative design attributes.
3. **Passive Learning Anti-Pattern**: Candidates resort to reading static LLD solutions or watching YouTube videos (e.g., "How to design Parking Lot"), leading to a false sense of competence without active practice or feedback.

---

## 2. Competitive Landscape & Gaps Analysis

| Platform / Tool | Learning Mode | Automated Evaluation | LLD / SOLID Evaluation | Attempt History & Feedback |
| :--- | :--- | :--- | :--- | :--- |
| **LeetCode / CodeSignal** | Code Execution | Yes (Unit Tests) | ❌ No (Only checks input/output correctness) | ❌ Algorithmic runtime only |
| **Draw.io / Excalidraw** | Canvas / UML | ❌ No | ❌ No manual or AI design feedback | ❌ Static diagrams |
| **Educative.io / Udemy** | Reading / Video | ❌ No | ❌ Static solution reading | ❌ No interactive attempt loop |
| **LLD Practice Platform (Our MVP)** | Structured Text & OOD Design | **Yes (Deterministic Gate + AI Rubric)** | **✅ Yes (8-Dimension SOLID & Rubric Evaluation)** | **✅ Versioned attempt & submission history** |

---

## 3. Key Product Gaps Identified
- **Gap 1: Algorithmic Grading Cannot Assess Design**: Standard unit test runners check if `calculateFee()` returns `$10`, but cannot check if `ParkingLot` delegates fee calculation to a `PricingStrategy` interface or directly embeds nested `if-else` blocks.
- **Gap 2: Over-indexing on Visual UML**: Diagramming tools force learners to spend 80% of their time aligning SVG arrows and boxes rather than reasoning about domain contracts, responsibilities, edge cases, and SOLID principles.
- **Gap 3: Black-Box AI Feedback**: Existing generic AI prompts return vague assessments ("Good job, 8/10!") without evidence citations, clear concerns, or concrete suggestions.

---

## 4. Strategic Product Direction for our MVP

1. **Structured Text Submission over Freeform UML**: Provide structured input fields for:
   - Requirements & Assumptions
   - Class List & Responsibilities
   - Relationships & Interfaces
   - Key Design Decisions & Trade-offs
   - Edge Cases & Pseudocode
   This structure enables learners to quickly communicate their design thought process while providing structured inputs for automated rubric evaluation.

2. **Dual-Stage Evaluation Pipeline**:
   - Stage 1: Fast **Deterministic Validation Gate** (checks required fields, minimum completeness, structural rules, duplicate detection).
   - Stage 2: **AI Rubric Evaluator** (scored 1-10 across 8 fixed domain criteria with evidence, concerns, suggestions, and confidence scores).

3. **Immutable Attempt & Submission Lifecycles**:
   - `Attempt` represents the learner's practice session.
   - `Submission` represents an immutable snapshot (Version 1, Version 2, etc.), ensuring previous attempts can be reviewed and compared over time.
