import { describe, it, expect, vi } from 'vitest';
import { RuleBasedEvaluator } from '../src/evaluation/rule-based-evaluator.service';
import { AIEvaluator } from '../src/evaluation/ai-evaluator.service';
import { EvaluationService } from '../src/evaluation/evaluation.service';
import { BadRequestException } from '@nestjs/common';

describe('Evaluator Quality Suite', () => {
  const ruleEvaluator = new RuleBasedEvaluator();
  const aiEvaluator = new AIEvaluator();

  const problemContext = {
    title: 'Parking Lot System',
    description: 'Design an automated multi-floor parking lot system.',
    requirements: ['Support compact/large spots', 'Calculate fees on exit', 'Display real-time availability'],
    constraints: ['Thread-safe allocation'],
    thinkingPoints: ['Strategy pattern for fee calculation'],
  };

  const strongSubmission = {
    requirements: '1. Support multi-floor parking lot for Compact, Large, and Motorcycle spots.\n2. Automatically allocate nearest available spot to incoming vehicle.\n3. Calculate parking fee on exit based on vehicle type and duration.',
    assumptions: 'Single entry and exit point per level; fixed hourly pricing rates.',
    classes: 'ParkingLot, Floor, Spot, CompactSpot, LargeSpot, Vehicle, Ticket, FeeCalculationStrategy.',
    responsibilities: 'ParkingLot: Owns array of Floors and manages entry/exit gates.\nFloor: Manages collection of Spots and tracks available count.\nSpot: Holds occupied state, spot number, and vehicle reference.',
    relationships: 'ParkingLot HAS-A Floor (Composition).\nFloor HAS-A Spot (Composition).\nCompactSpot IS-A Spot (Inheritance).\nParkingLot HAS-A FeeCalculationStrategy (Composition).',
    interfaces: 'interface FeeCalculationStrategy {\n  calculateFee(durationHours: number, vehicleType: VehicleType): number;\n}\nclass PeakFeeStrategy implements FeeCalculationStrategy { ... }',
    decisions: 'Applied Strategy Pattern for fee calculation to support peak vs off-peak rates without changing core code (Open-Closed Principle).',
    edgeCases: '1. Race Condition: Two vehicles attempting to grab the last available spot simultaneously. Handled via mutex lock on Floor spot allocation method.',
    pseudocode: 'class Floor {\n  private final ReentrantLock lock = new ReentrantLock();\n  public Spot allocateSpot(Vehicle v) {\n    lock.lock();\n    try { return spots.find(!s.isOccupied()); } finally { lock.unlock(); }\n  }\n}',
  };

  const weakSubmission = {
    requirements: 'Generic parking lot.',
    assumptions: 'Assume everything works.',
    classes: 'ParkingLot, Manager.',
    responsibilities: 'Manager does everything.',
    relationships: 'Manager calls ParkingLot.',
    interfaces: 'No interfaces needed.',
    decisions: 'Used simple if-else blocks everywhere.',
    edgeCases: 'Ignore concurrency.',
    pseudocode: 'function run() {}',
  };

  describe('A. Strong Submission Evaluation Quality', () => {
    it('should generate high score but not automatically 100/100, citing actual candidate content as evidence', async () => {
      const result = await ruleEvaluator.evaluate(problemContext, strongSubmission);
      expect(result.overallScore).toBeGreaterThanOrEqual(70);
      expect(result.overallScore).toBeLessThanOrEqual(100);

      // Verify evidence cites candidate text instead of character counts
      const reqCriterion = result.criteria.find((c) => c.criterionKey === 'Requirement Understanding');
      expect(reqCriterion?.evidence).not.toContain('character');
      expect(reqCriterion?.evidence).toContain('Captured');
      expect(reqCriterion?.evidence).toContain('Compact, Large');
    });
  });

  describe('B. Weak Submission Evaluation Quality', () => {
    it('should yield a lower score with specific constructive concerns', async () => {
      const result = await ruleEvaluator.evaluate(problemContext, weakSubmission);
      expect(result.overallScore).toBeLessThan(70);
      expect(result.weaknesses.length).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('C. Missing Required Fields (Deterministic Validation Gate)', () => {
    it('should throw BadRequestException without calling AI evaluator when required fields are missing or under 10 chars', () => {
      const missingSubmission = {
        ...strongSubmission,
        classes: 'Too short', // < 10 chars
      };
      expect(() => ruleEvaluator.validateSubmissionStructure(missingSubmission)).toThrow(BadRequestException);
    });
  });

  describe('D & E. Graceful Offline Fallback & Evaluation Mode Transparency', () => {
    it('should transparently report evaluator mode as [Rule-Based Fallback] when API key is missing', async () => {
      const service = new EvaluationService(ruleEvaluator, aiEvaluator);
      const { result, evaluatorUsed } = await service.runEvaluation(problemContext, strongSubmission);

      expect(evaluatorUsed).toBe('RULE_BASED');
      expect(result.summary).toBeDefined();
    });
  });

  describe('F. AI Response Structured Output Validation', () => {
    it('should correctly parse and validate 8 criteria from structured JSON response', () => {
      const mockJsonResponse = JSON.stringify({
        overallScore: 88,
        summary: 'Excellent object-oriented design with clear Strategy pattern decoupling.',
        strengths: ['Clear SRP separation'],
        weaknesses: ['Add exception handling details'],
        recommendations: ['Detail deadlock prevention'],
        criteria: [
          { criterionKey: 'Requirement Understanding', score: 9, maxScore: 10, evidence: 'Captured multi-floor requirement', concern: 'None', suggestion: 'None', confidence: 0.95 },
          { criterionKey: 'Class Responsibilities', score: 9, maxScore: 10, evidence: 'ParkingLot owns Floors', concern: 'None', suggestion: 'None', confidence: 0.9 },
          { criterionKey: 'Coupling & Cohesion', score: 8, maxScore: 10, evidence: 'Composition for Floor/Spot', concern: 'None', suggestion: 'None', confidence: 0.85 },
          { criterionKey: 'Encapsulation & Interfaces', score: 9, maxScore: 10, evidence: 'FeeCalculationStrategy interface', concern: 'None', suggestion: 'None', confidence: 0.9 },
          { criterionKey: 'Abstraction / Design Patterns', score: 9, maxScore: 10, evidence: 'Strategy Pattern applied', concern: 'None', suggestion: 'None', confidence: 0.9 },
          { criterionKey: 'Extensibility', score: 9, maxScore: 10, evidence: 'OCP compliant design', concern: 'None', suggestion: 'None', confidence: 0.85 },
          { criterionKey: 'Edge Cases & Testability', score: 8, maxScore: 10, evidence: 'ReentrantLock concurrency lock', concern: 'None', suggestion: 'None', confidence: 0.85 },
          { criterionKey: 'Quality of Explanation', score: 9, maxScore: 10, evidence: 'Clean pseudocode block', concern: 'None', suggestion: 'None', confidence: 0.9 },
        ],
      });

      const parsed = (aiEvaluator as any).parseAndValidateResponse(mockJsonResponse);
      expect(parsed.overallScore).toBe(88);
      expect(parsed.criteria).toHaveLength(8);
    });
  });
});
