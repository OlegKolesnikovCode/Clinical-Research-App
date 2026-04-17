import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { studySchema } from "@/lib/validators/study";

export async function GET() {
  const studies = await prisma.study.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(studies);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = studySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid payload",
          issues: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const study = await prisma.study.create({
      data: {
        ...parsed.data,
        startDateUtc: new Date(parsed.data.startDateUtc),
      },
    });

    return NextResponse.json(study, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "Duplicate protocol code" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}