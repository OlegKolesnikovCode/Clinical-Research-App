"use client";

import { useMemo, useState } from "react";
import type { EnrollmentSuccess, Site, Study } from "@/lib/types";
import { ErrorBanner } from "@/components/ErrorBanner";

type EnrollmentFormProps = {
  studies: Study[];
  sites: Site[];
  isSubmitting: boolean;
  submitError: { error?: string; steps?: string[] } | null;
  submitSuccess: EnrollmentSuccess | null;
  onSubmit: (payload: {
    studyId: string;
    siteId: string;
    subjectIdentifier: string;
    fullName: string;
    dateOfBirthUtc: string;
    enrolledAtUtc: string;
    demoFailAfterParticipant?: boolean;
  }) => Promise<void>;
};

export function EnrollmentForm({
  studies,
  sites,
  isSubmitting,
  submitError,
  submitSuccess,
  onSubmit,
}: EnrollmentFormProps) {
  const defaultStudyId = studies[0]?.id ?? "";
  const [studyId, setStudyId] = useState(defaultStudyId);
  const [siteId, setSiteId] = useState("");
  const [subjectIdentifier, setSubjectIdentifier] = useState("");
  const [fullName, setFullName] = useState("");
  const [dateOfBirthUtc, setDateOfBirthUtc] = useState("1990-01-01");
  const [enrolledAtUtc, setEnrolledAtUtc] = useState("2026-04-19T09:00");
  const [demoFailAfterParticipant, setDemoFailAfterParticipant] = useState(false);

  const filteredSites = useMemo(
    () => sites.filter((site) => site.studyId === studyId),
    [sites, studyId]
  );

  function dateOnlyToUtcIso(dateValue: string): string | null {
    if (!dateValue) return null;
    const iso = new Date(`${dateValue}T00:00:00.000Z`);
    if (Number.isNaN(iso.getTime())) return null;
    return iso.toISOString();
  }

  function toIsoOrNull(localValue: string): string | null {
    if (!localValue) return null;
    const date = new Date(localValue);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const dobIso = dateOnlyToUtcIso(dateOfBirthUtc);
    const enrolledIso = toIsoOrNull(enrolledAtUtc);

    if (!dobIso || !enrolledIso) {
      return;
    }

    await onSubmit({
      studyId,
      siteId,
      subjectIdentifier,
      fullName,
      dateOfBirthUtc: dobIso,
      enrolledAtUtc: enrolledIso,
      demoFailAfterParticipant,
    });

    setSubjectIdentifier("");
    setFullName("");
    setDemoFailAfterParticipant(false);
  }

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Enroll participant</h2>
        <p className="mt-1 text-sm text-slate-600">
          Thin UI over the real enrollment transaction.
        </p>
      </div>

      <ErrorBanner error={submitError} />

      {submitSuccess && (
        <div className="rounded-lg border border-green-300 bg-green-50 p-4 text-sm text-green-900">
          <div className="font-semibold">Enrollment succeeded</div>
          <div className="mt-1">
            Participant ID: {submitSuccess.result?.participantId ?? "Returned but not provided"}
          </div>
          {submitSuccess.steps && submitSuccess.steps.length > 0 && (
            <div className="mt-3">
              <div className="font-medium">Transaction steps</div>
              <ul className="ml-5 mt-1 list-disc">
                {submitSuccess.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-slate-700">
          <span className="mb-1 block font-medium">Study</span>
          <select
            className="w-full rounded border border-slate-300 p-2"
            value={studyId}
            onChange={(e) => {
              const nextStudyId = e.target.value;
              setStudyId(nextStudyId);
              setSiteId("");
            }}
            required
          >
            <option value="" disabled>
              Select a study
            </option>
            {studies.map((study) => (
              <option key={study.id} value={study.id}>
                {study.name} — {study.protocolCode}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm text-slate-700">
          <span className="mb-1 block font-medium">Site</span>
          <select
            className="w-full rounded border border-slate-300 p-2"
            value={siteId}
            onChange={(e) => setSiteId(e.target.value)}
            required
          >
            <option value="" disabled>
              Select a site
            </option>
            {filteredSites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name} — {site.location}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm text-slate-700">
          <span className="mb-1 block font-medium">Subject identifier</span>
          <input
            className="w-full rounded border border-slate-300 p-2"
            value={subjectIdentifier}
            onChange={(e) => setSubjectIdentifier(e.target.value)}
            placeholder="SUBJ-001"
            required
          />
        </label>

        <label className="block text-sm text-slate-700">
          <span className="mb-1 block font-medium">Full name</span>
          <input
            className="w-full rounded border border-slate-300 p-2"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Participant full name"
            required
          />
        </label>

        <label className="block text-sm text-slate-700">
          <span className="mb-1 block font-medium">Date of birth (UTC date)</span>
          <input
            type="date"
            className="w-full rounded border border-slate-300 p-2"
            value={dateOfBirthUtc}
            onChange={(e) => setDateOfBirthUtc(e.target.value)}
            required
          />
        </label>

        <label className="block text-sm text-slate-700">
          <span className="mb-1 block font-medium">Enrollment time</span>
          <input
            type="datetime-local"
            className="w-full rounded border border-slate-300 p-2"
            value={enrolledAtUtc}
            onChange={(e) => setEnrolledAtUtc(e.target.value)}
            required
          />
        </label>

        <label className="md:col-span-2 flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={demoFailAfterParticipant}
            onChange={(e) => setDemoFailAfterParticipant(e.target.checked)}
          />
          Trigger rollback demo after participant creation
        </label>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={isSubmitting || !studyId || !siteId}
            className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
          >
            {isSubmitting ? "Submitting..." : "Enroll participant"}
          </button>
        </div>
      </form>
    </section>
  );
}
