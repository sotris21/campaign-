// lib/schemas.ts
import { z } from "zod";

// ─── Status enum ───────────────────────────────────────────────────────────
export const ContentStatus = z.enum([
  "draft",
  "needs_review",
  "approved",
  "exported",
  "scheduled_manually",
  "rejected",
  "archived",
]);
export type ContentStatusType = z.infer<typeof ContentStatus>;

export const VALID_STATUS_TRANSITIONS: Record<ContentStatusType, ContentStatusType[]> = {
  draft: ["needs_review", "archived"],
  needs_review: ["approved", "rejected", "draft"],
  approved: ["exported", "scheduled_manually", "rejected", "archived"],
  exported: ["archived", "approved"],
  scheduled_manually: ["archived", "approved"],
  rejected: ["draft", "archived"],
  archived: ["draft"],
};

// ─── Compliance checklist ──────────────────────────────────────────────────
export const ComplianceChecklistSchema = z.object({
  factualClaimsVerified: z.boolean(),
  noPersonalAttacks: z.boolean(),
  noUnsupportedStatistics: z.boolean(),
  noFakeTestimonials: z.boolean(),
  noMisleadingOpponentClaims: z.boolean(),
  noInflammatoryLanguage: z.boolean(),
  noProtectedCharacteristicTargeting: z.boolean(),
  humanReviewRequired: z.boolean(),
  imprintRequired: z.boolean(),
  needsVerificationFlags: z.array(z.string()),
});
export type ComplianceChecklist = z.infer<typeof ComplianceChecklistSchema>;

// ─── Single generated content item ────────────────────────────────────────
export const GeneratedContentItemSchema = z.object({
  platform: z.enum(["facebook", "instagram", "tiktok"]),
  slot: z.enum(["morning", "afternoon", "evening"]),
  suggestedPostingTime: z.string(),
  caption: z.string().max(600),
  storyScript: z.string().optional(),
  videoScript: z.string().optional(),
  imageHint: z.string().optional(),
  altText: z.string().optional(),
  hashtags: z.string().optional(),
  complianceChecklist: ComplianceChecklistSchema,
  factualClaims: z.array(z.string()),
  reviewNotes: z.string().optional(),
  imprintReminder: z.string(),
});
export type GeneratedContentItem = z.infer<typeof GeneratedContentItemSchema>;

// ─── Full generate API response ────────────────────────────────────────────
export const GenerateResponseSchema = z.object({
  dayNumber: z.number(),
  theme: z.string(),
  items: z.array(GeneratedContentItemSchema),
  canvaTip: z.string().optional(),
  engagementHook: z.string().optional(),
});
export type GenerateResponse = z.infer<typeof GenerateResponseSchema>;

// ─── Generate API request ──────────────────────────────────────────────────
export const GenerateRequestSchema = z.object({
  campaignId: z.string().min(1),
  dayNumber: z.number().int().min(1).max(365),
  theme: z.enum([
    "Housing & Cost of Living",
    "Community Safety",
    "Local Transport",
    "Schools & Young People",
    "Green Spaces & Environment",
    "Supporting Local Businesses",
    "NHS & Social Care",
    "Listening to Residents",
    "Candidate Introduction",
    "Election Day Reminder",
  ]),
  customContext: z.string().max(500).optional(),
  tone: z.enum([
    "informative",
    "community_update",
    "call_to_action",
    "listening_post",
    "personal_update",
  ]),
  platforms: z.enum(["facebook", "instagram", "tiktok", "all"]),
  compliance: z.object({
    includeImprintReminder: z.boolean().default(true),
    requireFactualClaimReview: z.boolean().default(true),
    avoidPersonalAttacks: z.boolean().default(true),
    avoidUnsupportedClaims: z.boolean().default(true),
    avoidProtectedCharacteristics: z.boolean().default(true),
    requireHumanApproval: z.boolean().default(true),
  }),
});
export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;

// ─── Review action ─────────────────────────────────────────────────────────
export const ReviewActionSchema = z.object({
  contentItemId: z.string().min(1),
  action: z.enum(["approve", "reject", "note", "edit"]),
  notes: z.string().max(1000).optional(),
  caption: z.string().max(600).optional(),
  storyScript: z.string().max(2000).optional(),
  hashtags: z.string().max(500).optional(),
});
export type ReviewAction = z.infer<typeof ReviewActionSchema>;

// ─── Export request ────────────────────────────────────────────────────────
export const ExportRequestSchema = z.object({
  contentPackId: z.string().min(1),
  format: z.enum(["csv", "json", "markdown"]),
  includeStatuses: z.array(ContentStatus).min(1),
});
export type ExportRequest = z.infer<typeof ExportRequestSchema>;

// ─── Asset upload ──────────────────────────────────────────────────────────
export const AssetCreateSchema = z.object({
  campaignId: z.string().min(1),
  type: z.enum(["headshot", "poster", "other"]),
  altText: z.string().max(200).optional(),
});

// ─── Hashtag CRUD ──────────────────────────────────────────────────────────
export const HashtagCreateSchema = z.object({
  campaignId: z.string().min(1),
  tag: z
    .string()
    .startsWith("#", "Hashtag must start with #")
    .min(2)
    .max(100),
  platforms: z.string().default("all"),
  group: z.string().optional(),
});

// ─── Content status validation helper ─────────────────────────────────────
export function isValidStatusTransition(
  from: ContentStatusType,
  to: ContentStatusType
): boolean {
  return VALID_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

// ─── Safely extract JSON from possibly-wrapped Claude response ─────────────
export function extractJSON(raw: string): string {
  // Strip markdown code fences
  const stripped = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();

  // Find first { and last }
  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found in response");
  return stripped.slice(start, end + 1);
}
