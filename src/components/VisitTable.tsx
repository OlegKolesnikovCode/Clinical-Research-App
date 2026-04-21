import { formatUtc } from "@/lib/format";
import type { ApiError, Visit, VisitStatus } from "@/lib/types";
import { ErrorBanner } from "@/components/ErrorBanner";
import { VisitStatusControl } from "@/components/VisitStatusControl";

type VisitTableProps = {
  participantName: string | null;
  visits: Visit[];
  error: ApiError | null;
  updatingVisitId: string | null;
  onUpdateStatus: (visitId: string, status: VisitStatus) => Promise<void>;
};

export function VisitTable({
  participantName,
  visits,
  error,
  updatingVisitId,
  onUpdateStatus,
}: VisitTableProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-slate-900">Visits</h2>
        <p className="mt-1 text-sm text-slate-600">
          {participantName ? `Workflow state for ${participantName}.` : "Select a participant to view visits."}
        </p>
      </div>

      <ErrorBanner error={error} />

      {!participantName ? (
        <div className="text-sm text-slate-500">No participant selected.</div>
      ) : visits.length === 0 ? (
        <div className="text-sm text-slate-500">No visits found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-600">
                <th className="py-2 pr-4">Template</th>
                <th className="py-2 pr-4">Offset</th>
                <th className="py-2 pr-4">Scheduled</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Completed</th>
                <th className="py-2 pr-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((visit) => (
                <tr key={visit.id} className="border-t border-slate-100 align-top">
                  <td className="py-3 pr-4 font-medium text-slate-900">{visit.templateName}</td>
                  <td className="py-3 pr-4 text-slate-700">D+{visit.offsetDaysSnapshot}</td>
                  <td className="py-3 pr-4 text-slate-700">{formatUtc(visit.scheduledAtUtc)}</td>
                  <td className="py-3 pr-4 text-slate-700">{visit.status}</td>
                  <td className="py-3 pr-4 text-slate-700">{formatUtc(visit.completedAtUtc)}</td>
                  <td className="py-3 pr-4">
                    <VisitStatusControl
                      visit={visit}
                      isUpdating={updatingVisitId === visit.id}
                      onUpdate={onUpdateStatus}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
