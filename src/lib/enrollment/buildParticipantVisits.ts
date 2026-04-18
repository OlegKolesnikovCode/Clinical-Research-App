import { generateVisitDateUtc } from "@/lib/dates/utc";

type TemplateInput = {
  id: string;
  name: string;
  offsetDays: number;
};

export function buildParticipantVisits(params: {
  participantId: string;
  enrolledAtUtc: Date;
  templates: TemplateInput[];
}) {
  const { participantId, enrolledAtUtc, templates } = params;

  return templates.map((template) => ({
    participantId,
    visitTemplateId: template.id,
    templateName: template.name,
    offsetDaysSnapshot: template.offsetDays,
    scheduledAtUtc: generateVisitDateUtc(enrolledAtUtc, template.offsetDays),
  }));
}