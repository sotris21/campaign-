// app/api/assets/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { AssetCreateSchema } from "@/lib/schemas";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get("campaignId") ?? "default-campaign";

  const assets = await prisma.asset.findMany({
    where: { campaignId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(assets);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null;
    const campaignId = formData.get("campaignId") as string | null;
    const altText = formData.get("altText") as string | null;

    // Validate metadata
    const metaResult = AssetCreateSchema.safeParse({ campaignId, type, altText });
    if (!metaResult.success) {
      return NextResponse.json(
        { error: "Invalid metadata", details: metaResult.error.flatten() },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, and WebP images are allowed" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum 10MB." },
        { status: 400 }
      );
    }

    // Sanitize filename
    const ext = file.name.split(".").pop() ?? "jpg";
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const filePath = path.join(uploadDir, safeName);

    // Ensure upload dir exists
    await mkdir(uploadDir, { recursive: true });

    // Write file
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    // Save asset record
    const asset = await prisma.asset.create({
      data: {
        campaignId: metaResult.data.campaignId,
        type: metaResult.data.type,
        filename: safeName,
        url: `/uploads/${safeName}`,
        altText: metaResult.data.altText ?? null,
      },
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (err) {
    console.error("Asset upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Asset ID required" }, { status: 400 });
  }

  try {
    await prisma.asset.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }
}
