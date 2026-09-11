import { describe, it, expect } from 'vitest';
import { AttemptStatus } from '../src/domain/enums/attempt-status.enum';
import { AttemptStateMachine, InvalidStateTransitionException } from '../src/domain/state-machine/attempt-state-machine';

describe('AttemptStateMachine', () => {
  it('should allow valid transitions in the attempt lifecycle', () => {
    expect(AttemptStateMachine.canTransition(AttemptStatus.IN_PROGRESS, AttemptStatus.SUBMITTED)).toBe(true);
    expect(AttemptStateMachine.canTransition(AttemptStatus.SUBMITTED, AttemptStatus.EVALUATING)).toBe(true);
    expect(AttemptStateMachine.canTransition(AttemptStatus.EVALUATING, AttemptStatus.COMPLETED)).toBe(true);
    expect(AttemptStateMachine.canTransition(AttemptStatus.EVALUATING, AttemptStatus.FAILED)).toBe(true);
    expect(AttemptStateMachine.canTransition(AttemptStatus.FAILED, AttemptStatus.EVALUATING)).toBe(true);
  });

  it('should disallow invalid transitions', () => {
    // Cannot transition from COMPLETED back to SUBMITTED
    expect(AttemptStateMachine.canTransition(AttemptStatus.COMPLETED, AttemptStatus.SUBMITTED)).toBe(false);
    expect(AttemptStateMachine.canTransition(AttemptStatus.COMPLETED, AttemptStatus.IN_PROGRESS)).toBe(false);
    // Cannot jump from IN_PROGRESS directly to COMPLETED
    expect(AttemptStateMachine.canTransition(AttemptStatus.IN_PROGRESS, AttemptStatus.COMPLETED)).toBe(false);
  });

  it('should throw InvalidStateTransitionException on invalid transition validation', () => {
    expect(() => {
      AttemptStateMachine.validateTransition(AttemptStatus.COMPLETED, AttemptStatus.SUBMITTED);
    }).toThrow(InvalidStateTransitionException);
  });
});
