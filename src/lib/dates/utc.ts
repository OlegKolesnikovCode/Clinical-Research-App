export function generateVisitDateUtc(baseDate: Date, offsetDays: number): Date {
  const result = new Date(baseDate);
  result.setUTCDate(result.getUTCDate() + offsetDays);
  result.setUTCHours(9, 0, 0, 0);
  return result;
}