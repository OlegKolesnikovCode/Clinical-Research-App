//Only this file should construct visit schedule timestamps

export function toUtcFixedHour(date: Date, hour = 9): Date {
  const d = new Date(date);
  d.setUTCHours(hour, 0, 0, 0);
  return d;
}

export function addDaysUtc(base: Date, days: number): Date {
  const d = new Date(base);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}


// IMPORTANT:This function enables deterministic scheduling—but the invariant only holds if it is the only way time is constructed in the system.
// Normalizes scheduling by converting arbitrary timestamps into
// deterministic UTC dates at a fixed hour (09:00 UTC).
// This function is the single source of truth for visit scheduling
// and must be used everywhere to preserve system-wide time invariants.
export function buildVisitDate(base: Date, offsetDays: number): Date {
  const shifted = addDaysUtc(base, offsetDays);
  return toUtcFixedHour(shifted, 9);
}