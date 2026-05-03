import { SearchCheck } from "lucide-react";
import type { AppDictionary } from "@/lib/i18n/dictionary";
import type { ScreeningMatch } from "@/types/screening";

export function ScreeningCard({
  title,
  description,
  matches,
  statusNote,
  freshness,
  labels,
}: {
  title: string;
  description: string;
  matches: ScreeningMatch[];
  statusNote?: string;
  freshness?: "fresh" | "stale" | "very_stale" | "unknown";
  labels: AppDictionary["screeningCard"];
}) {
  const freshnessStyle =
    freshness === "fresh"
      ? "border-[#a7f3d0] bg-[#ecfdf5] text-[#065f46]"
      : freshness === "stale"
        ? "border-[#fde68a] bg-[#fefce8] text-[#854d0e]"
        : freshness === "very_stale"
          ? "border-[#fed7aa] bg-[#fff7ed] text-[#9a3412]"
          : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <section className="print-break-inside-avoid rounded-lg border border-line bg-white p-5 sm:p-8">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.05em] text-muted">{labels.eyebrow}</p>
          <h2 className="mt-2 text-lg font-medium leading-[1.4] text-ink">{title}</h2>
          <p className="mt-1 text-sm leading-[1.55] text-body">{description}</p>
        </div>
        <SearchCheck className="h-5 w-5 flex-none text-ink" aria-hidden="true" />
      </div>

      {statusNote ? (
        <div className={`mb-4 rounded-md border p-3 text-sm leading-[1.55] ${freshnessStyle}`}>
          {statusNote}
        </div>
      ) : null}

      {matches.length === 0 ? (
        <div className="rounded-md border border-[#a7f3d0] bg-[#ecfdf5] p-4 text-sm font-medium text-[#065f46]">
          {labels.noMatches}
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => (
            <div key={`${match.listName}-${match.matchedValue}`} className="rounded-md border border-[#fed7aa] bg-[#fff7ed] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-[#9a3412]">{labels.potentialMatchLabel}</p>
                <span className="rounded-sm bg-white px-2 py-1 text-xs font-medium uppercase tracking-[0.05em] text-[#9a3412]">
                  {match.matchType}
                </span>
              </div>
              <p className="mt-2 text-sm text-[#9a3412]">{match.matchedValue}</p>
              <p className="mt-1 text-xs text-[#9a3412]">
                {labels.confidence}: {Math.round(match.confidence * 100)}%
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
