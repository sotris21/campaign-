// components/ui/StatusBadge.tsx
import type { ContentStatusType } from "@/lib/schemas";

const labels: Record<ContentStatusType, string> = {
  draft: "Draft",
  needs_review: "Needs Review",
  approved: "Approved ✓",
  exported: "Exported",
  scheduled_manually: "Scheduled",
  rejected: "Rejected",
  archived: "Archived",
};

export function StatusBadge({ status }: { status: ContentStatusType | string }) {
  const cls = `badge badge-${status}`;
  const label = labels[status as ContentStatusType] ?? status;
  return <span className={cls}>{label}</span>;
}
