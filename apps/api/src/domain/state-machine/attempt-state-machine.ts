import { AttemptStatus } from '../enums/attempt-status.enum';

export class InvalidStateTransitionException extends Error {
  constructor(currentStatus: AttemptStatus, targetStatus: AttemptStatus) {
    super(
      `Invalid state transition: Cannot transition Attempt from ${currentStatus} to ${targetStatus}.`
    );
    this.name = 'InvalidStateTransitionException';
  }
}

export class AttemptStateMachine {
  private static readonly ALLOWED_TRANSITIONS: Record<AttemptStatus, AttemptStatus[]> = {
    [AttemptStatus.IN_PROGRESS]: [AttemptStatus.SUBMITTED],
    [AttemptStatus.SUBMITTED]: [AttemptStatus.EVALUATING],
    [AttemptStatus.EVALUATING]: [AttemptStatus.COMPLETED, AttemptStatus.FAILED],
    [AttemptStatus.COMPLETED]: [], // Terminal state for a given attempt
    [AttemptStatus.FAILED]: [AttemptStatus.EVALUATING], // Retry evaluation
  };

  /**
   * Validates whether a transition from currentStatus to targetStatus is permitted.
   */
  public static canTransition(currentStatus: AttemptStatus, targetStatus: AttemptStatus): boolean {
    const allowed = this.ALLOWED_TRANSITIONS[currentStatus] || [];
    return allowed.includes(targetStatus);
  }

  /**
   * Enforces transition; throws InvalidStateTransitionException if illegal.
   */
  public static validateTransition(currentStatus: AttemptStatus, targetStatus: AttemptStatus): void {
    if (!this.canTransition(currentStatus, targetStatus)) {
      throw new InvalidStateTransitionException(currentStatus, targetStatus);
    }
  }
}
