"use client";
// app/generate/page.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Zap, CheckSquare } from "lucide-react";

const THEMES = [
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
];

const TONES = [
  { value: "informative", label: "Informative — Facts & updates" },
  { value: "community_update", label: "Community Update — Local focus" },
  { value: "call_to_action", label: "Call to Action — Vote / share / engage" },
  { value: "listening_post", label: "Listening Post — Asking residents" },
  { value: "personal_update", label: "Personal Update — From the candidate" },
];

const PLATFORMS = [
  { value: "all", label: "All Platforms (9 posts)" },
  { value: "facebook", label: "Facebook only (3 posts)" },
  { value: "instagram", label: "Instagram only (3 posts)" },
  { value: "tiktok", label: "TikTok only (3 posts)" },
];

const DEFAULT_COMPLIANCE = {
  includeImprintReminder: true,
  requireFactualClaimReview: true,
  avoidPersonalAttacks: true,
  avoidUnsupportedClaims: true,
  avoidProtectedCharacteristics: true,
  requireHumanApproval: true,
};

export default function GeneratePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    contentPackId: string;
    itemCount: number;
    message: string;
    canvaTip?: string;
    engagementHook?: string;
  } | null>(null);

  const [form, setForm] = useState({
    dayNumber: 1,
    theme: THEMES[0],
    customContext: "",
    tone: "informative",
    platforms: "all",
    compliance: DEFAULT_COMPLIANCE,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: "default-campaign",
          ...form,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Generation failed");
        return;
      }

      setResult(data);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCompliance = (key: keyof typeof DEFAULT_COMPLIANCE) => {
    setForm((prev) => ({
      ...prev,
      compliance: { ...prev.compliance, [key]: !prev.compliance[key] },
    }));
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-campaign-gold">Generate Content Pack</h1>
        <p className="text-campaign-muted mt-1">
          AI-generated drafts for human review. No content is published automatically.
        </p>
      </div>

      {/* Warning */}
      <div className="warning-banner flex gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-bold text-yellow-300">Important</p>
          <p>
            Generated content is saved as drafts requiring human review and approval
            before any export or scheduling. Content is not posted automatically.
          </p>
        </div>
      </div>

      {/* Success result */}
      {result && (
        <div className="bg-green-950 border border-green-700 rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-green-300 font-bold">
            <CheckSquare className="w-5 h-5" />
            {result.message}
          </div>
          {result.canvaTip && (
            <p className="text-sm text-green-200">
              🎨 <strong>Canva tip:</strong> {result.canvaTip}
            </p>
          )}
          {result.engagementHook && (
            <p className="text-sm text-green-200">
              💬 <strong>Engagement hook:</strong> {result.engagementHook}
            </p>
          )}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => router.push(`/content?pack=${result.contentPackId}`)}
              className="btn-primary text-sm"
            >
              Review Generated Content →
            </button>
            <button
              onClick={() => setResult(null)}
              className="btn-secondary text-sm"
            >
              Generate Another
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="compliance-banner flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Day number */}
        <div>
          <label className="label">Campaign Day Number</label>
          <input
            type="number"
            min={1}
            max={365}
            value={form.dayNumber}
            onChange={(e) =>
              setForm((p) => ({ ...p, dayNumber: parseInt(e.target.value) || 1 }))
            }
            className="input"
          />
        </div>

        {/* Theme */}
        <div>
          <label className="label">Today&apos;s Theme</label>
          <select
            value={form.theme}
            onChange={(e) => setForm((p) => ({ ...p, theme: e.target.value }))}
            className="select"
          >
            {THEMES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Tone */}
        <div>
          <label className="label">Post Tone / Style</label>
          <select
            value={form.tone}
            onChange={(e) => setForm((p) => ({ ...p, tone: e.target.value }))}
            className="select"
          >
            {TONES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Platform */}
        <div>
          <label className="label">Platform</label>
          <select
            value={form.platforms}
            onChange={(e) => setForm((p) => ({ ...p, platforms: e.target.value }))}
            className="select"
          >
            {PLATFORMS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Custom context */}
        <div>
          <label className="label">
            Custom Local Context{" "}
            <span className="text-campaign-muted font-normal normal-case tracking-normal">
              (optional)
            </span>
          </label>
          <textarea
            value={form.customContext}
            onChange={(e) =>
              setForm((p) => ({ ...p, customContext: e.target.value }))
            }
            rows={3}
            maxLength={500}
            placeholder="e.g. Knocked on 80 doors in Bromford estate today. Residents concerned about pothole on Farnham Road..."
            className="input resize-none"
          />
          <p className="text-xs text-campaign-muted mt-1">
            {form.customContext.length}/500 characters
          </p>
        </div>

        {/* Compliance toggles */}
        <div>
          <label className="label">Compliance & Safety Toggles</label>
          <div className="space-y-3">
            {(
              Object.entries(form.compliance) as [
                keyof typeof DEFAULT_COMPLIANCE,
                boolean
              ][]
            ).map(([key, val]) => {
              const labels: Record<keyof typeof DEFAULT_COMPLIANCE, string> = {
                includeImprintReminder: "Include imprint reminder in every post",
                requireFactualClaimReview: "Flag all factual claims for verification",
                avoidPersonalAttacks: "Avoid personal attacks",
                avoidUnsupportedClaims: "Avoid unsupported statistical claims",
                avoidProtectedCharacteristics:
                  "Avoid targeting protected characteristics",
                requireHumanApproval:
                  "Require human approval before export (recommended)",
              };

              const isRequired = key === "requireHumanApproval" || key === "includeImprintReminder";

              return (
                <label
                  key={key}
                  className={`flex items-center gap-3 p-3 rounded-lg bg-campaign-black border ${
                    val ? "border-campaign-gold/40" : "border-campaign-border"
                  } ${isRequired ? "opacity-90" : "cursor-pointer"}`}
                >
                  <input
                    type="checkbox"
                    checked={val}
                    onChange={() => !isRequired && toggleCompliance(key)}
                    disabled={isRequired}
                    className="accent-campaign-gold w-4 h-4"
                  />
                  <span className="text-sm text-white">{labels[key]}</span>
                  {isRequired && (
                    <span className="ml-auto text-xs text-yellow-400">
                      Required
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
              Generating content — this may take 20–40 seconds...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Generate Content Pack
            </>
          )}
        </button>
      </form>
    </div>
  );
}
