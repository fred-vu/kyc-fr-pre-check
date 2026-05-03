import { Gauge, ListChecks, ShieldAlert } from "lucide-react";
import type { AppDictionary } from "@/lib/i18n/dictionary";
import type { KycPrecheckResult } from "@/types/report";
import { GenerateFullPdfButton } from "./generate-full-pdf-button";
import { RiskBadge } from "./risk-badge";

function Metric({
  label,
  value,
  isDark,
}: {
  label: string;
  value: string | number;
  isDark: boolean;
}) {
  return (
    <div
      className={`rounded-md border p-4 ${
        isDark ? "border-white/10 bg-dark-elevated" : "border-line bg-panel"
      }`}
    >
      <dt className={`text-xs font-medium uppercase tracking-[0.05em] ${isDark ? "text-white/60" : "text-muted"}`}>
        {label}
      </dt>
      <dd className={`mt-1 text-lg font-medium ${isDark ? "text-white" : "text-ink"}`}>{value}</dd>
    </div>
  );
}

export function RiskSummaryCard({
  result,
  labels,
  riskLabels,
}: {
  result: KycPrecheckResult;
  labels: AppDictionary["riskSummary"];
  riskLabels: AppDictionary["badges"]["riskLevels"];
}) {
  const isDark = result.riskLevel === "high" || result.riskLevel === "critical";

  return (
    <section
      className={`print-break-inside-avoid rounded-lg border p-8 ${
        isDark ? "border-dark bg-dark text-white" : "border-line bg-white"
      }`}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className={`text-xs font-medium uppercase tracking-[0.05em] ${isDark ? "text-white/60" : "text-muted"}`}>
            {labels.eyebrow}
          </p>
          <div className="mt-2">
            <RiskBadge level={result.riskLevel} labels={riskLabels} prominent={isDark} />
          </div>
        </div>
        <Gauge className={`h-6 w-6 ${isDark ? "text-white" : "text-ink"}`} aria-hidden="true" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <Metric label={labels.displayScore} value={`${result.riskScore.display}/100`} isDark={isDark} />
        <Metric label={labels.rawScore} value={result.riskScore.raw} isDark={isDark} />
        <Metric label={labels.redFlags} value={result.redFlags.length} isDark={isDark} />
        <Metric label={labels.sources} value={result.sourcesChecked.length} isDark={isDark} />
      </div>

      <div className={`mt-5 space-y-3 text-sm leading-[1.55] ${isDark ? "text-white/70" : "text-muted"}`}>
        <p className="flex gap-2">
          <ShieldAlert className={`mt-0.5 h-4 w-4 flex-none ${isDark ? "text-white" : "text-[#92400e]"}`} aria-hidden="true" />
          {labels.scoreNote}
        </p>
        <p className="flex gap-2">
          <ListChecks className={`mt-0.5 h-4 w-4 flex-none ${isDark ? "text-white" : "text-accent"}`} aria-hidden="true" />
          {labels.generatedAt} {new Date(result.generatedAt).toLocaleString(labels.dateLocale)}
        </p>
      </div>

      <GenerateFullPdfButton label={labels.generateFullPdf} isDark={isDark} />
    </section>
  );
}
