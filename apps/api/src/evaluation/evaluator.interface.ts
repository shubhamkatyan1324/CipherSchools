import { RubricCriterion } from '../domain/enums/rubric-criterion.enum';

export interface CriterionEvaluationResult {
  criterionKey: RubricCriterion | string;
  score: number; // 0 to 10
  maxScore: number; // default 10
  evidence: string;
  concern: string;
  suggestion: string;
  confidence: number; // 0.0 to 1.0
}

export interface EvaluationResult {
  overallScore: number; // 0 to 100
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  criteria: CriterionEvaluationResult[];
}

export interface EvaluatorProblemContext {
  title: string;
  description: string;
  requirements: string[];
  constraints: string[];
  thinkingPoints: string[];
}

export interface EvaluatorSubmissionContext {
  requirements: string;
  assumptions: string;
  classes: string;
  responsibilities: string;
  relationships: string;
  interfaces: string;
  decisions: string;
  edgeCases: string;
  pseudocode: string;
}

export interface Evaluator {
  evaluate(
    problem: EvaluatorProblemContext,
    submission: EvaluatorSubmissionContext
  ): Promise<EvaluationResult>;
}
