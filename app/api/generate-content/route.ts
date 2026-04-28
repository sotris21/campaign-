// app/api/generate-content/route.ts
// ⚠️ SERVER SIDE ONLY — Claude API key is never exposed to the browser.
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { differenceInCalendarDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import {
  GenerateRequestSchema,
  GenerateResponseSchema,
  extractJSON,
} from "@/lib/schemas";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/claude-prompt";
import { checkRateLimit } from "@/lib/rate-limit";

// Verify API key exists at module load — fail fast in dev
if (!process.env.ANTHROPIC_API_KEY) {
  console.error("⛔ ANTHROPIC_API_KEY is not set. Content generation will fail.");
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  // ── Rate limiting ──────────────────────────────────────────────────────
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const rateLimit = checkRateLimit(`generate:${ip}`);

  if (!rateLimit.success) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded. Please wait before generating more content.",
        resetAt: new Date(rateLimit.resetAt).toISOString(),
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(rateLimit.resetAt),
        },
      }
    );
  }

  // ── Parse & validate request ───────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parseResult = GenerateRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parseResult.error.flatten() },
      { status: 400 }
    );
  }

  const request = parseResult.data;

  // ── Load campaign ──────────────────────────────────────────────────────
  const campaign = await prisma.campaign.findUnique({
    where: { id: request.campaignId },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  const daysToElection = Math.max(
    0,
    differenceInCalendarDays(campaign.electionDate, new Date())
  );

  // ── Build prompts ──────────────────────────────────────────────────────
  const systemPrompt = buildSystemPrompt({
    candidateName: campaign.candidateName,
    partyName: campaign.partyName,
    ward: campaign.ward,
    council: campaign.council,
    daysToElection,
    electionDate: campaign.electionDate.toISOString().split("T")[0],
    facebookPageUrl: campaign.facebookPageUrl,
  });

  const userPrompt = buildUserPrompt(request, daysToElection);

  // ── Call Claude (server-side only) ────────────────────────────────────
  let rawResponse: string;
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const block = message.content[0];
    if (block.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }
    rawResponse = block.text;
  } catch (err) {
    console.error("Claude API error:", err);
    return NextResponse.json(
      { error: "AI generation failed. Please try again." },
      { status: 502 }
    );
  }

  // ── Parse & validate Claude response ──────────────────────────────────
  let parsed: unknown;
  try {
    const jsonStr = extractJSON(rawResponse);
    parsed = JSON.parse(jsonStr);
  } catch (err) {
    // Attempt one retry with a JSON-repair prompt
    console.warn("Initial JSON parse failed, retrying with repair prompt:", err);
    try {
      const repairMessage = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: `The following response is malformed JSON. Extract and return ONLY the valid JSON object, fixing any syntax errors. Do not add any explanation.\n\n${rawResponse}`,
          },
        ],
      });

      const repairBlock = repairMessage.content[0];
      if (repairBlock.type !== "text") throw new Error("Bad repair response");
      const repaired = extractJSON(repairBlock.text);
      parsed = JSON.parse(repaired);
    } catch (repairErr) {
      console.error("JSON repair failed:", repairErr);
      return NextResponse.json(
        {
          error:
            "AI returned malformed content. Please try again or simplify your request.",
        },
        { status: 502 }
      );
    }
  }

  // ── Validate against Zod schema ────────────────────────────────────────
  const validationResult = GenerateResponseSchema.safeParse(parsed);
  if (!validationResult.success) {
    console.error("Schema validation failed:", validationResult.error.flatten());
    return NextResponse.json(
      {
        error: "AI response did not match expected format. Please try again.",
        details:
          process.env.NODE_ENV === "development"
            ? validationResult.error.flatten()
            : undefined,
      },
      { status: 502 }
    );
  }

  const generated = validationResult.data;

  // ── Persist to database ────────────────────────────────────────────────
  try {
    const packDate = new Date();

    const contentPack = await prisma.contentPack.create({
      data: {
        campaignId: campaign.id,
        dayNumber: request.dayNumber,
        date: packDate,
        theme: request.theme,
        customContext: request.customContext,
        tone: request.tone,
        platforms: request.platforms,
        items: {
          create: generated.items.map((item) => ({
            platform: item.platform,
            slot: item.slot,
            scheduledTime: item.suggestedPostingTime,
            caption: item.caption,
            storyScript: item.storyScript,
            videoScript: item.videoScript,
            imageHint: item.imageHint,
            altText: item.altText,
            hashtags: item.hashtags,
            complianceChecklist: JSON.stringify(item.complianceChecklist),
            factualClaims: JSON.stringify(item.factualClaims),
            reviewNotes: item.reviewNotes,
            imprintReminder: item.imprintReminder,
            status: "needs_review", // Always starts as needs_review
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json(
      {
        success: true,
        contentPackId: contentPack.id,
        dayNumber: generated.dayNumber,
        theme: generated.theme,
        itemCount: contentPack.items.length,
        canvaTip: generated.canvaTip,
        engagementHook: generated.engagementHook,
        message: `Generated ${contentPack.items.length} items. All require human review before posting.`,
      },
      {
        headers: {
          "X-RateLimit-Remaining": String(rateLimit.remaining),
        },
      }
    );
  } catch (dbErr) {
    console.error("Database error saving content:", dbErr);
    return NextResponse.json(
      { error: "Failed to save generated content." },
      { status: 500 }
    );
  }
}
