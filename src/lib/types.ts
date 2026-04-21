export type Study = {
  id: string;
  name: string;
  protocolCode: string;
  startDateUtc: string;
};

export type Site = {
  id: string;
  studyId: string;
  name: string;
  location: string;
};

export type Participant = {
  id: string;
  studyId: string;
  siteId: string;
  subjectIdentifier: string;
  fullName: string;
  dateOfBirthUtc: string;
  enrolledAtUtc: string;
  createdAt: string;
  updatedAt: string;
  site?: {
    id: string;
    name: string;
    location: string;
  };
};

export type VisitStatus = "SCHEDULED" | "COMPLETED" | "MISSED" | "CANCELLED";

export type Visit = {
  id: string;
  participantId: string;
  visitTemplateId: string | null;
  templateName: string;
  offsetDaysSnapshot: number;
  scheduledAtUtc: string;
  status: VisitStatus;
  completedAtUtc: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EnrollmentSuccess = {
  result?: {
    participantId?: string;
  };
  steps?: string[];
};

export type ApiError = {
  error?: string;
  details?: unknown;
  issues?: unknown;
  steps?: string[];
  current?: string;
  attempted?: string;
  allowed?: string[];
};
