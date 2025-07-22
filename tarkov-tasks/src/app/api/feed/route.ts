import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // adjust path if needed
import { promises as fs } from "fs";
import path from "path";

type FeedEntry = {
  time: string;
  text: string;
};

// Get feed file path based on user email
function getUserFeedPath(email: string) {
  return path.resolve(`.data/users/${encodeURIComponent(email)}/feed.json`);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json([], { status: 401 });
  }

  const feedPath = getUserFeedPath(session.user.email);

  try {
    const content = await fs.readFile(feedPath, "utf-8");
    return NextResponse.json(JSON.parse(content));
  } catch {
    return NextResponse.json([]); // no feed yet
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { text } = await req.json();
  const entry: FeedEntry = {
    time: new Date().toLocaleString(),
    text,
  };

  const userDir = path.resolve(`.data/users/${encodeURIComponent(session.user.email)}`);
  const feedPath = path.join(userDir, "feed.json");

  try {
    await fs.mkdir(userDir, { recursive: true });

    let current: FeedEntry[] = [];
    try {
      const raw = await fs.readFile(feedPath, "utf-8");
      current = JSON.parse(raw);
    } catch {
      current = [];
    }

    current.unshift(entry);
    if (current.length > 100) current = current.slice(0, 100);

    await fs.writeFile(feedPath, JSON.stringify(current, null, 2));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to write activity feed:", err);
    return NextResponse.json({ error: "Failed to save feed" }, { status: 500 });
  }
}
