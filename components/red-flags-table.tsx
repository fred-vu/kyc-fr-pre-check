import type { AppDictionary } from "@/lib/i18n/dictionary";
import type { RedFlag } from "@/types/risk";

const severityStyles: Record<RedFlag["severity"], string> = {
  low: "border-[#a7f3d0] bg-[#ecfdf5] text-[#065f46]",
  medium: "border-[#fde68a] bg-[#fefce8] text-[#854d0e]",
  high: "border-[#fed7aa] bg-[#fff7ed] text-[#9a3412]",
  critical: "border-[#fecaca] bg-[#fef2f2] text-[#991b1b]",
};

export function RedFlagsTable({
  flags,
  labels,
  severityLabels,
}: {
  flags: RedFlag[];
  labels: AppDictionary["redFlags"];
  severityLabels: AppDictionary["badges"]["riskLevels"];
}) {
  return (
    <section className="print-break-inside-avoid rounded-lg border border-line bg-white p-8">
      <div className="mb-5">
        <p className="text-xs font-medium uppercase tracking-[0.05em] text-muted">{labels.eyebrow}</p>
        <h2 className="mt-2 text-lg font-medium leading-[1.4] text-ink">{labels.title}</h2>
      </div>

      {flags.length === 0 ? (
        <div className="rounded-md border border-line bg-panel p-4 text-sm leading-[1.55] text-muted">
          {labels.empty}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-line text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-[0.05em] text-muted">
                <th className="whitespace-nowrap py-3 pr-4 font-medium">{labels.severity}</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">{labels.flag}</th>
                <th className="min-w-64 px-4 py-3 font-medium">{labels.description}</th>
                <th className="min-w-64 pl-4 py-3 font-medium">{labels.recommendation}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {flags.map((flag) => (
                <tr key={`${flag.code}-${flag.source}`}>
                  <td className="py-4 pr-4 align-top">
                    <span className={`rounded-sm border px-2 py-1 text-xs font-medium uppercase tracking-[0.05em] ${severityStyles[flag.severity]}`}>
                      {severityLabels[flag.severity]}
                    </span>
                  </td>
                  <td className="px-4 py-4 align-top font-medium text-ink">{flag.label}</td>
                  <td className="px-4 py-4 align-top leading-6 text-muted">{flag.description}</td>
                  <td className="pl-4 py-4 align-top leading-6 text-muted">{flag.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
