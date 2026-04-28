// app/api/content/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get("campaignId") ?? "default-campaign";
  const status = searchParams.get("status");
  const platform = searchParams.get("platform");
  const packId = searchParams.get("packId");

  try {
    if (packId) {
      const pack = await prisma.contentPack.findUnique({
        where: { id: packId },
        include: {
          items: {
            include: { asset: true, reviewLogs: { orderBy: { createdAt: "desc" } } },
            orderBy: [{ platform: "asc" }, { slot: "asc" }],
          },
        },
      });
      if (!pack) return NextResponse.json({ error: "Pack not found" }, { status: 404 });
      return NextResponse.json(pack);
    }

    const packs = await prisma.contentPack.findMany({
      where: { campaignId },
      include: {
        items: {
          where: {
            ...(status ? { status } : {}),
            ...(platform ? { platform } : {}),
          },
          include: { asset: true },
          orderBy: [{ platform: "asc" }, { slot: "asc" }],
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(packs);
  } catch (err) {
    console.error("GET /api/content error:", err);
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 });
  }
}
