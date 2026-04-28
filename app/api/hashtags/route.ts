// app/api/hashtags/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { HashtagCreateSchema } from "@/lib/schemas";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get("campaignId") ?? "default-campaign";
  const platform = searchParams.get("platform");

  const hashtags = await prisma.hashtag.findMany({
    where: {
      campaignId,
      ...(platform
        ? {
            OR: [
              { platforms: "all" },
              { platforms: { contains: platform } },
            ],
          }
        : {}),
    },
    orderBy: { tag: "asc" },
  });

  return NextResponse.json(hashtags);
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parseResult = HashtagCreateSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parseResult.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const hashtag = await prisma.hashtag.create({ data: parseResult.data });
    return NextResponse.json(hashtag, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create hashtag (may already exist)" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  try {
    await prisma.hashtag.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Hashtag not found" }, { status: 404 });
  }
}
