import { ListChecks } from "lucide-react";
import type { AppDictionary } from "@/lib/i18n/dictionary";
import type { RiskScoreBreakdown as RiskScoreBreakdownType } from "@/types/risk";

export function RiskScoreBreakdown({
  risk,
  labels,
}: {
  risk: RiskScoreBreakdownType;
  labels: AppDictionary["riskBreakdown"];
}) {
  return (
    <section className="print-break-inside-avoid min-w-0 rounded-lg border border-line bg-white p-5 sm:p-8">
      <div className="mb-5 flex gap-3">
        <ListChecks className="mt-1 h-5 w-5 flex-none text-ink" aria-hidden="true" />
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.05em] text-muted">{labels.eyebrow}</p>
          <h2 className="mt-2 text-lg font-medium leading-[1.4] text-ink">{labels.title}</h2>
          <p className="mt-2 text-sm leading-[1.55] text-body">{labels.model}</p>
          <p className="mt-2 text-sm leading-[1.55] text-muted">{labels.thresholds}</p>
        </div>
      </div>

      <div className="rounded-md border border-line bg-panel p-4 text-sm leading-[1.55] text-muted">
        {risk.capped ? labels.capped : labels.notCapped}
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-medium text-ink">{labels.contributions}</h3>
        {risk.contributions.length === 0 ? (
          <p className="mt-3 rounded-md border border-line bg-panel p-4 text-sm leading-[1.55] text-muted">
            {labels.noContributions}
          </p>
        ) : (
          <div className="mt-3 max-w-full overflow-x-auto">
            <table className="min-w-[420px] divide-y divide-line text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-[0.05em] text-muted">
                  <th className="py-3 pr-4 font-medium">{labels.indicator}</th>
                  <th className="w-24 px-4 py-3 text-right font-medium">{labels.points}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {risk.contributions.map((contribution) => (
                  <tr key={contribution.flagId}>
                    <td className="py-3 pr-4 font-medium text-ink">{contribution.label}</td>
                    <td className="px-4 py-3 text-right text-muted">{contribution.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
