import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canTransition, VisitStatus } from "@/lib/fsm/visitStatus";

const VALID_STATUSES: VisitStatus[] = [
  "SCHEDULED",
  "COMPLETED",
  "MISSED",
  "CANCELLED",
];

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const status = body?.status;

    if (!status || typeof status !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid status" },
        { status: 400 }
      );
    }

    if (!VALID_STATUSES.includes(status as VisitStatus)) {
      return NextResponse.json(
        {
          error: "Invalid status value",
          allowed: VALID_STATUSES,
        },
        { status: 400 }
      );
    }

    const visit = await prisma.participantVisit.findUnique({
      where: { id },
    });

    if (!visit) {
      return NextResponse.json({ error: "Visit not found" }, { status: 404 });
    }

    if (visit.status === status) {
      return NextResponse.json({
        id: visit.id,
        status: visit.status,
        completedAtUtc: visit.completedAtUtc,
        note: "No-op (same state)",
      });
    }

    if (!canTransition(visit.status as VisitStatus, status as VisitStatus)) {
      return NextResponse.json(
        {
          error: "Invalid status transition",
          current: visit.status,
          attempted: status,
        },
        { status: 400 }
      );
    }

    const updated = await prisma.participantVisit.update({
      where: { id },
      data: {
        status: status as VisitStatus,
        completedAtUtc: status === "COMPLETED" ? new Date() : null,
      },
    });

    return NextResponse.json({
      id: updated.id,
      status: updated.status,
      completedAtUtc: updated.completedAtUtc,
    });
  } catch (error) {
    console.error("PATCH /api/visits/[id]/status failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}