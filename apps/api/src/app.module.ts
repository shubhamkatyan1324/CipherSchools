import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ProblemsModule } from './problems/problems.module';
import { EvaluationModule } from './evaluation/evaluation.module';
import { AttemptsModule } from './attempts/attempts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'apps/api/.env'],
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    PrismaModule,
    ProblemsModule,
    EvaluationModule,
    AttemptsModule,
  ],
})
export class AppModule {}
