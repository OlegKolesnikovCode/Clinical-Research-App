import { formatUtc } from "@/lib/format";
import type { Participant } from "@/lib/types";

type ParticipantTableProps = {
  participants: Participant[];
  selectedParticipantId: string | null;
  onSelect: (participantId: string) => void;
};

export function ParticipantTable({
  participants,
  selectedParticipantId,
  onSelect,
}: ParticipantTableProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-slate-900">Participants</h2>
        <p className="mt-1 text-sm text-slate-600">
          Server-authoritative list of enrolled participants.
        </p>
      </div>

      {participants.length === 0 ? (
        <div className="text-sm text-slate-500">No participants found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-600">
                <th className="py-2 pr-4">Subject</th>
                <th className="py-2 pr-4">Full name</th>
                <th className="py-2 pr-4">Site</th>
                <th className="py-2 pr-4">Enrolled</th>
                <th className="py-2 pr-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((participant) => {
                const selected = participant.id === selectedParticipantId;

                return (
                  <tr
                    key={participant.id}
                    className={selected ? "bg-slate-50" : "border-t border-slate-100"}
                  >
                    <td className="py-3 pr-4 font-medium text-slate-900">
                      {participant.subjectIdentifier}
                    </td>
                    <td className="py-3 pr-4 text-slate-700">{participant.fullName}</td>
                    <td className="py-3 pr-4 text-slate-700">
                      {participant.site?.name ?? participant.siteId}
                    </td>
                    <td className="py-3 pr-4 text-slate-700">
                      {formatUtc(participant.enrolledAtUtc)}
                    </td>
                    <td className="py-3 pr-4">
                      <button
                        className="rounded border border-slate-300 px-3 py-1 text-slate-700"
                        onClick={() => onSelect(participant.id)}
                      >
                        {selected ? "Selected" : "View visits"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
