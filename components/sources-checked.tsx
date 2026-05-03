import type { AppDictionary } from "@/lib/i18n/dictionary";
import type { SourceRecord } from "@/types/source";
import { SourceStatusBadge } from "./source-status-badge";

export function SourcesChecked({
  sources,
  labels,
  statusLabels,
  modeLabels,
  freshnessLabels,
}: {
  sources: SourceRecord[];
  labels: AppDictionary["sourcesChecked"];
  statusLabels: AppDictionary["badges"]["sourceStatuses"];
  modeLabels: AppDictionary["badges"]["sourceModes"];
  freshnessLabels: AppDictionary["badges"]["freshness"];
}) {
  return (
    <section className="print-break-inside-avoid rounded-lg border border-line bg-white p-8">
      <div className="mb-5">
        <p className="text-xs font-medium uppercase tracking-[0.05em] text-muted">{labels.eyebrow}</p>
        <h2 className="mt-2 text-lg font-medium leading-[1.4] text-ink">{labels.title}</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-[0.05em] text-muted">
              <th className="whitespace-nowrap py-3 pr-4 font-medium">{labels.source}</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">{labels.status}</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">{labels.mode}</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">{labels.freshness}</th>
              <th className="min-w-52 pl-4 py-3 font-medium">{labels.notes}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {sources.map((source, index) => (
              <tr key={`${source.sourceName}-${source.mode}-${index}`}>
                <td className="py-4 pr-4 align-top font-medium text-ink">{source.sourceName}</td>
                <td className="px-4 py-4 align-top">
                  <SourceStatusBadge status={source.status} labels={statusLabels} />
                </td>
                <td className="px-4 py-4 align-top text-muted">{modeLabels[source.mode]}</td>
                <td className="px-4 py-4 align-top text-muted">
                  {source.freshness ? freshnessLabels[source.freshness] : "-"}
                </td>
                <td className="pl-4 py-4 align-top leading-6 text-muted">
                  {source.error || source.notes || source.url || labels.checked}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
