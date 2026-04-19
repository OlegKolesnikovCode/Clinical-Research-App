//only this file should be call  for participant visit generation

import { buildVisitDate } from "@/lib/utils/date";

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
    scheduledAtUtc: buildVisitDate(
      enrolledAtUtc,
      template.offsetDays
    ),
  }));
}