import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const participantId = searchParams.get("participantId");

    const visits = await prisma.participantVisit.findMany({
      where: participantId ? { participantId } : undefined,
      orderBy: [{ scheduledAtUtc: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        participantId: true,
        visitTemplateId: true,
        templateName: true,
        offsetDaysSnapshot: true,
        scheduledAtUtc: true,
        status: true,
        completedAtUtc: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ visits });
  } catch (error) {
    console.error("GET /api/visits failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
