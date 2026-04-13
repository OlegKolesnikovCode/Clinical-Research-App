import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const participants = await prisma.participant.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(participants);
}

export async function POST(req: Request) {
  const body = await req.json();

  const { name, age, condition } = body;

  if (!name || !age || !condition) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const participant = await prisma.participant.create({
    data: {
      name,
      age: Number(age),
      condition,
    },
  });

  return NextResponse.json(participant, { status: 201 });
}