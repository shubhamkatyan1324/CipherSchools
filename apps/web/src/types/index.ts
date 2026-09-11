export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type AttemptStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'EVALUATING' | 'COMPLETED' | 'FAILED';

export interface Problem {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  description: string;
  requirements: string[];
  constraints: string[];
  thinkingPoints: string[];
}

export interface EvaluationCriterion {
  id: string;
  criterionKey: string;
  score: number;
  maxScore: number;
  evidence: string;
  concern: string;
  suggestion: string;
  confidence: number;
}

export interface Evaluation {
  id: string;
  overallScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  createdAt: string;
  criteria: EvaluationCriterion[];
}

export interface Submission {
  id: string;
  version: number;
  requirements: string;
  assumptions: string;
  classes: string;
  responsibilities: string;
  relationships: string;
  interfaces: string;
  decisions: string;
  edgeCases: string;
  pseudocode: string;
  createdAt: string;
  evaluation?: Evaluation | null;
}

export interface Attempt {
  id: string;
  problemId: string;
  status: AttemptStatus;
  createdAt: string;
  updatedAt: string;
  problem?: Problem | null;
  submissions: Submission[];
  latestSubmission?: Submission | null;
}

export interface CreateSubmissionPayload {
  requirements: string;
  assumptions: string;
  classes: string;
  responsibilities: string;
  relationships: string;
  interfaces: string;
  decisions: string;
  edgeCases: string;
  pseudocode?: string;
}
