import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  Evaluator,
  EvaluatorProblemContext,
  EvaluatorSubmissionContext,
  EvaluationResult,
  CriterionEvaluationResult,
} from './evaluator.interface';
import { RubricCriterion } from '../domain/enums/rubric-criterion.enum';

@Injectable()
export class AIEvaluator implements Evaluator {
  private readonly logger = new Logger(AIEvaluator.name);

  public async evaluate(
    problem: EvaluatorProblemContext,
    submission: EvaluatorSubmissionContext
  ): Promise<EvaluationResult> {
    const apiKey = process.env.GEMINI_API_KEY || process.env.PALM_API_KEY || process.env.API_KEY;

    if (!apiKey) {
      throw new Error('AI API key is not configured in environment variables.');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.6-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const prompt = this.buildPrompt(problem, submission);

    this.logger.log(`Invoking Gemini AI Evaluator for problem "${problem.title}"...`);

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    if (!responseText) {
      throw new Error('Received empty response from Gemini AI Evaluator.');
    }

    return this.parseAndValidateResponse(responseText);
  }

  private buildPrompt(
    problem: EvaluatorProblemContext,
    submission: EvaluatorSubmissionContext
  ): string {
    return `You are a Principal Software Architect and Lead LLD Interviewer evaluating a candidate's Low-Level Design (LLD) submission.

PROBLEM SPECIFICATION:
Title: ${problem.title}
Description: ${problem.description}
Requirements: ${JSON.stringify(problem.requirements)}
Constraints: ${JSON.stringify(problem.constraints)}
Expected Areas to Think About: ${JSON.stringify(problem.thinkingPoints)}

CANDIDATE SUBMISSION:
1. Requirements Understood: ${submission.requirements}
2. Assumptions & Scope: ${submission.assumptions}
3. Classes & Entities: ${submission.classes}
4. Responsibilities: ${submission.responsibilities}
5. Relationships & Dependencies: ${submission.relationships}
6. Interfaces & Abstractions: ${submission.interfaces}
7. Key Design Decisions & Trade-offs: ${submission.decisions}
8. Edge Cases & Concurrency: ${submission.edgeCases}
9. Pseudocode / Code Snippets: ${submission.pseudocode}

EVALUATION RUBRIC:
You MUST evaluate the submission across PRECISELY these 8 criteria:
1. "${RubricCriterion.REQUIREMENT_UNDERSTANDING}"
2. "${RubricCriterion.CLASS_RESPONSIBILITIES}"
3. "${RubricCriterion.COUPLING_AND_COHESION}"
4. "${RubricCriterion.ENCAPSULATION_AND_INTERFACES}"
5. "${RubricCriterion.ABSTRACTION_AND_PATTERNS}"
6. "${RubricCriterion.EXTENSIBILITY}"
7. "${RubricCriterion.EDGE_CASES_AND_TESTABILITY}"
8. "${RubricCriterion.QUALITY_OF_EXPLANATION}"

CRITICAL EVALUATION RULES:
1. NEVER cite submission character count or length as evidence (e.g. "Learner provided 800 characters").
2. Evidence MUST quote or reference specific classes, interfaces, relationships, patterns, or decisions from the candidate submission.
3. Evaluate whether design patterns (Strategy, State, Factory, etc.) are actually appropriate and justified, not just named.
4. Recommend composition over inheritance ONLY if the candidate's design provides a concrete reason for it.
5. Evaluate semantic coverage of requirements rather than length.
6. Assess whether explanations justify WHY classes exist, WHY responsibilities are assigned, and WHAT trade-offs were considered.

JSON OUTPUT FORMAT REQUIREMENT:
Respond ONLY with a valid JSON object matching this exact schema:
{
  "overallScore": number (0 to 100),
  "summary": "High level evaluation summary",
  "strengths": ["string", ...],
  "weaknesses": ["string", ...],
  "recommendations": ["string", ...],
  "criteria": [
    {
      "criterionKey": "Requirement Understanding",
      "score": number (0 to 10),
      "maxScore": 10,
      "evidence": "Direct quote or specific design element from candidate's text explaining WHAT was done",
      "concern": "Specific weakness or design concern",
      "suggestion": "Actionable feedback to improve this aspect",
      "confidence": number (0.0 to 1.0)
    },
    ... (MUST contain all 8 criteria listed above)
  ]
}

Make sure to cite exact evidence from the candidate submission. Scores must be objective and fair.`;
  }

  private parseAndValidateResponse(jsonString: string): EvaluationResult {
    let raw: any;
    try {
      raw = JSON.parse(jsonString);
    } catch (err) {
      this.logger.error(`Failed to parse AI JSON response: ${jsonString}`);
      throw new Error(`Malformed JSON returned by AI evaluator: ${err.message}`);
    }

    if (
      typeof raw.overallScore !== 'number' ||
      !Array.isArray(raw.criteria) ||
      raw.criteria.length === 0
    ) {
      throw new Error('AI Evaluator response missing required top-level JSON structure.');
    }

    const validatedCriteria: CriterionEvaluationResult[] = raw.criteria.map((c: any) => {
      const score = Math.max(0, Math.min(10, Number(c.score) || 0));
      return {
        criterionKey: c.criterionKey || 'Unknown Criterion',
        score,
        maxScore: 10,
        evidence: c.evidence || 'No evidence provided.',
        concern: c.concern || 'None.',
        suggestion: c.suggestion || 'No suggestion provided.',
        confidence: Math.max(0.0, Math.min(1.0, Number(c.confidence) || 0.85)),
      };
    });

    return {
      overallScore: Math.max(0, Math.min(100, Number(raw.overallScore) || 0)),
      summary: raw.summary || 'AI Evaluation completed successfully.',
      strengths: Array.isArray(raw.strengths) ? raw.strengths : [],
      weaknesses: Array.isArray(raw.weaknesses) ? raw.weaknesses : [],
      recommendations: Array.isArray(raw.recommendations) ? raw.recommendations : [],
      criteria: validatedCriteria,
    };
  }
}
