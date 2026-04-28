// app/page.tsx
import { prisma } from "@/lib/prisma";
import { differenceInCalendarDays, format } from "date-fns";
import Link from "next/link";
import {
  Zap,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Calendar,
  TrendingUp,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Load campaign
  const campaign = await prisma.campaign.findFirst({
    include: { assets: true },
  });

  const daysToElection = campaign
    ? Math.max(0, differenceInCalendarDays(campaign.electionDate, new Date()))
    : 0;

  // Load stats
  const [totalPacks, totalItems, pendingItems, approvedItems, recentPacks] =
    await Promise.all([
      prisma.contentPack.count(),
      prisma.contentItem.count(),
      prisma.contentItem.count({ where: { status: "needs_review" } }),
      prisma.contentItem.count({ where: { status: "approved" } }),
      prisma.contentPack.findMany({
        take: 5,
        orderBy: { date: "desc" },
        include: {
          items: {
            select: { status: true, platform: true },
          },
        },
      }),
    ]);

  const quickLinks = [
    {
      label: "Facebook Page",
      href: campaign?.facebookPageUrl ?? "https://facebook.com",
      desc: "View your live campaign page",
      external: true,
    },
    {
      label: "Canva",
      href: "https://canva.com",
      desc: "Design images & stories",
      external: true,
    },
    {
      label: "Meta Business Suite",
      href: "https://business.facebook.com",
      desc: "Schedule FB + IG together",
      external: true,
    },
    {
      label: "TikTok Creator Studio",
      href: "https://www.tiktok.com/creator-center",
      desc: "Schedule TikTok content",
      external: true,
    },
    {
      label: "CapCut",
      href: "https://capcut.com",
      desc: "Free video editor",
      external: true,
    },
    {
      label: "Buffer",
      href: "https://buffer.com",
      desc: "Multi-channel scheduling",
      external: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-serif text-campaign-gold">
            Campaign Hub
          </h1>
          <p className="text-campaign-muted mt-1">
            {campaign?.candidateName} · {campaign?.partyName} ·{" "}
            {campaign?.ward}
          </p>
        </div>
        <Link href="/generate" className="btn-primary inline-flex items-center gap-2">
          <Zap className="w-4 h-4" /> Generate Today&apos;s Content
        </Link>
      </div>

      {/* Compliance warning */}
      <div className="warning-banner flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-yellow-300">Human Review Required</p>
          <p>
            All AI-generated content must be reviewed and approved by a human
            before posting. This tool exports drafts only — it does not
            automatically publish anything.
          </p>
        </div>
      </div>

      {/* Election countdown */}
      <div className="card bg-gradient-to-r from-campaign-dark to-black border-campaign-gold/30">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="text-center md:text-left">
            <div className="text-6xl font-black text-campaign-gold font-serif">
              {daysToElection}
            </div>
            <div className="text-xl text-white font-semibold">days to election</div>
            <div className="text-campaign-muted text-sm mt-1">
              {campaign?.electionDate
                ? format(campaign.electionDate, "EEEE d MMMM yyyy")
                : "7 May 2026"}
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "Content Packs", value: totalPacks, icon: FileText, colour: "text-blue-400" },
              { label: "Total Posts", value: totalItems, icon: TrendingUp, colour: "text-campaign-gold" },
              { label: "Pending Review", value: pendingItems, icon: Clock, colour: "text-yellow-400" },
              { label: "Approved", value: approvedItems, icon: CheckCircle, colour: "text-green-400" },
            ].map(({ label, value, icon: Icon, colour }) => (
              <div key={label} className="bg-campaign-black/60 rounded-xl p-4 text-center">
                <Icon className={`w-6 h-6 mx-auto mb-2 ${colour}`} />
                <div className="text-2xl font-black text-white">{value}</div>
                <div className="text-xs text-campaign-muted">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two column: recent packs + quick links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent content packs */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-campaign-gold">Recent Content Packs</h2>
            <Link href="/content" className="text-xs text-campaign-muted hover:text-campaign-gold">
              View all →
            </Link>
          </div>
          {recentPacks.length === 0 ? (
            <div className="text-center py-8 text-campaign-muted">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No content packs yet.</p>
              <Link href="/generate" className="text-campaign-gold hover:underline text-sm">
                Generate your first pack →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPacks.map((pack) => {
                const approved = pack.items.filter((i) => i.status === "approved").length;
                const pending = pack.items.filter((i) => i.status === "needs_review").length;
                return (
                  <Link
                    key={pack.id}
                    href={`/content?pack=${pack.id}`}
                    className="flex items-center justify-between p-3 bg-campaign-black rounded-lg hover:border-campaign-gold border border-transparent transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-sm">
                        Day {pack.dayNumber} — {pack.theme}
                      </div>
                      <div className="text-xs text-campaign-muted">
                        {format(pack.date, "d MMM yyyy")} · {pack.items.length} items
                      </div>
                    </div>
                    <div className="flex gap-2 text-xs">
                      {approved > 0 && (
                        <span className="badge-approved badge">{approved} approved</span>
                      )}
                      {pending > 0 && (
                        <span className="badge-needs_review badge">{pending} pending</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="card">
          <h2 className="text-campaign-gold mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickLinks.map(({ label, href, desc, external }) => (
              <a
                key={label}
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className="flex flex-col p-3 bg-campaign-black rounded-lg border border-campaign-border hover:border-campaign-gold transition-colors group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm group-hover:text-campaign-gold transition-colors">
                    {label}
                  </span>
                  {external && <ExternalLink className="w-3 h-3 text-campaign-muted" />}
                </div>
                <span className="text-xs text-campaign-muted">{desc}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Pending approvals callout */}
      {pendingItems > 0 && (
        <div className="card border-yellow-700 bg-yellow-950/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="font-bold text-yellow-300">
                  {pendingItems} item{pendingItems !== 1 ? "s" : ""} awaiting review
                </p>
                <p className="text-xs text-yellow-400/70">
                  Content must be approved before it can be exported or scheduled.
                </p>
              </div>
            </div>
            <Link href="/content" className="btn-primary text-sm">
              Review Now
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
