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

    const nextStatus = status as VisitStatus;

    const visit = await prisma.participantVisit.findUnique({
      where: { id },
    });

    if (!visit) {
      return NextResponse.json({ error: "Visit not found" }, { status: 404 });
    }

    if (visit.status === nextStatus) {
      return NextResponse.json({
        id: visit.id,
        status: visit.status,
        completedAtUtc: visit.completedAtUtc,
        note: "No-op (same state)",
      });
    }

    if (!canTransition(visit.status as VisitStatus, nextStatus)) {
      return NextResponse.json(
        {
          error: "Invalid status transition",
          current: visit.status,
          attempted: nextStatus,
        },
        { status: 400 }
      );
    }
    
    //fix(fsm): make status transitions concurrency-safe
    const result = await prisma.participantVisit.updateMany({
      where: {
        id,
        status: visit.status,
      },
      data: {
        status: nextStatus,
        completedAtUtc: nextStatus === "COMPLETED" ? new Date() : null,
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        {
          error: "Visit status changed during update. Retry with latest state.",
        },
        { status: 409 }
      );
    }

    const updated = await prisma.participantVisit.findUnique({
      where: { id },
    });

    return NextResponse.json({
      id: updated?.id,
      status: updated?.status,
      completedAtUtc: updated?.completedAtUtc,
    });
  } catch (error) {
    console.error("PATCH /api/visits/[id]/status failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}