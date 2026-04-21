"use client";

import { useState } from "react";

type EnrollmentSuccess = {
  result?: {
    participantId?: string;
  };
  steps?: string[];
};

type ErrorResponse = {
  error?: string;
  details?: unknown;
  steps?: string[];
};

export default function Home() {
  const [studyId, setStudyId] = useState("");
  const [siteId, setSiteId] = useState("");
  const [subjectIdentifier, setSubjectIdentifier] = useState("");
  const [fullName, setFullName] = useState("");
  const [dateOfBirthUtc, setDateOfBirthUtc] = useState("1990-01-01");
  const [enrolledAtUtc, setEnrolledAtUtc] = useState("2026-04-19T09:00");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<EnrollmentSuccess | null>(null);
  const [error, setError] = useState<ErrorResponse | null>(null);

  function toIsoOrNull(localValue: string): string | null {
    if (!localValue) return null;
    const d = new Date(localValue);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
  }

  function dateOnlyToUtcIso(dateValue: string): string | null {
    if (!dateValue) return null;
    const iso = new Date(`${dateValue}T00:00:00.000Z`);
    if (Number.isNaN(iso.getTime())) return null;
    return iso.toISOString();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess(null);
    setError(null);

    const dobIso = dateOnlyToUtcIso(dateOfBirthUtc);
    const enrolledIso = toIsoOrNull(enrolledAtUtc);

    if (!dobIso || !enrolledIso) {
      setError({
        error: "Invalid date input",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/participants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studyId,
          siteId,
          subjectIdentifier,
          fullName,
          dateOfBirthUtc: dobIso,
          enrolledAtUtc: enrolledIso,
        }),
      });

      let data: EnrollmentSuccess | ErrorResponse | null = null;

      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        setError(
          data && typeof data === "object"
            ? (data as ErrorResponse)
            : { error: `Request failed with status ${res.status}` }
        );
        return;
      }

      setSuccess((data as EnrollmentSuccess) ?? {});

      setSubjectIdentifier("");
      setFullName("");
    } catch {
      setError({
        error: "Network or server failure",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-8 space-y-8">
      <section>
        <h1 className="text-3xl font-bold mb-2">
          Clinical Research Study Tracker
        </h1>
        <p className="text-sm text-gray-600">
          Enroll a participant using the real API contract.
        </p>
      </section>

      <section className="border rounded-lg p-6 bg-white">
        <h2 className="text-xl font-semibold mb-4">Enroll Participant</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Study ID</label>
            <input
              className="border p-2 w-full rounded"
              placeholder="Enter studyId"
              value={studyId}
              onChange={(e) => setStudyId(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Site ID</label>
            <input
              className="border p-2 w-full rounded"
              placeholder="Enter siteId"
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Subject Identifier
            </label>
            <input
              className="border p-2 w-full rounded"
              placeholder="Example: SUBJ-001"
              value={subjectIdentifier}
              onChange={(e) => setSubjectIdentifier(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              className="border p-2 w-full rounded"
              placeholder="Participant full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Date of Birth (UTC date)
            </label>
            <input
              type="date"
              className="border p-2 w-full rounded"
              value={dateOfBirthUtc}
              onChange={(e) => setDateOfBirthUtc(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Enrollment Time
            </label>
            <input
              type="datetime-local"
              className="border p-2 w-full rounded"
              value={enrolledAtUtc}
              onChange={(e) => setEnrolledAtUtc(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-black text-white px-4 py-2 rounded disabled:opacity-60"
          >
            {isSubmitting ? "Submitting..." : "Enroll Participant"}
          </button>
        </form>
      </section>

      {success && (
        <section className="border border-green-300 bg-green-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-green-800 mb-2">
            Enrollment Succeeded
          </h2>

          <div className="text-sm text-green-900 space-y-2">
            <div>
              <span className="font-medium">Participant ID:</span>{" "}
              {success.result?.participantId ?? "Returned but not provided"}
            </div>

            <div>
              <span className="font-medium">Steps:</span>
              <ul className="list-disc ml-6 mt-1">
                {(success.steps ?? []).map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {error && (
        <section className="border border-red-300 bg-red-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Enrollment Failed
          </h2>

          <div className="text-sm text-red-900 space-y-2">
            <div>
              <span className="font-medium">Error:</span>{" "}
              {error.error ?? "Unknown error"}
            </div>

            {error.steps && error.steps.length > 0 && (
              <div>
                <span className="font-medium">Steps:</span>
                <ul className="list-disc ml-6 mt-1">
                  {error.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </div>
            )}

            {error.details && (
              <pre className="mt-3 p-3 bg-white border rounded overflow-x-auto text-xs">
                {JSON.stringify(error.details, null, 2)}
              </pre>
            )}
          </div>
        </section>
      )}

      <section className="border rounded-lg p-6 bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">Notes</h2>
        <ul className="list-disc ml-6 space-y-1 text-sm text-gray-700">
          <li>This page no longer calls GET /api/participants on load.</li>
          <li>That removes the 405 error from the browser console.</li>
          <li>
            It now matches your real enrollment route instead of the old toy CRUD
            model.
          </li>
        </ul>
      </section>
    </main>
  );
}