export type VisitStatus =
  | "SCHEDULED"
  | "COMPLETED"
  | "MISSED"
  | "CANCELLED";

export const TERMINAL_STATES: VisitStatus[] = [
  "COMPLETED",
  "MISSED",
  "CANCELLED",
];

export function canTransition(
  current: VisitStatus,
  next: VisitStatus
): boolean {
  // Same-state update is allowed as an idempotent no-op
  if (current === next) {
    return true;
  }

  // Terminal states cannot transition to anything else
  if (TERMINAL_STATES.includes(current)) {
    return false;
  }

  // Only SCHEDULED can move to a terminal state
  if (current === "SCHEDULED") {
    return (
      next === "COMPLETED" ||
      next === "MISSED" ||
      next === "CANCELLED"
    );
  }

  return false;
}

export function assertTransition(
  current: VisitStatus,
  next: VisitStatus
): void {
  if (!canTransition(current, next)) {
    throw new Error(`Invalid transition: ${current} -> ${next}`);
  }
}