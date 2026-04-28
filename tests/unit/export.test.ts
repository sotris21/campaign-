// tests/unit/export.test.ts
import { describe, it, expect } from "vitest";
import { exportAsCSV, exportAsJSON, exportAsMarkdown } from "../../lib/export";

// Mock content items matching Prisma shape
const mockItems = [
  {
    id: "item-1",
    contentPackId: "pack-1",
    platform: "facebook",
    slot: "morning",
    scheduledTime: "08:00 BST",
    caption: "Good morning Bromford! Vote Reform on May 7th. #ReformUK",
    storyScript: "Frame 1: Hook | Frame 2: Message | Frame 3: CTA",
    videoScript: null,
    imageHint: "Use candidate headshot",
    altText: "Andreas standing in Bromford",
    hashtags: "#ReformUK #VoteAndreas",
    complianceChecklist: JSON.stringify({ humanReviewRequired: true }),
    factualClaims: JSON.stringify(["Election on 7 May 2026"]),
    reviewNotes: "Checked by team",
    imprintReminder: "Add imprint before publishing",
    assetId: null,
    status: "approved",
    createdAt: new Date("2026-04-01"),
    updatedAt: new Date("2026-04-01"),
    asset: null,
  },
  {
    id: "item-2",
    contentPackId: "pack-1",
    platform: "instagram",
    slot: "afternoon",
    scheduledTime: "12:30 BST",
    caption: "Your voice matters in Bromford & Hodge Hill 🗳️",
    storyScript: null,
    videoScript: null,
    imageHint: "Use campaign poster",
    altText: "Vote Reform UK poster",
    hashtags: "#ReformUK #BrumPolitics #VoteAndreas",
    complianceChecklist: null,
    factualClaims: null,
    reviewNotes: null,
    imprintReminder: "Add imprint before publishing",
    assetId: null,
    status: "approved",
    createdAt: new Date("2026-04-01"),
    updatedAt: new Date("2026-04-01"),
    asset: null,
  },
];

const packMeta = { dayNumber: 1, theme: "Housing & Cost of Living", date: "2026-04-01" };
const fullMeta = { ...packMeta, candidateName: "Andreas Karagiannopoulos" };

// ─── CSV export ───────────────────────────────────────────────────────────
describe("exportAsCSV", () => {
  it("returns a string", () => {
    const csv = exportAsCSV(mockItems, "2026-04-01");
    expect(typeof csv).toBe("string");
  });
  it("includes header row", () => {
    const csv = exportAsCSV(mockItems, "2026-04-01");
    expect(csv.startsWith("platform,slot")).toBe(true);
  });
  it("has correct number of rows (header + items)", () => {
    const csv = exportAsCSV(mockItems, "2026-04-01");
    const rows = csv.split("\n");
    expect(rows.length).toBe(mockItems.length + 1);
  });
  it("includes platform values", () => {
    const csv = exportAsCSV(mockItems, "2026-04-01");
    expect(csv).toContain("facebook");
    expect(csv).toContain("instagram");
  });
  it("escapes double quotes in captions", () => {
    const itemWithQuotes = [{ ...mockItems[0], caption: 'He said "vote" today' }];
    const csv = exportAsCSV(itemWithQuotes, "2026-04-01");
    expect(csv).toContain('He said ""vote"" today');
  });
  it("includes the pack date in each row", () => {
    const csv = exportAsCSV(mockItems, "2026-04-01");
    const rows = csv.split("\n").slice(1);
    for (const row of rows) {
      expect(row).toContain("2026-04-01");
    }
  });
});

// ─── JSON export ──────────────────────────────────────────────────────────
describe("exportAsJSON", () => {
  it("returns valid JSON", () => {
    const json = exportAsJSON(mockItems, packMeta);
    expect(() => JSON.parse(json)).not.toThrow();
  });
  it("includes warning field", () => {
    const parsed = JSON.parse(exportAsJSON(mockItems, packMeta));
    expect(parsed.warning).toBeDefined();
    expect(parsed.warning).toContain("Human review");
  });
  it("includes exportedAt timestamp", () => {
    const parsed = JSON.parse(exportAsJSON(mockItems, packMeta));
    expect(parsed.exportedAt).toBeDefined();
  });
  it("includes items array", () => {
    const parsed = JSON.parse(exportAsJSON(mockItems, packMeta));
    expect(Array.isArray(parsed.items)).toBe(true);
    expect(parsed.items.length).toBe(mockItems.length);
  });
  it("includes platform and slot in each item", () => {
    const parsed = JSON.parse(exportAsJSON(mockItems, packMeta));
    for (const item of parsed.items) {
      expect(item.platform).toBeDefined();
      expect(item.slot).toBeDefined();
    }
  });
});

// ─── Markdown export ──────────────────────────────────────────────────────
describe("exportAsMarkdown", () => {
  it("returns a string", () => {
    const md = exportAsMarkdown(mockItems, fullMeta);
    expect(typeof md).toBe("string");
  });
  it("includes day number in heading", () => {
    const md = exportAsMarkdown(mockItems, fullMeta);
    expect(md).toContain("Day 1");
  });
  it("includes compliance warning", () => {
    const md = exportAsMarkdown(mockItems, fullMeta);
    expect(md).toContain("Compliance reminder");
  });
  it("includes platform sections", () => {
    const md = exportAsMarkdown(mockItems, fullMeta);
    expect(md).toContain("## Facebook");
    expect(md).toContain("## Instagram");
  });
  it("includes imprint reminder", () => {
    const md = exportAsMarkdown(mockItems, fullMeta);
    expect(md).toContain("Imprint");
  });
  it("includes captions in code blocks", () => {
    const md = exportAsMarkdown(mockItems, fullMeta);
    expect(md).toContain("Good morning Bromford");
  });
});
