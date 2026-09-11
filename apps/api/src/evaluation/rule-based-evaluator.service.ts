import { Injectable, BadRequestException } from '@nestjs/common';
import {
  Evaluator,
  EvaluatorProblemContext,
  EvaluatorSubmissionContext,
  EvaluationResult,
  CriterionEvaluationResult,
} from './evaluator.interface';
import { RubricCriterion } from '../domain/enums/rubric-criterion.enum';

@Injectable()
export class RuleBasedEvaluator implements Evaluator {
  /**
   * Deterministic Validation Gate: Fails fast on invalid or empty submissions.
   */
  public validateSubmissionStructure(submission: EvaluatorSubmissionContext): void {
    const requiredFields: (keyof EvaluatorSubmissionContext)[] = [
      'requirements',
      'assumptions',
      'classes',
      'responsibilities',
      'relationships',
      'interfaces',
      'decisions',
      'edgeCases',
    ];

    const missingFields = requiredFields.filter(
      (field) => !submission[field] || submission[field].trim().length < 10
    );

    if (missingFields.length > 0) {
      throw new BadRequestException(
        `Submission failed deterministic validation. The following sections must be at least 10 characters: ${missingFields.join(
          ', '
        )}.`
      );
    }
  }

  /**
   * Offline heuristic evaluation across all 8 rubric criteria.
   */
  public async evaluate(
    problem: EvaluatorProblemContext,
    submission: EvaluatorSubmissionContext
  ): Promise<EvaluationResult> {
    this.validateSubmissionStructure(submission);

    const criteriaResults: CriterionEvaluationResult[] = [
      this.evaluateRequirementUnderstanding(submission, problem),
      this.evaluateClassResponsibilities(submission),
      this.evaluateCouplingAndCohesion(submission),
      this.evaluateEncapsulationAndInterfaces(submission),
      this.evaluateAbstractionAndPatterns(submission),
      this.evaluateExtensibility(submission),
      this.evaluateEdgeCasesAndTestability(submission),
      this.evaluateQualityOfExplanation(submission),
    ];

    const totalScore = criteriaResults.reduce((acc, c) => acc + c.score, 0);
    const overallScore = Math.min(100, Math.round((totalScore / 80) * 100));

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    criteriaResults.forEach((c) => {
      if (c.score >= 8) {
        strengths.push(`${c.criterionKey}: ${c.evidence}`);
      } else if (c.score <= 5) {
        weaknesses.push(`${c.criterionKey}: ${c.concern}`);
        recommendations.push(`${c.criterionKey}: ${c.suggestion}`);
      }
    });

    if (strengths.length === 0) {
      strengths.push('Provided structured inputs across all required LLD documentation sections.');
    }
    if (recommendations.length === 0) {
      recommendations.push('Consider elaborating more on concurrency locks and design pattern implementations.');
    }

    return {
      overallScore,
      summary: `Evaluation: Score ${overallScore}/100 based on structural analysis of candidate submission.`,
      strengths,
      weaknesses,
      recommendations,
      criteria: criteriaResults,
    };
  }

  private evaluateRequirementUnderstanding(
    s: EvaluatorSubmissionContext,
    problem: EvaluatorProblemContext
  ): CriterionEvaluationResult {
    const text = (s.requirements + ' ' + s.assumptions).toLowerCase();
    
    // Extract actual quotes from learner's text
    const sampleReq = s.requirements.trim().split('\n')[0] || s.requirements.substring(0, 100);
    
    // Semantic coverage check against problem requirements
    const matchedReqs = problem.requirements.filter((req) => {
      const keywords = req.toLowerCase().split(' ').filter(w => w.length > 3);
      return keywords.some(k => text.includes(k));
    });

    const score = Math.min(10, Math.max(4, 5 + matchedReqs.length * 2));

    return {
      criterionKey: RubricCriterion.REQUIREMENT_UNDERSTANDING,
      score,
      maxScore: 10,
      evidence: `Captured ${matchedReqs.length}/${problem.requirements.length} core requirements. Submission notes: "${sampleReq}"`,
      concern: score < 8 ? `Missed or omitted detailed scope for: ${problem.requirements.filter(r => !matchedReqs.includes(r)).join('; ')}` : 'None.',
      suggestion: 'Explicitly map each functional requirement to a system component or state transition.',
      confidence: 0.9,
    };
  }

  private evaluateClassResponsibilities(s: EvaluatorSubmissionContext): CriterionEvaluationResult {
    const classLines = s.classes.split('\n').filter(l => l.trim().length > 0);
    const respLines = s.responsibilities.split('\n').filter(l => l.trim().length > 0);

    const firstClass = classLines[0] || s.classes.substring(0, 60);
    const sampleResp = respLines[0] || s.responsibilities.substring(0, 100);

    const hasClearMapping = s.responsibilities.includes(':') || s.responsibilities.toLowerCase().includes('manages') || s.responsibilities.toLowerCase().includes('handles');
    const score = hasClearMapping && classLines.length >= 3 ? 8 : 5;

    return {
      criterionKey: RubricCriterion.CLASS_RESPONSIBILITIES,
      score,
      maxScore: 10,
      evidence: `Defined classes (${classLines.length} total) such as "${firstClass}". Assigned responsibility: "${sampleResp}"`,
      concern: !hasClearMapping ? 'Class responsibilities are listed as generic prose without clear mapping to specific entities.' : 'Ensure single responsibility per class.',
      suggestion: 'Structure responsibility mappings explicitly as "ClassName: Specific single responsibility and state owned".',
      confidence: 0.85,
    };
  }

  private evaluateCouplingAndCohesion(s: EvaluatorSubmissionContext): CriterionEvaluationResult {
    const text = s.relationships;
    const relLines = text.split('\n').filter(l => l.trim().length > 0);
    const firstRel = relLines[0] || text.substring(0, 90);

    const lower = text.toLowerCase();
    const hasComposition = lower.includes('has-a') || lower.includes('composition') || lower.includes('contains');
    const hasInheritance = lower.includes('is-a') || lower.includes('extends') || lower.includes('inheritance');
    
    let score = 5;
    if (hasComposition && hasInheritance) score = 9;
    else if (hasComposition || hasInheritance) score = 7;

    return {
      criterionKey: RubricCriterion.COUPLING_AND_COHESION,
      score,
      maxScore: 10,
      evidence: `Specified relationships: "${firstRel}"`,
      concern: !hasComposition ? 'Lacks explicit composition relationships. Check if domain model relies on tight inheritance coupling.' : 'None.',
      suggestion: hasComposition ? 'Maintain low coupling by keeping class dependencies hidden behind interfaces.' : 'Use composition ("HAS-A") for component ownership instead of deep inheritance.',
      confidence: 0.85,
    };
  }

  private evaluateEncapsulationAndInterfaces(s: EvaluatorSubmissionContext): CriterionEvaluationResult {
    const text = s.interfaces;
    const intLines = text.split('\n').filter(l => l.trim().length > 0);
    const sampleInt = intLines[0] || text.substring(0, 90);

    const lower = text.toLowerCase();
    const hasInterface = lower.includes('interface') || lower.includes('abstract class') || lower.includes('implements');
    const score = hasInterface ? 8 : 5;

    return {
      criterionKey: RubricCriterion.ENCAPSULATION_AND_INTERFACES,
      score,
      maxScore: 10,
      evidence: hasInterface ? `Defined contract abstraction: "${sampleInt}"` : `Limited interface abstraction defined in text: "${sampleInt}"`,
      concern: !hasInterface ? 'High coupling to concrete classes rather than interface contracts.' : 'Ensure public interface surface is minimal.',
      suggestion: 'Expose abstract interfaces for any module that may have multiple implementations or pricing/strategy variations.',
      confidence: 0.85,
    };
  }

  private evaluateAbstractionAndPatterns(s: EvaluatorSubmissionContext): CriterionEvaluationResult {
    const combined = (s.decisions + ' ' + s.interfaces + ' ' + s.classes).toLowerCase();
    const patterns = ['strategy', 'factory', 'observer', 'singleton', 'state', 'adapter', 'command', 'builder', 'decorator'];
    const appliedPatterns = patterns.filter((p) => combined.includes(p));

    // Check if pattern is actually justified in decisions
    const hasJustification = s.decisions.length > 50 && appliedPatterns.length > 0;
    const score = appliedPatterns.length >= 2 && hasJustification ? 9 : appliedPatterns.length >= 1 ? 7 : 5;

    const sampleDecision = s.decisions.split('\n')[0] || s.decisions.substring(0, 90);

    return {
      criterionKey: RubricCriterion.ABSTRACTION_AND_PATTERNS,
      score,
      maxScore: 10,
      evidence: appliedPatterns.length > 0
        ? `Applied pattern(s) [${appliedPatterns.join(', ')}]. Rationale provided: "${sampleDecision}"`
        : `No GoF design patterns explicitly integrated in solution text.`,
      concern: appliedPatterns.length === 0 ? 'Missed opportunity to decouple variable behavior using established GoF design patterns.' : 'Verify pattern is appropriately scoped to problem requirements.',
      suggestion: 'Select and justify specific design patterns (e.g. Strategy for replaceable algorithms, State for lifecycle transitions).',
      confidence: 0.9,
    };
  }

  private evaluateExtensibility(s: EvaluatorSubmissionContext): CriterionEvaluationResult {
    const sampleDecision = s.decisions.split('\n')[0] || s.decisions.substring(0, 90);
    const lower = s.decisions.toLowerCase();
    const mentionsOCP = lower.includes('open-closed') || lower.includes('extend') || lower.includes('pluggable') || lower.includes('decouple');
    const score = mentionsOCP ? 9 : s.decisions.length > 100 ? 7 : 5;

    return {
      criterionKey: RubricCriterion.EXTENSIBILITY,
      score,
      maxScore: 10,
      evidence: `Architectural decisions: "${sampleDecision}"`,
      concern: !mentionsOCP ? 'Design does not explicitly detail how new requirements can be added without modifying core code.' : 'None.',
      suggestion: 'Highlight Open-Closed Principle (OCP): detail how new vehicle types or pricing rules can be added by extension.',
      confidence: 0.8,
    };
  }

  private evaluateEdgeCasesAndTestability(s: EvaluatorSubmissionContext): CriterionEvaluationResult {
    const sampleEdge = s.edgeCases.split('\n')[0] || s.edgeCases.substring(0, 90);
    const lower = s.edgeCases.toLowerCase();
    const keywords = ['concurrency', 'lock', 'race condition', 'mutex', 'null', 'exception', 'full', 'empty', 'thread'];
    const matched = keywords.filter((k) => lower.includes(k));
    const score = matched.length >= 2 ? 8 : matched.length === 1 ? 6 : 4;

    return {
      criterionKey: RubricCriterion.EDGE_CASES_AND_TESTABILITY,
      score,
      maxScore: 10,
      evidence: `Edge case & concurrency handling: "${sampleEdge}"`,
      concern: score < 7 ? 'Missing discussion on concurrent race conditions (e.g. simultaneous spot allocation) or system failure states.' : 'Ensure thread locking primitives do not cause deadlocks.',
      suggestion: 'Explicitly explain thread safety locking mechanisms (e.g. ReentrantLock, synchronized blocks) and boundary exception handling.',
      confidence: 0.85,
    };
  }

  private evaluateQualityOfExplanation(s: EvaluatorSubmissionContext): CriterionEvaluationResult {
    const sampleCode = s.pseudocode ? s.pseudocode.split('\n')[0] || s.pseudocode.substring(0, 80) : '';
    const hasRationale = s.decisions.length > 80 && s.responsibilities.length > 80;
    const score = hasRationale && s.pseudocode ? 9 : hasRationale ? 7 : 5;

    return {
      criterionKey: RubricCriterion.QUALITY_OF_EXPLANATION,
      score,
      maxScore: 10,
      evidence: s.pseudocode
        ? `Explained design rationale and included pseudocode implementation snippet: "${sampleCode}"`
        : `Provided structured explanations across required sections without optional pseudocode snippets.`,
      concern: !s.pseudocode ? 'Consider providing a short pseudocode snippet to clarify critical method interaction flow.' : 'None.',
      suggestion: 'Include concise pseudocode demonstrating key concurrency or strategy execution steps.',
      confidence: 0.9,
    };
  }
}
