import type {
  ApiError,
  EnrollmentSuccess,
  Participant,
  Site,
  Study,
  Visit,
  VisitStatus,
} from "@/lib/types";

async function readJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  const data = await readJson<T | ApiError>(res);

  if (!res.ok) {
    throw (data as ApiError) ?? { error: `Request failed with status ${res.status}` };
  }

  return data as T;
}

export function getStudies(): Promise<Study[]> {
  return request<Study[]>("/api/studies");
}

export function getSites(): Promise<Site[]> {
  return request<Site[]>("/api/sites");
}

export function getParticipants(studyId?: string): Promise<{ participants: Participant[] }> {
  const query = studyId ? `?studyId=${encodeURIComponent(studyId)}` : "";
  return request<{ participants: Participant[] }>(`/api/participants${query}`);
}

export function getVisits(participantId: string): Promise<{ visits: Visit[] }> {
  const query = `?participantId=${encodeURIComponent(participantId)}`;
  return request<{ visits: Visit[] }>(`/api/visits${query}`);
}

export function createParticipant(payload: {
  studyId: string;
  siteId: string;
  subjectIdentifier: string;
  fullName: string;
  dateOfBirthUtc: string;
  enrolledAtUtc: string;
  demoFailAfterParticipant?: boolean;
}): Promise<EnrollmentSuccess> {
  return request<EnrollmentSuccess>("/api/participants", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function updateVisitStatus(
  visitId: string,
  status: VisitStatus
): Promise<{ id: string; status: VisitStatus; completedAtUtc: string | null; note?: string }> {
  return request(`/api/visits/${visitId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}
