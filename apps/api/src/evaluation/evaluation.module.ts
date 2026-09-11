import { Module } from '@nestjs/common';
import { EvaluationService } from './evaluation.service';
import { RuleBasedEvaluator } from './rule-based-evaluator.service';
import { AIEvaluator } from './ai-evaluator.service';

@Module({
  providers: [RuleBasedEvaluator, AIEvaluator, EvaluationService],
  exports: [EvaluationService],
})
export class EvaluationModule {}
