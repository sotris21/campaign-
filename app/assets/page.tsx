"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Upload, Trash2, Image as ImageIcon, AlertCircle } from "lucide-react";
import { showToast } from "@/components/ui/Toaster";

interface Asset { id: string; type: string; filename: string; url: string; altText?: string; createdAt: string; }

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [type, setType] = useState<"headshot" | "poster" | "other">("headshot");
  const [altText, setAltText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/assets?campaignId=default-campaign");
    const data = await res.json();
    setAssets(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) { showToast("Select a file first", "error"); return; }
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("campaignId", "default-campaign");
    fd.append("type", type);
    fd.append("altText", altText);
    const res = await fetch("/api/assets", { method: "POST", body: fd });
    if (res.ok) {
      showToast("Asset uploaded successfully", "success");
      setAltText("");
      if (fileRef.current) fileRef.current.value = "";
      fetchAssets();
    } else {
      const err = await res.json();
      showToast(err.error ?? "Upload failed", "error");
    }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this asset?")) return;
    const res = await fetch(`/api/assets?id=${id}`, { method: "DELETE" });
    if (res.ok) { showToast("Asset deleted", "success"); fetchAssets(); }
  };

  const typeColour: Record<string, string> = {
    headshot: "bg-blue-900/40 border-blue-700 text-blue-300",
    poster: "bg-purple-900/40 border-purple-700 text-purple-300",
    other: "bg-gray-900/40 border-gray-700 text-gray-300",
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-campaign-gold">Campaign Assets</h1>
        <p className="text-campaign-muted mt-1">Upload your headshot and campaign poster. These guide AI image suggestions in generated posts.</p>
      </div>

      <div className="warning-banner flex gap-3 text-sm">
        <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
        <p>Images are stored locally in <code className="bg-black/40 px-1 rounded">/public/uploads/</code>. For production, configure cloud storage (S3, Cloudflare R2, or Vercel Blob) via environment variables.</p>
      </div>

      {/* Upload form */}
      <div className="card">
        <h2 className="text-campaign-gold mb-4">Upload Asset</h2>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="label">Asset Type</label>
            <select value={type} onChange={e => setType(e.target.value as typeof type)} className="select">
              <option value="headshot">Candidate Headshot</option>
              <option value="poster">Campaign Poster</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="label">Image File (JPEG, PNG, WebP — max 10MB)</label>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
              className="block w-full text-sm text-campaign-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-campaign-gold file:text-black hover:file:bg-gold-600 cursor-pointer" />
          </div>
          <div>
            <label className="label">Alt Text (Accessibility)</label>
            <input type="text" value={altText} onChange={e => setAltText(e.target.value)}
              placeholder="e.g. Andreas Karagiannopoulos, Reform UK candidate, standing in a park"
              className="input" maxLength={200} />
          </div>
          <button type="submit" disabled={uploading} className="btn-primary flex items-center gap-2">
            {uploading ? <><span className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4" /> Upload Asset</>}
          </button>
        </form>
      </div>

      {/* Asset grid */}
      <div className="card">
        <h2 className="text-campaign-gold mb-4">Uploaded Assets</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-campaign-gold/30 border-t-campaign-gold rounded-full animate-spin" />
          </div>
        ) : assets.length === 0 ? (
          <div className="text-center py-12 text-campaign-muted">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No assets uploaded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {assets.map(asset => (
              <div key={asset.id} className="bg-campaign-black rounded-xl border border-campaign-border overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset.url} alt={asset.altText ?? asset.filename}
                  className="w-full h-40 object-cover" />
                <div className="p-3">
                  <div className={`badge border text-xs mb-2 ${typeColour[asset.type] ?? typeColour.other}`}>
                    {asset.type}
                  </div>
                  <p className="text-xs text-campaign-muted truncate">{asset.filename}</p>
                  {asset.altText && <p className="text-xs text-campaign-muted mt-1 line-clamp-2">{asset.altText}</p>}
                  <button onClick={() => handleDelete(asset.id)}
                    className="mt-3 flex items-center gap-1 text-xs text-red-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
