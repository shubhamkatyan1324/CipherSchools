import { describe, it, expect } from 'vitest';
import { RuleBasedEvaluator } from '../src/evaluation/rule-based-evaluator.service';
import { BadRequestException } from '@nestjs/common';

describe('RuleBasedEvaluator', () => {
  const evaluator = new RuleBasedEvaluator();

  const validSubmission = {
    requirements: 'Functional: Multi-level parking lot supporting compact, large, and motorcycle spots. Fee collection on exit.',
    assumptions: 'Single entry and exit point per level; fixed hourly pricing rates.',
    classes: 'ParkingLot, Floor, Spot, Vehicle, CompactSpot, LargeSpot, MotorcycleSpot, Ticket, PaymentSystem.',
    responsibilities: 'ParkingLot owns collection of floors. Spot manages occupancy status. Ticket handles entry timestamping.',
    relationships: 'ParkingLot has-a Floor array. Floor has-a Spot array. Vehicle is-a abstract base class.',
    interfaces: 'interface PricingStrategy { calculateFee(duration, vehicleType): number; }',
    decisions: 'Used Strategy Pattern for pricing algorithms to support peak/off-peak rates without changing code.',
    edgeCases: 'Concurrency locks on spot allocation when two vehicles enter simultaneously; zero availability handling.',
    pseudocode: 'class ParkingLot { allocateSpot(vehicle) { lock.acquire(); ... lock.release(); } }',
  };

  it('should pass deterministic structural validation on complete submissions', () => {
    expect(() => evaluator.validateSubmissionStructure(validSubmission)).not.toThrow();
  });

  it('should fail deterministic validation when required fields are missing or too short', () => {
    const incomplete = {
      ...validSubmission,
      requirements: 'Short', // less than 10 chars
    };

    expect(() => evaluator.validateSubmissionStructure(incomplete)).toThrow(BadRequestException);
  });

  it('should evaluate submission against all 8 rubric criteria', async () => {
    const problem = {
      title: 'Parking Lot',
      description: 'Design a multi-level parking lot',
      requirements: ['Support spots', 'Calculate fees'],
      constraints: ['Thread safe'],
      thinkingPoints: ['Strategy pattern'],
    };

    const result = await evaluator.evaluate(problem, validSubmission);

    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
    expect(result.criteria).toHaveLength(8);
    expect(result.strengths.length).toBeGreaterThan(0);

    const rubricKeys = result.criteria.map((c) => c.criterionKey);
    expect(rubricKeys).toContain('Requirement Understanding');
    expect(rubricKeys).toContain('Class Responsibilities');
    expect(rubricKeys).toContain('Coupling & Cohesion');
    expect(rubricKeys).toContain('Encapsulation & Interfaces');
    expect(rubricKeys).toContain('Abstraction / Design Patterns');
    expect(rubricKeys).toContain('Extensibility');
    expect(rubricKeys).toContain('Edge Cases & Testability');
    expect(rubricKeys).toContain('Quality of Explanation');
  });
});
