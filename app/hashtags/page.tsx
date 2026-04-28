"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Copy, Check } from "lucide-react";
import { showToast } from "@/components/ui/Toaster";

interface Hashtag { id: string; tag: string; platforms: string; group?: string; }

const PLATFORM_TABS = [
  { key: "all", label: "All" },
  { key: "facebook", label: "📘 Facebook" },
  { key: "instagram", label: "📸 Instagram" },
  { key: "tiktok", label: "🎵 TikTok" },
];

const PLATFORM_LIMITS: Record<string, string> = {
  all: "Platform guidelines: Facebook 3–6, Instagram 8–12, TikTok 3–5",
  facebook: "Facebook: Use 3–6 hashtags per post for best reach.",
  instagram: "Instagram: Use 8–12 hashtags. Mix broad and local tags.",
  tiktok: "TikTok: Keep it to 3–5 hashtags only.",
};

export default function HashtagsPage() {
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [filter, setFilter] = useState("all");
  const [newTag, setNewTag] = useState("#");
  const [newPlatforms, setNewPlatforms] = useState("all");
  const [loading, setLoading] = useState(true);
  const [copiedAll, setCopiedAll] = useState(false);

  const fetchHashtags = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/hashtags?campaignId=default-campaign`);
    const data = await res.json();
    setHashtags(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchHashtags(); }, [fetchHashtags]);

  const filtered = hashtags.filter(h =>
    filter === "all" ? true : h.platforms === "all" || h.platforms.includes(filter)
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.startsWith("#") || newTag.length < 2) {
      showToast("Hashtag must start with # and have content", "error");
      return;
    }
    const res = await fetch("/api/hashtags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId: "default-campaign", tag: newTag.trim(), platforms: newPlatforms }),
    });
    if (res.ok) {
      showToast("Hashtag added", "success");
      setNewTag("#");
      fetchHashtags();
    } else {
      const err = await res.json();
      showToast(err.error ?? "Failed to add", "error");
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/hashtags?id=${id}`, { method: "DELETE" });
    if (res.ok) { showToast("Removed", "success"); fetchHashtags(); }
  };

  const copyAll = () => {
    navigator.clipboard.writeText(filtered.map(h => h.tag).join(" "));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-campaign-gold">Hashtag Bank</h1>
        <p className="text-campaign-muted mt-1">Manage your campaign hashtags by platform. Click any tag to copy it.</p>
      </div>

      {/* Platform tabs */}
      <div className="flex gap-2 flex-wrap">
        {PLATFORM_TABS.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === t.key ? "bg-campaign-gold text-black" : "btn-secondary"}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-yellow-950/40 border border-yellow-800 rounded-lg p-3 text-xs text-yellow-300">
        💡 {PLATFORM_LIMITS[filter]}
      </div>

      {/* Tag cloud */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-campaign-muted uppercase tracking-widest">
            {filtered.length} tags
          </h3>
          <button onClick={copyAll}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${copiedAll ? "bg-green-900 text-green-300" : "btn-secondary"}`}>
            {copiedAll ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy All</>}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-campaign-gold/30 border-t-campaign-gold rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {filtered.map(h => (
              <div key={h.id} className="group flex items-center gap-1">
                <button
                  onClick={() => { navigator.clipboard.writeText(h.tag); showToast(`Copied ${h.tag}`, "success"); }}
                  className="px-3 py-1.5 bg-campaign-black border border-campaign-border rounded-full text-sm text-campaign-gold font-semibold hover:border-campaign-gold hover:bg-campaign-gold/10 transition-colors">
                  {h.tag}
                </button>
                <button onClick={() => handleDelete(h.id)}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-opacity p-1">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            {filtered.length === 0 && <p className="text-campaign-muted text-sm">No hashtags for this filter.</p>}
          </div>
        )}
      </div>

      {/* Add new */}
      <div className="card">
        <h3 className="text-sm font-bold text-campaign-muted uppercase tracking-widest mb-4">Add Hashtag</h3>
        <form onSubmit={handleAdd} className="flex gap-3 flex-wrap">
          <input value={newTag} onChange={e => setNewTag(e.target.value)}
            placeholder="#YourTag" className="input flex-1 min-w-[180px]" />
          <select value={newPlatforms} onChange={e => setNewPlatforms(e.target.value)} className="select w-40">
            <option value="all">All platforms</option>
            <option value="facebook">Facebook only</option>
            <option value="instagram">Instagram only</option>
            <option value="tiktok">TikTok only</option>
          </select>
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add
          </button>
        </form>
      </div>
    </div>
  );
}
