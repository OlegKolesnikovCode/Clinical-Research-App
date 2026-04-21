export function formatUtc(dateValue: string | null | undefined): string {
  if (!dateValue) return "—";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Invalid date";

  return `${date.toLocaleString()} (${date.toISOString()})`;
}
