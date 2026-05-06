import { Database, Info } from "lucide-react";
import type { AppDictionary } from "@/lib/i18n/dictionary";
import type { DataMode } from "@/types/source";

const styles: Record<DataMode, string> = {
  demo: "border-[#bfdbfe] bg-[#eff6ff] text-[#1e3a8a]",
  live: "border-[#a7f3d0] bg-[#ecfdf5] text-[#065f46]",
  hybrid: "border-[#fde68a] bg-[#fefce8] text-[#854d0e]",
  cached: "border-[#d8b4fe] bg-[#faf5ff] text-[#6b21a8]",
  unavailable: "border-[#fecaca] bg-[#fef2f2] text-[#991b1b]",
};

export function DataModeBanner({
  mode,
  checkedAt,
  labels,
}: {
  mode: DataMode;
  checkedAt?: string;
  labels: AppDictionary["dataMode"];
}) {
  return (
    <section className={`print-break-inside-avoid rounded-lg border p-4 ${styles[mode]}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <Database className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.05em] opacity-75">{labels.eyebrow}</p>
            <h2 className="mt-1 text-base font-medium leading-snug">{labels.modes[mode]}</h2>
            <p className="mt-2 max-w-4xl text-sm leading-[1.55] opacity-90">{labels.descriptions[mode]}</p>
          </div>
        </div>
        {checkedAt ? (
          <div className="inline-flex items-center gap-2 rounded-md border border-current/20 bg-white/40 px-3 py-2 text-xs font-medium">
            <Info className="h-3.5 w-3.5" aria-hidden="true" />
            {labels.checkedAt}: {checkedAt}
          </div>
        ) : null}
      </div>
    </section>
  );
}
