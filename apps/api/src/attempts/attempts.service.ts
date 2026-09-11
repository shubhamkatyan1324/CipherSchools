import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttemptStatus } from '../domain/enums/attempt-status.enum';
import { AttemptStateMachine } from '../domain/state-machine/attempt-state-machine';
import { EvaluationService } from '../evaluation/evaluation.service';
import { CreateSubmissionDto } from '../submissions/dto/create-submission.dto';

@Injectable()
export class AttemptsService {
  private readonly logger = new Logger(AttemptsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly evaluationService: EvaluationService
  ) {}

  /**
   * Start a new practice attempt for a problem.
   */
  async createAttempt(problemSlug: string) {
    const problem = await this.prisma.problem.findUnique({
      where: { slug: problemSlug },
    });

    if (!problem) {
      throw new NotFoundException(`Problem "${problemSlug}" not found.`);
    }

    const attempt = await this.prisma.attempt.create({
      data: {
        problemId: problem.id,
        status: AttemptStatus.IN_PROGRESS,
      },
      include: {
        problem: true,
        submissions: true,
      },
    });

    return this.formatAttemptResponse(attempt);
  }

  /**
   * Fetch an attempt by ID with full submission and evaluation context.
   */
  async getAttempt(id: string) {
    const attempt = await this.prisma.attempt.findUnique({
      where: { id },
      include: {
        problem: true,
        submissions: {
          orderBy: { version: 'asc' },
          include: {
            evaluation: {
              include: {
                criteria: true,
              },
            },
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException(`Attempt with ID "${id}" not found.`);
    }

    return this.formatAttemptResponse(attempt);
  }

  /**
   * List attempt history for a specific problem.
   */
  async getAttemptsByProblem(problemSlug: string) {
    const problem = await this.prisma.problem.findUnique({
      where: { slug: problemSlug },
    });

    if (!problem) {
      throw new NotFoundException(`Problem "${problemSlug}" not found.`);
    }

    const attempts = await this.prisma.attempt.findMany({
      where: { problemId: problem.id },
      orderBy: { createdAt: 'desc' },
      include: {
        submissions: {
          orderBy: { version: 'desc' },
          take: 1,
          include: {
            evaluation: {
              include: {
                criteria: true,
              },
            },
          },
        },
      },
    });

    return attempts.map((attempt) => this.formatAttemptResponse(attempt));
  }

  /**
   * Submit design solution, execute deterministic check, persist submission, and evaluate.
   */
  async submitSolution(attemptId: string, dto: CreateSubmissionDto) {
    const attempt = await this.prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        problem: true,
        submissions: true,
      },
    });

    if (!attempt) {
      throw new NotFoundException(`Attempt with ID "${attemptId}" not found.`);
    }

    const currentStatus = attempt.status as AttemptStatus;

    // 1. Enforce strict domain state machine validation
    AttemptStateMachine.validateTransition(currentStatus, AttemptStatus.SUBMITTED);

    // 2. Perform deterministic structural validation gate
    const submissionPayload = {
      requirements: dto.requirements,
      assumptions: dto.assumptions,
      classes: dto.classes,
      responsibilities: dto.responsibilities,
      relationships: dto.relationships,
      interfaces: dto.interfaces,
      decisions: dto.decisions,
      edgeCases: dto.edgeCases,
      pseudocode: dto.pseudocode || '',
    };

    this.evaluationService.performDeterministicValidation(submissionPayload);

    // 3. Increment submission version snapshot
    const version = attempt.submissions.length + 1;

    // 4. PERSIST SUBMISSION FIRST before evaluation starts
    const submission = await this.prisma.submission.create({
      data: {
        attemptId: attempt.id,
        version,
        ...submissionPayload,
      },
    });

    // 5. Update attempt status to EVALUATING
    await this.prisma.attempt.update({
      where: { id: attempt.id },
      data: { status: AttemptStatus.EVALUATING },
    });

    // Parse problem requirements context
    const problemContext = {
      title: attempt.problem.title,
      description: attempt.problem.description,
      requirements: JSON.parse(attempt.problem.requirements || '[]'),
      constraints: JSON.parse(attempt.problem.constraints || '[]'),
      thinkingPoints: JSON.parse(attempt.problem.thinkingPoints || '[]'),
    };

    try {
      // 6. Run Evaluation Strategy (AI with fallback to RuleBased)
      const { result, evaluatorUsed } = await this.evaluationService.runEvaluation(
        problemContext,
        submissionPayload
      );

      // 7. Persist Evaluation and Criteria in DB
      const evalBadge = evaluatorUsed === 'AI' ? '[AI Evaluated]' : '[Evaluation]';
      const summaryText = result.summary.replace(/^Rule-Based Evaluation:/, 'Evaluation:');
      const evaluation = await this.prisma.evaluation.create({
        data: {
          submissionId: submission.id,
          overallScore: result.overallScore,
          summary: `${evalBadge} ${summaryText}`,
          strengths: JSON.stringify(result.strengths),
          weaknesses: JSON.stringify(result.weaknesses),
          recommendations: JSON.stringify(result.recommendations),
          criteria: {
            create: result.criteria.map((c) => ({
              criterionKey: String(c.criterionKey),
              score: c.score,
              maxScore: c.maxScore || 10,
              evidence: c.evidence,
              concern: c.concern,
              suggestion: c.suggestion,
              confidence: c.confidence || 0.85,
            })),
          },
        },
        include: {
          criteria: true,
        },
      });

      // 8. Transition attempt state to COMPLETED
      await this.prisma.attempt.update({
        where: { id: attempt.id },
        data: { status: AttemptStatus.COMPLETED },
      });

      this.logger.log(`Attempt ${attempt.id} evaluation completed. Score: ${result.overallScore}`);

      return this.getAttempt(attempt.id);
    } catch (error) {
      this.logger.error(`Evaluation failed for attempt ${attempt.id}: ${error.message}`);

      // Evaluation failure transitions attempt to FAILED, but submission is preserved!
      await this.prisma.attempt.update({
        where: { id: attempt.id },
        data: { status: AttemptStatus.FAILED },
      });

      throw new BadRequestException(
        `Evaluation failed: ${error.message}. Your submission has been saved safely.`
      );
    }
  }

  private formatAttemptResponse(attempt: any) {
    const parsedProblem = attempt.problem
      ? {
          id: attempt.problem.id,
          slug: attempt.problem.slug,
          title: attempt.problem.title,
          difficulty: attempt.problem.difficulty,
          description: attempt.problem.description,
          requirements: JSON.parse(attempt.problem.requirements || '[]'),
          constraints: JSON.parse(attempt.problem.constraints || '[]'),
          thinkingPoints: JSON.parse(attempt.problem.thinkingPoints || '[]'),
        }
      : null;

    const formattedSubmissions = (attempt.submissions || []).map((sub: any) => {
      const evaluation = sub.evaluation
        ? {
            id: sub.evaluation.id,
            overallScore: sub.evaluation.overallScore,
            summary: sub.evaluation.summary,
            strengths: JSON.parse(sub.evaluation.strengths || '[]'),
            weaknesses: JSON.parse(sub.evaluation.weaknesses || '[]'),
            recommendations: JSON.parse(sub.evaluation.recommendations || '[]'),
            createdAt: sub.evaluation.createdAt,
            criteria: (sub.evaluation.criteria || []).map((c: any) => ({
              id: c.id,
              criterionKey: c.criterionKey,
              score: c.score,
              maxScore: c.maxScore,
              evidence: c.evidence,
              concern: c.concern,
              suggestion: c.suggestion,
              confidence: c.confidence,
            })),
          }
        : null;

      return {
        id: sub.id,
        version: sub.version,
        requirements: sub.requirements,
        assumptions: sub.assumptions,
        classes: sub.classes,
        responsibilities: sub.responsibilities,
        relationships: sub.relationships,
        interfaces: sub.interfaces,
        decisions: sub.decisions,
        edgeCases: sub.edgeCases,
        pseudocode: sub.pseudocode,
        createdAt: sub.createdAt,
        evaluation,
      };
    });

    const latestSubmission = formattedSubmissions[formattedSubmissions.length - 1] || null;

    return {
      id: attempt.id,
      problemId: attempt.problemId,
      status: attempt.status,
      createdAt: attempt.createdAt,
      updatedAt: attempt.updatedAt,
      problem: parsedProblem,
      submissions: formattedSubmissions,
      latestSubmission,
    };
  }
}
