// app/api/review/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ReviewActionSchema, isValidStatusTransition } from "@/lib/schemas";
import type { ContentStatusType } from "@/lib/schemas";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parseResult = ReviewActionSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parseResult.error.flatten() },
      { status: 400 }
    );
  }

  const { contentItemId, action, notes, caption, storyScript, hashtags } =
    parseResult.data;

  // Fetch current item
  const item = await prisma.contentItem.findUnique({
    where: { id: contentItemId },
  });

  if (!item) {
    return NextResponse.json({ error: "Content item not found" }, { status: 404 });
  }

  const currentStatus = item.status as ContentStatusType;

  // Determine new status
  let newStatus: ContentStatusType = currentStatus;
  const updateData: Record<string, unknown> = {};

  if (action === "approve") {
    if (!isValidStatusTransition(currentStatus, "approved")) {
      return NextResponse.json(
        { error: `Cannot approve item in status: ${currentStatus}` },
        { status: 400 }
      );
    }
    newStatus = "approved";
    updateData.status = newStatus;
  } else if (action === "reject") {
    if (!isValidStatusTransition(currentStatus, "rejected")) {
      return NextResponse.json(
        { error: `Cannot reject item in status: ${currentStatus}` },
        { status: 400 }
      );
    }
    newStatus = "rejected";
    updateData.status = newStatus;
  } else if (action === "edit") {
    if (caption !== undefined) updateData.caption = caption;
    if (storyScript !== undefined) updateData.storyScript = storyScript;
    if (hashtags !== undefined) updateData.hashtags = hashtags;
    // Editing moves back to needs_review if currently approved
    if (currentStatus === "approved" || currentStatus === "exported") {
      newStatus = "needs_review";
      updateData.status = newStatus;
    }
  } else if (action === "note") {
    updateData.reviewNotes = notes ?? "";
  }

  // Run DB update + review log in transaction
  try {
    const [updatedItem] = await prisma.$transaction([
      prisma.contentItem.update({
        where: { id: contentItemId },
        data: { ...updateData, updatedAt: new Date() },
      }),
      prisma.reviewLog.create({
        data: {
          contentItemId,
          action,
          notes: notes ?? null,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      item: updatedItem,
      message: `Item ${action}d successfully.`,
    });
  } catch (err) {
    console.error("Review action error:", err);
    return NextResponse.json(
      { error: "Failed to update content item" },
      { status: 500 }
    );
  }
}
