// app/api/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ExportRequestSchema } from "@/lib/schemas";
import { exportAsCSV, exportAsJSON, exportAsMarkdown } from "@/lib/export";
import { format } from "date-fns";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parseResult = ExportRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parseResult.error.flatten() },
      { status: 400 }
    );
  }

  const { contentPackId, format: exportFormat, includeStatuses } = parseResult.data;

  const pack = await prisma.contentPack.findUnique({
    where: { id: contentPackId },
    include: {
      items: {
        where: { status: { in: includeStatuses } },
        include: { asset: true },
        orderBy: [{ platform: "asc" }, { slot: "asc" }],
      },
      campaign: true,
    },
  });

  if (!pack) {
    return NextResponse.json({ error: "Content pack not found" }, { status: 404 });
  }

  if (pack.items.length === 0) {
    return NextResponse.json(
      { error: "No items match the selected statuses for export" },
      { status: 400 }
    );
  }

  // Check that only approved items can be exported
  const unapproved = pack.items.filter(
    (i) => !["approved", "exported", "scheduled_manually"].includes(i.status)
  );
  if (unapproved.length > 0) {
    return NextResponse.json(
      {
        error: `${unapproved.length} item(s) are not approved. Approve all items before exporting.`,
        unapprovedIds: unapproved.map((i) => i.id),
      },
      { status: 400 }
    );
  }

  const packDateStr = format(pack.date, "yyyy-MM-dd");
  const filename = `campaign-day${pack.dayNumber}-${packDateStr}.${exportFormat}`;

  let content: string;
  let contentType: string;

  if (exportFormat === "csv") {
    content = exportAsCSV(pack.items, packDateStr);
    contentType = "text/csv";
  } else if (exportFormat === "json") {
    content = exportAsJSON(pack.items, {
      dayNumber: pack.dayNumber,
      theme: pack.theme,
      date: packDateStr,
    });
    contentType = "application/json";
  } else {
    content = exportAsMarkdown(pack.items, {
      dayNumber: pack.dayNumber,
      theme: pack.theme,
      date: packDateStr,
      candidateName: pack.campaign.candidateName,
    });
    contentType = "text/markdown";
  }

  // Log export and update item statuses
  await prisma.$transaction([
    prisma.exportLog.create({
      data: { contentPackId, format: exportFormat, filename },
    }),
    ...pack.items.map((item) =>
      prisma.contentItem.update({
        where: { id: item.id },
        data: { status: "exported" },
      })
    ),
  ]);

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": `${contentType}; charset=utf-8`,
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
