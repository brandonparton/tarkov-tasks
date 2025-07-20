// src/app/api/progress/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const progress = await prisma.questProgress.findMany({
    where: { userId: session.user.id },
    orderBy: { completedAt: "desc" },
  });
  // return just the questIds for simplicity
  return NextResponse.json(progress.map((p) => p.questId));
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { questId } = await req.json();
  if (!questId || typeof questId !== "string") {
    return NextResponse.json({ error: "Invalid questId" }, { status: 400 });
  }
  try {
    const record = await prisma.questProgress.create({
      data: { userId: session.user.id, questId },
    });
    return NextResponse.json({ questId: record.questId }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Already completed?" }, { status: 400 });
  }
}
