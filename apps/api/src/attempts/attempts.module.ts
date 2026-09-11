import { Module } from '@nestjs/common';
import { AttemptsService } from './attempts.service';
import { AttemptsController } from './attempts.controller';
import { EvaluationModule } from '../evaluation/evaluation.module';
import { ProblemsModule } from '../problems/problems.module';

@Module({
  imports: [EvaluationModule, ProblemsModule],
  controllers: [AttemptsController],
  providers: [AttemptsService],
  exports: [AttemptsService],
})
export class AttemptsModule {}
