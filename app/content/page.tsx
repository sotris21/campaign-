"use client";

// app/content/page.tsx
import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  CheckCircle,
  XCircle,
  Edit3,
  Download,
  Archive,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CopyButton } from "@/components/ui/CopyButton";
import { showToast } from "@/components/ui/Toaster";
import type { ContentStatusType } from "@/lib/schemas";

interface ContentItem {
  id: string;
  platform: string;
  slot: string;
  scheduledTime?: string;
  caption: string;
  storyScript?: string;
  videoScript?: string;
  imageHint?: string;
  altText?: string;
  hashtags?: string;
  complianceChecklist?: string;
  factualClaims?: string;
  reviewNotes?: string;
  imprintReminder?: string;
  status: string;
}

interface ContentPack {
  id: string;
  dayNumber: number;
  date: string;
  theme: string;
  customContext?: string;
  items: ContentItem[];
}

const SLOT_ORDER = ["morning", "afternoon", "evening"];
const PLATFORM_ORDER = ["facebook", "instagram", "tiktok"];

const SLOT_EMOJI: Record<string, string> = {
  morning: "🌅",
  afternoon: "☀️",
  evening: "🌆",
};

const PLATFORM_ICON: Record<string, string> = {
  facebook: "📘",
  instagram: "📸",
  tiktok: "🎵",
};

export default function ContentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const packIdParam = searchParams.get("pack");

  const [packs, setPacks] = useState<ContentPack[]>([]);
  const [selectedPack, setSelectedPack] = useState<ContentPack | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<ContentItem>>({});
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchPacks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/content?campaignId=default-campaign");
      const data = await res.json();
      setPacks(data);
      if (packIdParam) {
        const found = data.find((p: ContentPack) => p.id === packIdParam);
        if (found) setSelectedPack(found);
      } else if (data.length > 0) {
        setSelectedPack(data[0]);
      }
    } catch {
      showToast("Failed to load content", "error");
    }
    setLoading(false);
  }, [packIdParam]);

  useEffect(() => { fetchPacks(); }, [fetchPacks]);

  const reviewAction = async (
    itemId: string,
    action: "approve" | "reject" | "note" | "edit",
    extra?: Partial<ContentItem> & { notes?: string }
  ) => {
    const res = await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentItemId: itemId, action, ...extra }),
    });
    const data = await res.json();
    if (res.ok) {
      showToast(`Item ${action}d successfully`, "success");
      fetchPacks();
      setEditingItem(null);
    } else {
      showToast(data.error ?? "Action failed", "error");
    }
  };

  const handleExport = async (format: "csv" | "json" | "markdown") => {
    if (!selectedPack) return;
    setExportLoading(true);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentPackId: selectedPack.id,
          format,
          includeStatuses: ["approved"],
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        showToast(err.error ?? "Export failed", "error");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `campaign-day${selectedPack.dayNumber}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Exported as ${format.toUpperCase()}`, "success");
      fetchPacks();
    } catch {
      showToast("Export failed", "error");
    }
    setExportLoading(false);
  };

  const filteredItems = selectedPack?.items.filter((item) => {
    if (filterPlatform !== "all" && item.platform !== filterPlatform) return false;
    if (filterStatus !== "all" && item.status !== filterStatus) return false;
    return true;
  }) ?? [];

  const sortedItems = [...filteredItems].sort((a, b) => {
    const platformDiff = PLATFORM_ORDER.indexOf(a.platform) - PLATFORM_ORDER.indexOf(b.platform);
    if (platformDiff !== 0) return platformDiff;
    return SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-campaign-gold/30 border-t-campaign-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-campaign-gold">Content Review</h1>
          <p className="text-campaign-muted mt-1">
            Review, edit, approve, or reject generated content before export.
          </p>
        </div>
        {selectedPack && (
          <div className="flex gap-2">
            <button
              onClick={() => handleExport("markdown")}
              disabled={exportLoading}
              className="btn-secondary text-sm flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> MD
            </button>
            <button
              onClick={() => handleExport("csv")}
              disabled={exportLoading}
              className="btn-secondary text-sm flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> CSV
            </button>
            <button
              onClick={() => handleExport("json")}
              disabled={exportLoading}
              className="btn-secondary text-sm flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> JSON
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Pack selector sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-3">
            <h3 className="text-sm font-bold text-campaign-muted uppercase tracking-widest mb-3">
              Content Packs
            </h3>
            {packs.length === 0 ? (
              <p className="text-sm text-campaign-muted text-center py-4">
                No packs yet.{" "}
                <a href="/generate" className="text-campaign-gold hover:underline">
                  Generate one →
                </a>
              </p>
            ) : (
              <div className="space-y-2">
                {packs.map((pack) => {
                  const pending = pack.items.filter((i) => i.status === "needs_review").length;
                  return (
                    <button
                      key={pack.id}
                      onClick={() => {
                        setSelectedPack(pack);
                        router.push(`/content?pack=${pack.id}`, { scroll: false });
                      }}
                      className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${
                        selectedPack?.id === pack.id
                          ? "border-campaign-gold bg-campaign-gold/10"
                          : "border-campaign-border hover:border-campaign-gold/50"
                      }`}
                    >
                      <div className="font-semibold">Day {pack.dayNumber}</div>
                      <div className="text-xs text-campaign-muted truncate">{pack.theme}</div>
                      <div className="text-xs text-campaign-muted">
                        {format(new Date(pack.date), "d MMM")} · {pack.items.length} posts
                      </div>
                      {pending > 0 && (
                        <span className="badge-needs_review badge mt-1">{pending} pending</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Content items */}
        <div className="lg:col-span-3 space-y-4">
          {!selectedPack ? (
            <div className="card text-center py-12 text-campaign-muted">
              Select a content pack from the sidebar.
            </div>
          ) : (
            <>
              {/* Pack header + filters */}
              <div className="card">
                <h2 className="text-campaign-gold">
                  Day {selectedPack.dayNumber} — {selectedPack.theme}
                </h2>
                <p className="text-sm text-campaign-muted mt-1">
                  {format(new Date(selectedPack.date), "EEEE d MMMM yyyy")} ·{" "}
                  {selectedPack.items.length} items
                </p>
                {selectedPack.customContext && (
                  <p className="text-sm text-white mt-2 bg-campaign-black rounded-lg p-3">
                    Context: {selectedPack.customContext}
                  </p>
                )}
                <div className="flex gap-3 mt-4">
                  <select
                    value={filterPlatform}
                    onChange={(e) => setFilterPlatform(e.target.value)}
                    className="select text-sm py-1.5"
                  >
                    <option value="all">All Platforms</option>
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="select text-sm py-1.5"
                  >
                    <option value="all">All Statuses</option>
                    <option value="needs_review">Needs Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="exported">Exported</option>
                  </select>
                </div>
              </div>

              {sortedItems.length === 0 && (
                <div className="card text-center py-8 text-campaign-muted">
                  No items match your filters.
                </div>
              )}

              {sortedItems.map((item) => {
                const isExpanded = expandedItems.has(item.id);
                const isEditing = editingItem === item.id;
                const compliance = item.complianceChecklist
                  ? JSON.parse(item.complianceChecklist)
                  : null;
                const claims = item.factualClaims
                  ? (JSON.parse(item.factualClaims) as string[])
                  : [];

                return (
                  <div
                    key={item.id}
                    className={`card border ${
                      item.status === "approved"
                        ? "border-green-800"
                        : item.status === "rejected"
                        ? "border-red-900"
                        : item.status === "needs_review"
                        ? "border-yellow-800"
                        : "border-campaign-border"
                    }`}
                  >
                    {/* Item header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {PLATFORM_ICON[item.platform]}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold capitalize">
                              {item.platform}
                            </span>
                            <span className="text-campaign-muted">·</span>
                            <span className="text-campaign-muted capitalize">
                              {SLOT_EMOJI[item.slot]} {item.slot}
                            </span>
                            {item.scheduledTime && (
                              <>
                                <span className="text-campaign-muted">·</span>
                                <span className="text-xs text-campaign-muted">
                                  {item.scheduledTime}
                                </span>
                              </>
                            )}
                          </div>
                          <StatusBadge status={item.status as ContentStatusType} />
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const next = new Set(expandedItems);
                          if (isExpanded) next.delete(item.id);
                          else next.add(item.id);
                          setExpandedItems(next);
                        }}
                        className="text-campaign-muted hover:text-white"
                      >
                        {isExpanded ? <ChevronUp /> : <ChevronDown />}
                      </button>
                    </div>

                    {/* Caption preview */}
                    <div className="mt-3 p-3 bg-campaign-black rounded-lg">
                      <p className="text-sm text-white whitespace-pre-wrap">
                        {item.caption}
                      </p>
                      {item.hashtags && (
                        <p className="text-xs text-blue-400 mt-2">{item.hashtags}</p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {item.status !== "approved" && (
                        <button
                          onClick={() => reviewAction(item.id, "approve")}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-950 border border-green-700 text-green-300 hover:bg-green-900 transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
                      )}
                      {item.status !== "rejected" && (
                        <button
                          onClick={() => reviewAction(item.id, "reject")}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-950 border border-red-700 text-red-300 hover:bg-red-900 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditingItem(isEditing ? null : item.id);
                          setEditValues({
                            caption: item.caption,
                            storyScript: item.storyScript,
                            hashtags: item.hashtags,
                          });
                        }}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-campaign-dark border border-campaign-border text-white hover:border-campaign-gold transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <CopyButton text={item.caption} label="Copy Caption" />
                      {item.hashtags && (
                        <CopyButton text={item.hashtags} label="Copy Tags" />
                      )}
                      <button
                        onClick={() => reviewAction(item.id, "note", { notes: "Archived by reviewer" })}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-campaign-dark border border-campaign-border text-campaign-muted hover:text-white transition-colors"
                      >
                        <Archive className="w-3.5 h-3.5" /> Archive
                      </button>
                    </div>

                    {/* Edit form */}
                    {isEditing && (
                      <div className="mt-4 space-y-3 border-t border-campaign-border pt-4">
                        <div>
                          <label className="label">Edit Caption</label>
                          <textarea
                            value={editValues.caption ?? ""}
                            onChange={(e) =>
                              setEditValues((p) => ({ ...p, caption: e.target.value }))
                            }
                            rows={4}
                            className="input resize-none"
                          />
                        </div>
                        <div>
                          <label className="label">Edit Hashtags</label>
                          <input
                            type="text"
                            value={editValues.hashtags ?? ""}
                            onChange={(e) =>
                              setEditValues((p) => ({ ...p, hashtags: e.target.value }))
                            }
                            className="input"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              reviewAction(item.id, "edit", {
                                caption: editValues.caption,
                                storyScript: editValues.storyScript,
                                hashtags: editValues.hashtags,
                              })
                            }
                            className="btn-primary text-sm"
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={() => setEditingItem(null)}
                            className="btn-secondary text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="mt-4 border-t border-campaign-border pt-4 space-y-4">
                        {item.storyScript && (
                          <div>
                            <label className="label">Story Script</label>
                            <p className="text-sm text-white bg-campaign-black rounded-lg p-3 whitespace-pre-wrap">
                              {item.storyScript}
                            </p>
                            <div className="mt-1">
                              <CopyButton text={item.storyScript} label="Copy Story" />
                            </div>
                          </div>
                        )}
                        {item.videoScript && (
                          <div>
                            <label className="label">TikTok Video Script</label>
                            <p className="text-sm text-white bg-campaign-black rounded-lg p-3 whitespace-pre-wrap">
                              {item.videoScript}
                            </p>
                          </div>
                        )}
                        {item.imageHint && (
                          <div>
                            <label className="label">Image Guidance</label>
                            <p className="text-sm text-campaign-muted">{item.imageHint}</p>
                          </div>
                        )}
                        {item.altText && (
                          <div>
                            <label className="label">Alt Text (Accessibility)</label>
                            <p className="text-sm text-campaign-muted">{item.altText}</p>
                          </div>
                        )}

                        {/* Factual claims */}
                        {claims.length > 0 && (
                          <div>
                            <label className="label">Factual Claims — Verify Before Publishing</label>
                            <ul className="space-y-1">
                              {claims.map((claim, i) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-2 text-sm text-yellow-200 bg-yellow-950/50 border border-yellow-800 rounded-lg p-2"
                                >
                                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-400" />
                                  {claim}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Imprint reminder */}
                        {item.imprintReminder && (
                          <div className="compliance-banner flex gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs">{item.imprintReminder}</p>
                          </div>
                        )}

                        {/* Review notes */}
                        <div>
                          <label className="label">Add Review Note</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Add a note for the team..."
                              className="input text-sm"
                              id={`note-${item.id}`}
                            />
                            <button
                              onClick={() => {
                                const el = document.getElementById(`note-${item.id}`) as HTMLInputElement;
                                if (el?.value) {
                                  reviewAction(item.id, "note", { notes: el.value });
                                  el.value = "";
                                }
                              }}
                              className="btn-secondary text-sm flex items-center gap-1"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          </div>
                          {item.reviewNotes && (
                            <p className="text-xs text-campaign-muted mt-2 bg-campaign-black p-2 rounded">
                              Note: {item.reviewNotes}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
