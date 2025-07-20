import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/password";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const hashed = await hashPassword(password);
  try {
    await prisma.user.create({ data: { email, password: hashed } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "User exists" }, { status: 400 });
  }
}
