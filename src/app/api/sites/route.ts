import { NextResponse } from "next/server";  
import { prisma } from "@/lib/prisma";
import { siteSchema } from "@/lib/validators/site";

export async function GET() {
  const sites = await prisma.site.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(sites);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = siteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    // 🔥 DOMAIN VALIDATION (important)
    const study = await prisma.study.findUnique({
      where: { id: parsed.data.studyId },
    });

    if (!study) {
      return NextResponse.json(
        { error: "Study not found" },
        { status: 404 }
      );
    }

    const site = await prisma.site.create({
      data: parsed.data,
    });

    return NextResponse.json(site, { status: 201 });

  } catch (err: any) {
    // Handle unique constraint (optional but good signal)
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "Duplicate site for study" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}