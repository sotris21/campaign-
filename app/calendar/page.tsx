"use client";
import { useState, useEffect, useCallback } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { ContentStatusType } from "@/lib/schemas";

interface ContentItem { id: string; platform: string; slot: string; status: string; caption: string; }
interface ContentPack { id: string; dayNumber: number; date: string; theme: string; items: ContentItem[]; }

const PLATFORM_ICON: Record<string, string> = { facebook: "📘", instagram: "📸", tiktok: "🎵" };

export default function CalendarPage() {
  const [packs, setPacks] = useState<ContentPack[]>([]);
  const [viewDate, setViewDate] = useState(new Date());
  const [selected, setSelected] = useState<ContentPack | null>(null);
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchPacks = useCallback(async () => {
    const res = await fetch("/api/content?campaignId=default-campaign");
    const data = await res.json();
    setPacks(data);
  }, []);

  useEffect(() => { fetchPacks(); }, [fetchPacks]);

  const days = eachDayOfInterval({ start: startOfMonth(viewDate), end: endOfMonth(viewDate) });
  const firstDayOffset = (startOfMonth(viewDate).getDay() + 6) % 7; // Mon-start

  const getPacksForDay = (day: Date) =>
    packs.filter(p => isSameDay(new Date(p.date), day));

  const filteredItems = (selected?.items ?? []).filter(i =>
    (filterPlatform === "all" || i.platform === filterPlatform) &&
    (filterStatus === "all" || i.status === filterStatus)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-campaign-gold">Content Calendar</h1>
        <p className="text-campaign-muted mt-1">View all generated content packs by date. Click a date to review items.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 card">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1))} className="btn-ghost p-2">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-campaign-gold">{format(viewDate, "MMMM yyyy")}</h2>
            <button onClick={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1))} className="btn-ghost p-2">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
              <div key={d} className="text-center text-xs font-bold text-campaign-muted py-1">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOffset }).map((_, i) => <div key={`pad-${i}`} />)}
            {days.map(day => {
              const dayPacks = getPacksForDay(day);
              const isToday = isSameDay(day, new Date());
              const hasSelected = selected && isSameDay(new Date(selected.date), day);
              return (
                <button key={day.toISOString()}
                  onClick={() => dayPacks[0] && setSelected(dayPacks[0])}
                  className={`relative aspect-square rounded-lg border text-sm flex flex-col items-center justify-start p-1 transition-colors ${
                    hasSelected ? "border-campaign-gold bg-campaign-gold/10" :
                    dayPacks.length > 0 ? "border-campaign-border hover:border-campaign-gold cursor-pointer" :
                    "border-transparent cursor-default"
                  } ${isToday ? "ring-1 ring-campaign-gold" : ""}`}>
                  <span className={`text-xs font-bold ${isToday ? "text-campaign-gold" : "text-campaign-muted"}`}>
                    {format(day, "d")}
                  </span>
                  {dayPacks.length > 0 && (
                    <div className="mt-0.5 flex gap-0.5 flex-wrap justify-center">
                      {dayPacks.slice(0, 3).map(p => (
                        <span key={p.id} className="w-1.5 h-1.5 rounded-full bg-campaign-gold block" />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected pack detail */}
        <div className="card overflow-y-auto max-h-[500px]">
          {!selected ? (
            <div className="text-center py-12 text-campaign-muted">
              <p>Click a date with content to view items.</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <h3 className="font-bold text-campaign-gold">Day {selected.dayNumber}</h3>
                <p className="text-sm text-campaign-muted">{selected.theme}</p>
                <p className="text-xs text-campaign-muted">{format(new Date(selected.date), "d MMMM yyyy")}</p>
              </div>
              <div className="flex gap-2 mb-3">
                <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)} className="select text-xs py-1">
                  <option value="all">All</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                </select>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="select text-xs py-1">
                  <option value="all">All statuses</option>
                  <option value="needs_review">Needs review</option>
                  <option value="approved">Approved</option>
                </select>
              </div>
              <div className="space-y-3">
                {filteredItems.map(item => (
                  <div key={item.id} className="bg-campaign-black rounded-lg p-3 border border-campaign-border">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{PLATFORM_ICON[item.platform]}</span>
                      <span className="text-xs font-bold capitalize text-white">{item.platform} · {item.slot}</span>
                      <StatusBadge status={item.status as ContentStatusType} />
                    </div>
                    <p className="text-xs text-campaign-muted line-clamp-3">{item.caption}</p>
                    <a href={`/content?pack=${selected.id}`} className="text-xs text-campaign-gold hover:underline mt-1 block">
                      Review →
                    </a>
                  </div>
                ))}
                {filteredItems.length === 0 && <p className="text-xs text-campaign-muted">No items match.</p>}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
