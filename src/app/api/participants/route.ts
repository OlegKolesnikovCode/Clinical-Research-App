import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enrollmentSchema } from "@/lib/validators/participant";

export async function POST(req: Request) {
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

    const data = parsed.data;

    const study = await prisma.study.findUnique({
      where: { id: data.studyId },
      select: { id: true, name: true },
    });

    if (!study) {
      return NextResponse.json(
        { error: "Study not found" },
        { status: 404 }
      );
    }

    const site = await prisma.site.findUnique({
      where: { id: data.siteId },
      select: { id: true, studyId: true, name: true },
    });

    if (!site) {
      return NextResponse.json(
        { error: "Site not found" },
        { status: 404 }
      );
    }

    if (site.studyId !== data.studyId) {
      return NextResponse.json(
        { error: "Site does not belong to the specified study" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "Enrollment entry validation passed",
        validated: true,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}