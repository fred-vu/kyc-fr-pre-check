import type { AppDictionary } from "@/lib/i18n/dictionary";
import type { SourceStatus } from "@/types/source";

const styles: Record<SourceStatus, string> = {
  success: "border-[#a7f3d0] bg-[#ecfdf5] text-[#065f46]",
  partial: "border-[#fde68a] bg-[#fefce8] text-[#854d0e]",
  failed: "border-[#fecaca] bg-[#fef2f2] text-[#991b1b]",
  not_checked: "border-slate-200 bg-slate-50 text-slate-700",
};

export function SourceStatusBadge({
  status,
  labels,
}: {
  status: SourceStatus;
  labels?: AppDictionary["badges"]["sourceStatuses"];
}) {
  return (
    <span className={`inline-flex rounded-sm border px-2 py-1 text-xs font-medium uppercase tracking-[0.05em] ${styles[status]}`}>
      {labels?.[status] ?? status.replace("_", " ")}
    </span>
  );
}
