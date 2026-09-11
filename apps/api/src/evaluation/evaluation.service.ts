import { Injectable, Logger } from '@nestjs/common';
import { Evaluator, EvaluatorProblemContext, EvaluatorSubmissionContext, EvaluationResult } from './evaluator.interface';
import { RuleBasedEvaluator } from './rule-based-evaluator.service';
import { AIEvaluator } from './ai-evaluator.service';

@Injectable()
export class EvaluationService {
  private readonly logger = new Logger(EvaluationService.name);

  constructor(
    private readonly ruleBasedEvaluator: RuleBasedEvaluator,
    private readonly aiEvaluator: AIEvaluator
  ) {}

  /**
   * Fast Deterministic Check Gate. Fails fast if submission structure is invalid.
   */
  public performDeterministicValidation(submission: EvaluatorSubmissionContext): void {
    this.ruleBasedEvaluator.validateSubmissionStructure(submission);
  }

  /**
   * Orchestrates evaluation using AIEvaluator if API key is present,
   * falling back smoothly to RuleBasedEvaluator on failure or missing keys.
   */
  public async runEvaluation(
    problem: EvaluatorProblemContext,
    submission: EvaluatorSubmissionContext
  ): Promise<{ result: EvaluationResult; evaluatorUsed: 'AI' | 'RULE_BASED' }> {
    // 1. Perform deterministic structural validation first
    this.performDeterministicValidation(submission);

    const apiKey = process.env.GEMINI_API_KEY || process.env.PALM_API_KEY || process.env.API_KEY;
    const isConfigured = Boolean(apiKey && apiKey.trim().length > 0);

    this.logger.log(`[AI Evaluation] Starting`);
    this.logger.log(`[AI Evaluation] API key configured: ${isConfigured}`);

    if (isConfigured) {
      try {
        this.logger.log(`[AI Evaluation] Model: gemini-3.6-flash`);
        this.logger.log(`[AI Evaluation] Request sent`);
        const result = await this.aiEvaluator.evaluate(problem, submission);
        this.logger.log(`[AI Evaluation] Request succeeded`);
        this.logger.log(`[AI Evaluation] Response parsed successfully`);
        this.logger.log(`[AI Evaluation] Evaluation completed`);
        return { result, evaluatorUsed: 'AI' };
      } catch (error) {
        let safeMsg = error.message || String(error);
        if (apiKey && safeMsg.includes(apiKey)) {
          safeMsg = safeMsg.split(apiKey).join('[REDACTED]');
        }
        this.logger.warn(`[AI Evaluation] Request failed: ${safeMsg}`);
        this.logger.warn(`[AI Evaluation] Falling back to rule-based evaluator`);
      }
    } else {
      this.logger.log('[AI Evaluation] No AI API key found. Using RuleBasedEvaluator offline fallback.');
    }

    // Fallback to deterministic rule-based evaluation
    const result = await this.ruleBasedEvaluator.evaluate(problem, submission);
    return { result, evaluatorUsed: 'RULE_BASED' };
  }
}
