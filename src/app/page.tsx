"use client";

import { useEffect, useMemo, useState } from "react";
import { EnrollmentForm } from "@/components/EnrollmentForm";
import { LoadingBlock } from "@/components/LoadingBlock";
import { ParticipantTable } from "@/components/ParticipantTable";
import { VisitTable } from "@/components/VisitTable";
import {
  createParticipant,
  getParticipants,
  getSites,
  getStudies,
  getVisits,
  updateVisitStatus,
} from "@/lib/api";
import type {
  ApiError,
  EnrollmentSuccess,
  Participant,
  Site,
  Study,
  Visit,
  VisitStatus,
} from "@/lib/types";

export default function Home() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);

  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [bootstrapError, setBootstrapError] = useState<ApiError | null>(null);
  const [participantError, setParticipantError] = useState<ApiError | null>(null);
  const [visitError, setVisitError] = useState<ApiError | null>(null);
  const [submitError, setSubmitError] = useState<ApiError | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<EnrollmentSuccess | null>(null);

  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingVisitId, setUpdatingVisitId] = useState<string | null>(null);

  const selectedParticipant = useMemo(
    () => participants.find((participant) => participant.id === selectedParticipantId) ?? null,
    [participants, selectedParticipantId]
  );

  async function loadBootstrap() {
    setIsBootstrapping(true);
    setBootstrapError(null);

    try {
      const [studiesData, sitesData, participantsData] = await Promise.all([
        getStudies(),
        getSites(),
        getParticipants(),
      ]);

      setStudies(studiesData);
      setSites(sitesData);
      setParticipants(participantsData.participants);

      if (participantsData.participants.length > 0) {
        setSelectedParticipantId((current) => current ?? participantsData.participants[0].id);
      }
    } catch (error) {
      setBootstrapError((error as ApiError) ?? { error: "Failed to load page" });
    } finally {
      setIsBootstrapping(false);
    }
  }

  async function loadParticipants() {
    setParticipantError(null);

    try {
      const data = await getParticipants();
      setParticipants(data.participants);

      if (data.participants.length === 0) {
        setSelectedParticipantId(null);
        setVisits([]);
        return;
      }

      setSelectedParticipantId((current) => {
        const stillExists = current && data.participants.some((participant) => participant.id === current);
        return stillExists ? current : data.participants[0].id;
      });
    } catch (error) {
      setParticipantError((error as ApiError) ?? { error: "Failed to load participants" });
    }
  }

  async function loadVisits(participantId: string) {
    setVisitError(null);

    try {
      const data = await getVisits(participantId);
      setVisits(data.visits);
    } catch (error) {
      setVisitError((error as ApiError) ?? { error: "Failed to load visits" });
      setVisits([]);
    }
  }

  useEffect(() => {
    void loadBootstrap();
  }, []);

  useEffect(() => {
    if (!selectedParticipantId) {
      setVisits([]);
      return;
    }

    void loadVisits(selectedParticipantId);
  }, [selectedParticipantId]);

  async function handleEnrollment(payload: {
    studyId: string;
    siteId: string;
    subjectIdentifier: string;
    fullName: string;
    dateOfBirthUtc: string;
    enrolledAtUtc: string;
    demoFailAfterParticipant?: boolean;
  }) {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const data = await createParticipant(payload);
      setSubmitSuccess(data);
      await loadParticipants();

      if (data.result?.participantId) {
        setSelectedParticipantId(data.result.participantId);
      }
    } catch (error) {
      setSubmitError((error as ApiError) ?? { error: "Enrollment failed" });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdateVisitStatus(visitId: string, status: VisitStatus) {
    setUpdatingVisitId(visitId);
    setVisitError(null);

    try {
      await updateVisitStatus(visitId, status);
      if (selectedParticipantId) {
        await loadVisits(selectedParticipantId);
      }
    } catch (error) {
      setVisitError((error as ApiError) ?? { error: "Status update failed" });
    } finally {
      setUpdatingVisitId(null);
    }
  }

  if (isBootstrapping) {
    return (
      <main className="mx-auto max-w-6xl p-8">
        <LoadingBlock label="Loading studies, sites, participants, and visits..." />
      </main>
    );
  }

  if (bootstrapError) {
    return (
      <main className="mx-auto max-w-6xl p-8">
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-900">
          <div className="font-semibold">Page load failed</div>
          <div className="mt-1">{bootstrapError.error}</div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-8">
      <section>
        <h1 className="text-3xl font-bold text-slate-900">Clinical Research Study Tracker</h1>
        <p className="mt-2 text-sm text-slate-600">
          Minimal UI that exposes backend truth: enrollment transaction, participant list,
          generated visits, controlled status changes, and visible errors.
        </p>
      </section>

      <EnrollmentForm
        studies={studies}
        sites={sites}
        isSubmitting={isSubmitting}
        submitError={submitError}
        submitSuccess={submitSuccess}
        onSubmit={handleEnrollment}
      />

      {participantError && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-900">
          <div className="font-semibold">Participant list failed</div>
          <div className="mt-1">{participantError.error}</div>
        </div>
      )}

      <ParticipantTable
        participants={participants}
        selectedParticipantId={selectedParticipantId}
        onSelect={setSelectedParticipantId}
      />

      <VisitTable
        participantName={selectedParticipant?.fullName ?? null}
        visits={visits}
        error={visitError}
        updatingVisitId={updatingVisitId}
        onUpdateStatus={handleUpdateVisitStatus}
      />
    </main>
  );
}
