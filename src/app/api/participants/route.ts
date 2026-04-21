import { NextResponse } from "next/server"; 
import { prisma } from "@/lib/prisma";
import { enrollmentSchema } from "@/lib/validators/enrollment";
import { buildParticipantVisits } from "@/lib/enrollment/buildParticipantVisits";
import { isPrismaUniqueError } from "@/lib/errors/prisma";

export async function POST(req: Request) {
  const steps: string[] = [];

  try {
    const body = await req.json();

    const parsed = enrollmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid enrollment payload",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const {
      studyId,
      siteId,
      subjectIdentifier,
      fullName,
      dateOfBirthUtc,
      enrolledAtUtc,
      demoFailAfterParticipant,
    } = parsed.data;

    const study = await prisma.study.findUnique({
      where: { id: studyId },
    });

    if (!study) {
      return NextResponse.json({ error: "Study not found" }, { status: 404 });
    }

    const site = await prisma.site.findUnique({
      where: { id: siteId },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    if (site.studyId !== studyId) {
      return NextResponse.json(
        { error: "Site does not belong to the specified study" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      steps.push("TRANS_START");

      const participant = await tx.participant.create({
        data: {
          studyId,
          siteId,
          subjectIdentifier,
          fullName,
          dateOfBirthUtc,
          enrolledAtUtc,
        },
      });

      steps.push("PARTICIPANT_CREATED");

      if (demoFailAfterParticipant) {
        steps.push("FORCED_FAILURE");
        throw new Error("Intentional failure after participant creation");
      }

      const templates = await tx.visitTemplate.findMany({
        where: { studyId },
        orderBy: { sortOrder: "asc" },
      });

      steps.push("TEMPLATES_FETCHED");

      const visits = buildParticipantVisits({
        participantId: participant.id,
        enrolledAtUtc,
        templates,
      });

      await tx.participantVisit.createMany({
        data: visits,
      });

      steps.push("VISITS_CREATED");
      steps.push("TRANS_COMMIT");

      return participant;
    });

    return NextResponse.json(
      {
        result: { participantId: result.id },
        steps,
      },
      { status: 201 }
    );
  } catch (error) {
    if (isPrismaUniqueError(error)) {
      return NextResponse.json(
        {
          error: "Duplicate participant for this study",
          steps,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: "Enrollment failed",
        steps,
      },
      { status: 500 }
    );
  }
}