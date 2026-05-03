import type { AppDictionary } from "@/lib/i18n/dictionary";
import type { RiskLevel } from "@/types/risk";

const styles: Record<RiskLevel, string> = {
  low: "border-[#a7f3d0] bg-[#ecfdf5] text-[#065f46]",
  medium: "border-[#fde68a] bg-[#fefce8] text-[#854d0e]",
  high: "border-[#fed7aa] bg-[#fff7ed] text-[#9a3412]",
  critical: "border-[#fecaca] bg-[#fef2f2] text-[#991b1b]",
  unknown: "border-slate-200 bg-slate-50 text-slate-700",
};

const prominentStyles: Partial<Record<RiskLevel, string>> = {
  high: "border-[#9a3412] bg-[#9a3412] text-white",
  critical: "border-[#991b1b] bg-[#991b1b] text-white",
};

export function RiskBadge({
  level,
  labels,
  prominent = false,
}: {
  level: RiskLevel;
  labels?: AppDictionary["badges"]["riskLevels"];
  prominent?: boolean;
}) {
  return (
    <span
      className={`inline-flex rounded-sm border font-medium uppercase tracking-[0.05em] ${
        prominent ? "px-3 py-2 text-[13px]" : "px-2.5 py-1 text-xs"
      } ${prominentStyles[level] ?? styles[level]}`}
    >
      {labels?.[level] ?? level}
    </span>
  );
}
