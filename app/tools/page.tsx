// app/tools/page.tsx
import { ExternalLink, AlertCircle } from "lucide-react";

const TOOLS = [
  {
    name: "Your Facebook Page",
    url: "https://www.facebook.com/share/1BL6Z3vujf/",
    icon: "📘",
    category: "Campaign",
    desc: "Your live campaign page. Post approved content here daily.",
    free: true,
    note: "Manual posting required — this hub does not auto-post.",
  },
  {
    name: "Canva",
    url: "https://canva.com",
    icon: "🎨",
    category: "Design",
    desc: "Create graphics, story frames, and post images using your headshot and poster. Use the free plan — no paid tier needed.",
    free: true,
    note: "Use campaign colours: black #0a0a0a and gold #f5c518.",
  },
  {
    name: "CapCut",
    url: "https://capcut.com",
    icon: "🎬",
    category: "Video",
    desc: "Free video editor with AI auto-captions. Ideal for TikTok walk-and-talk clips.",
    free: true,
    note: "Record on phone, import to CapCut, add auto-captions, export.",
  },
  {
    name: "Meta Business Suite",
    url: "https://business.facebook.com",
    icon: "📊",
    category: "Scheduling",
    desc: "Officially schedule Facebook and Instagram posts together. Free. Use CSV export from this hub to plan your schedule.",
    free: true,
    note: "Requires a Facebook Business account connected to your page.",
  },
  {
    name: "Buffer",
    url: "https://buffer.com",
    icon: "📅",
    category: "Scheduling",
    desc: "Multi-channel scheduler. Free plan supports 3 channels and 10 queued posts. Import our CSV export directly.",
    free: true,
    note: "Free tier sufficient for a local election campaign.",
  },
  {
    name: "TikTok Creator Studio",
    url: "https://www.tiktok.com/creator-center",
    icon: "📱",
    category: "Scheduling",
    desc: "Schedule TikTok posts up to 10 days in advance. Completely free.",
    free: true,
    note: "Requires a TikTok Creator or Business account.",
  },
  {
    name: "Later",
    url: "https://later.com",
    icon: "🗓️",
    category: "Scheduling",
    desc: "Visual Instagram planner. Free tier available for basic scheduling.",
    free: true,
    note: "Good for visually planning your Instagram grid.",
  },
  {
    name: "Claude.ai",
    url: "https://claude.ai",
    icon: "🤖",
    category: "AI",
    desc: "Use the free Claude.ai interface to adapt, rephrase, or extend any generated post on the fly.",
    free: true,
    note: "This hub uses Claude's API on the server. Use claude.ai for quick ad-hoc edits.",
  },
];

const CATEGORIES = [...new Set(TOOLS.map(t => t.category))];

export default function ToolsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-campaign-gold">Free Tools</h1>
        <p className="text-campaign-muted mt-1">
          All tools below are free. None of them post automatically unless you configure API credentials separately.
        </p>
      </div>

      <div className="warning-banner flex gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm">
          <strong className="text-yellow-300">Manual posting required.</strong>{" "}
          This hub generates and exports content drafts. All posting must be done manually using the tools below, after human review and approval.
        </p>
      </div>

      {CATEGORIES.map(cat => (
        <div key={cat}>
          <h2 className="text-lg font-bold text-campaign-gold mb-3">{cat}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TOOLS.filter(t => t.category === cat).map(tool => (
              <a key={tool.name} href={tool.url} target="_blank" rel="noopener noreferrer"
                className="card flex flex-col gap-3 hover:border-campaign-gold transition-colors group">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{tool.icon}</span>
                    <div>
                      <div className="font-bold text-white group-hover:text-campaign-gold transition-colors flex items-center gap-2">
                        {tool.name}
                        <ExternalLink className="w-3 h-3 opacity-50" />
                      </div>
                      {tool.free && (
                        <span className="text-xs text-green-400 font-semibold">✓ Free</span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-campaign-muted leading-relaxed">{tool.desc}</p>
                {tool.note && (
                  <p className="text-xs text-yellow-400 bg-yellow-950/40 border border-yellow-800/40 rounded-lg px-3 py-2">
                    💡 {tool.note}
                  </p>
                )}
              </a>
            ))}
          </div>
        </div>
      ))}

      <div className="card border-campaign-gold/30 bg-campaign-gold/5">
        <h2 className="text-campaign-gold mb-3">Daily Workflow (45 min)</h2>
        <ol className="space-y-3">
          {[
            ["7:30am", "Generate today's content pack in this hub", "bg-campaign-gold text-black"],
            ["8:00am", "Review, edit, and approve each item in Content Review", "bg-campaign-gold text-black"],
            ["8:15am", "Export CSV or Markdown for approved posts", "bg-campaign-gold text-black"],
            ["8:20am", "Design images in Canva using your headshot & poster", "bg-campaign-gold text-black"],
            ["8:35am", "Schedule FB + IG posts in Meta Business Suite", "bg-campaign-gold text-black"],
            ["8:45am", "Schedule TikTok in TikTok Creator Studio", "bg-campaign-gold text-black"],
            ["12pm", "Reply to all comments & DMs across platforms", "bg-campaign-gold text-black"],
            ["7pm", "Post evening story live on all platforms", "bg-campaign-gold text-black"],
          ].map(([time, task, cls], i) => (
            <li key={i} className="flex items-start gap-3">
              <span className={`${cls} text-xs font-bold px-2 py-1 rounded whitespace-nowrap flex-shrink-0`}>
                {time}
              </span>
              <span className="text-sm text-white">{task}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
