import type { Visit, VisitStatus } from "@/lib/types";

const TERMINAL_STATUSES: VisitStatus[] = ["COMPLETED", "MISSED", "CANCELLED"];
const NEXT_STATUSES: VisitStatus[] = ["COMPLETED", "MISSED", "CANCELLED"];

export function VisitStatusControl({
  visit,
  isUpdating,
  onUpdate,
}: {
  visit: Visit;
  isUpdating: boolean;
  onUpdate: (visitId: string, status: VisitStatus) => Promise<void>;
}) {
  const isTerminal = TERMINAL_STATUSES.includes(visit.status);

  if (isTerminal) {
    return <span className="text-xs font-medium text-slate-500">Terminal state</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {NEXT_STATUSES.map((status) => (
        <button
          key={status}
          className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700 disabled:opacity-50"
          disabled={isUpdating}
          onClick={() => onUpdate(visit.id, status)}
        >
          {isUpdating ? "Updating..." : status}
        </button>
      ))}
    </div>
  );
}
