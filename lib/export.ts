// lib/export.ts
import type { ContentItem } from "@prisma/client";

interface ExportItem {
  platform: string;
  slot: string;
  scheduledTime?: string | null;
  caption: string;
  storyScript?: string | null;
  hashtags?: string | null;
  imageHint?: string | null;
  altText?: string | null;
  status: string;
  reviewNotes?: string | null;
  imprintReminder?: string | null;
  assetFilename?: string | null;
}

function toExportItem(item: ContentItem & { asset?: { filename: string } | null }): ExportItem {
  return {
    platform: item.platform,
    slot: item.slot,
    scheduledTime: item.scheduledTime,
    caption: item.caption,
    storyScript: item.storyScript,
    hashtags: item.hashtags,
    imageHint: item.imageHint,
    altText: item.altText,
    status: item.status,
    reviewNotes: item.reviewNotes,
    imprintReminder: item.imprintReminder,
    assetFilename: item.asset?.filename ?? null,
  };
}

export function exportAsCSV(
  items: (ContentItem & { asset?: { filename: string } | null })[],
  packDate: string
): string {
  const headers = [
    "platform",
    "slot",
    "scheduled_time",
    "caption",
    "story_script",
    "hashtags",
    "image_hint",
    "alt_text",
    "status",
    "review_notes",
    "imprint_reminder",
    "asset_filename",
    "date",
  ];

  const escape = (val: string | null | undefined) => {
    if (val === null || val === undefined) return "";
    return `"${val.replace(/"/g, '""')}"`;
  };

  const rows = items.map((item) => {
    const e = toExportItem(item);
    return [
      escape(e.platform),
      escape(e.slot),
      escape(e.scheduledTime),
      escape(e.caption),
      escape(e.storyScript),
      escape(e.hashtags),
      escape(e.imageHint),
      escape(e.altText),
      escape(e.status),
      escape(e.reviewNotes),
      escape(e.imprintReminder),
      escape(e.assetFilename),
      escape(packDate),
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

export function exportAsJSON(
  items: (ContentItem & { asset?: { filename: string } | null })[],
  meta: { dayNumber: number; theme: string; date: string }
): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      warning:
        "DRAFT CONTENT — Human review and approval required before publishing. Ensure legal imprint is added.",
      campaign: meta,
      items: items.map(toExportItem),
    },
    null,
    2
  );
}

export function exportAsMarkdown(
  items: (ContentItem & { asset?: { filename: string } | null })[],
  meta: { dayNumber: number; theme: string; date: string; candidateName: string }
): string {
  const platformOrder = ["facebook", "instagram", "tiktok"];
  const slotOrder = ["morning", "afternoon", "evening"];

  let md = `# Campaign Content Pack — Day ${meta.dayNumber}\n\n`;
  md += `**Theme:** ${meta.theme}  \n`;
  md += `**Date:** ${meta.date}  \n`;
  md += `**Candidate:** ${meta.candidateName}  \n`;
  md += `**Status:** DRAFT — Requires human review before publishing  \n\n`;
  md += `---\n\n`;
  md += `> ⚠️ **Compliance reminder:** All content requires human approval. Add the legal digital imprint before publishing.\n\n`;
  md += `---\n\n`;

  for (const platform of platformOrder) {
    const platformItems = items.filter((i) => i.platform === platform);
    if (platformItems.length === 0) continue;

    md += `## ${platform.charAt(0).toUpperCase() + platform.slice(1)}\n\n`;

    for (const slot of slotOrder) {
      const item = platformItems.find((i) => i.slot === slot);
      if (!item) continue;

      md += `### ${slot.charAt(0).toUpperCase() + slot.slice(1)} Slot`;
      if (item.scheduledTime) md += ` — Suggested: ${item.scheduledTime}`;
      md += `\n\n`;
      md += `**Status:** \`${item.status}\`  \n\n`;
      md += `**Caption:**\n\`\`\`\n${item.caption}\n\`\`\`\n\n`;

      if (item.storyScript) {
        md += `**Story Script:**\n${item.storyScript}\n\n`;
      }
      if (item.hashtags) {
        md += `**Hashtags:** ${item.hashtags}\n\n`;
      }
      if (item.imageHint) {
        md += `**Image:** ${item.imageHint}\n\n`;
      }
      if (item.altText) {
        md += `**Alt Text:** ${item.altText}\n\n`;
      }
      if (item.reviewNotes) {
        md += `**Reviewer Notes:** ${item.reviewNotes}\n\n`;
      }
      md += `**⚠️ Imprint:** ${item.imprintReminder ?? "See campaign team for imprint details."}\n\n`;
      md += `---\n\n`;
    }
  }

  return md;
}
