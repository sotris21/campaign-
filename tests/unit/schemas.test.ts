// tests/unit/schemas.test.ts
import { describe, it, expect } from "vitest";
import {
  GenerateRequestSchema,
  GenerateResponseSchema,
  ReviewActionSchema,
  ExportRequestSchema,
  isValidStatusTransition,
  extractJSON,
  ContentStatus,
  VALID_STATUS_TRANSITIONS,
} from "../../lib/schemas";

// ─── Status transitions ───────────────────────────────────────────────────
describe("isValidStatusTransition", () => {
  it("allows draft → needs_review", () => {
    expect(isValidStatusTransition("draft", "needs_review")).toBe(true);
  });
  it("allows needs_review → approved", () => {
    expect(isValidStatusTransition("needs_review", "approved")).toBe(true);
  });
  it("allows approved → exported", () => {
    expect(isValidStatusTransition("approved", "exported")).toBe(true);
  });
  it("allows approved → rejected", () => {
    expect(isValidStatusTransition("approved", "rejected")).toBe(true);
  });
  it("blocks draft → exported (invalid)", () => {
    expect(isValidStatusTransition("draft", "exported")).toBe(false);
  });
  it("blocks exported → needs_review (invalid)", () => {
    expect(isValidStatusTransition("exported", "needs_review")).toBe(false);
  });
  it("blocks archived → approved (invalid)", () => {
    expect(isValidStatusTransition("archived", "approved")).toBe(false);
  });
  it("all statuses have transition definitions", () => {
    const statuses = ContentStatus.options;
    for (const status of statuses) {
      expect(VALID_STATUS_TRANSITIONS[status]).toBeDefined();
    }
  });
});

// ─── extractJSON ──────────────────────────────────────────────────────────
describe("extractJSON", () => {
  it("extracts clean JSON", () => {
    const result = extractJSON('{"key":"value"}');
    expect(result).toBe('{"key":"value"}');
  });
  it("strips markdown code fences", () => {
    const result = extractJSON("```json\n{\"key\":\"value\"}\n```");
    expect(result).toBe('{"key":"value"}');
  });
  it("extracts JSON from surrounding text", () => {
    const result = extractJSON('Here is the data: {"key":"value"} done.');
    expect(result).toBe('{"key":"value"}');
  });
  it("throws if no JSON found", () => {
    expect(() => extractJSON("no json here")).toThrow();
  });
  it("handles nested objects", () => {
    const raw = '{"a":{"b":{"c":1}}}';
    expect(extractJSON(raw)).toBe(raw);
  });
});

// ─── GenerateRequestSchema ─────────────────────────────────────────────────
describe("GenerateRequestSchema", () => {
  const validRequest = {
    campaignId: "default-campaign",
    dayNumber: 1,
    theme: "Housing & Cost of Living",
    customContext: "Some context",
    tone: "informative",
    platforms: "all",
    compliance: {
      includeImprintReminder: true,
      requireFactualClaimReview: true,
      avoidPersonalAttacks: true,
      avoidUnsupportedClaims: true,
      avoidProtectedCharacteristics: true,
      requireHumanApproval: true,
    },
  };

  it("accepts a valid request", () => {
    const result = GenerateRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });
  it("rejects missing campaignId", () => {
    const { campaignId: _, ...bad } = validRequest;
    const result = GenerateRequestSchema.safeParse(bad);
    expect(result.success).toBe(false);
  });
  it("rejects invalid theme", () => {
    const result = GenerateRequestSchema.safeParse({ ...validRequest, theme: "Invalid Theme" });
    expect(result.success).toBe(false);
  });
  it("rejects dayNumber > 365", () => {
    const result = GenerateRequestSchema.safeParse({ ...validRequest, dayNumber: 400 });
    expect(result.success).toBe(false);
  });
  it("rejects dayNumber < 1", () => {
    const result = GenerateRequestSchema.safeParse({ ...validRequest, dayNumber: 0 });
    expect(result.success).toBe(false);
  });
  it("rejects invalid platform", () => {
    const result = GenerateRequestSchema.safeParse({ ...validRequest, platforms: "twitter" });
    expect(result.success).toBe(false);
  });
  it("rejects invalid tone", () => {
    const result = GenerateRequestSchema.safeParse({ ...validRequest, tone: "angry" });
    expect(result.success).toBe(false);
  });
  it("rejects customContext over 500 chars", () => {
    const result = GenerateRequestSchema.safeParse({ ...validRequest, customContext: "x".repeat(501) });
    expect(result.success).toBe(false);
  });
});

// ─── ReviewActionSchema ────────────────────────────────────────────────────
describe("ReviewActionSchema", () => {
  it("accepts approve action", () => {
    const result = ReviewActionSchema.safeParse({ contentItemId: "abc", action: "approve" });
    expect(result.success).toBe(true);
  });
  it("accepts reject action", () => {
    const result = ReviewActionSchema.safeParse({ contentItemId: "abc", action: "reject" });
    expect(result.success).toBe(true);
  });
  it("rejects unknown action", () => {
    const result = ReviewActionSchema.safeParse({ contentItemId: "abc", action: "publish" });
    expect(result.success).toBe(false);
  });
  it("rejects empty contentItemId", () => {
    const result = ReviewActionSchema.safeParse({ contentItemId: "", action: "approve" });
    expect(result.success).toBe(false);
  });
  it("rejects notes over 1000 chars", () => {
    const result = ReviewActionSchema.safeParse({
      contentItemId: "abc",
      action: "note",
      notes: "x".repeat(1001),
    });
    expect(result.success).toBe(false);
  });
});

// ─── ExportRequestSchema ──────────────────────────────────────────────────
describe("ExportRequestSchema", () => {
  it("accepts csv format", () => {
    const result = ExportRequestSchema.safeParse({
      contentPackId: "pack-1",
      format: "csv",
      includeStatuses: ["approved"],
    });
    expect(result.success).toBe(true);
  });
  it("accepts markdown format", () => {
    const result = ExportRequestSchema.safeParse({
      contentPackId: "pack-1",
      format: "markdown",
      includeStatuses: ["approved", "exported"],
    });
    expect(result.success).toBe(true);
  });
  it("rejects unknown format", () => {
    const result = ExportRequestSchema.safeParse({
      contentPackId: "pack-1",
      format: "xml",
      includeStatuses: ["approved"],
    });
    expect(result.success).toBe(false);
  });
  it("rejects empty includeStatuses", () => {
    const result = ExportRequestSchema.safeParse({
      contentPackId: "pack-1",
      format: "csv",
      includeStatuses: [],
    });
    expect(result.success).toBe(false);
  });
});
