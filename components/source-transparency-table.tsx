import type { AppDictionary } from "@/lib/i18n/dictionary";
import type { SourceCheck, SourceCheckStatus } from "@/types/source";

const statusStyles: Record<SourceCheckStatus, string> = {
  success: "border-[#a7f3d0] bg-[#ecfdf5] text-[#065f46]",
  no_match: "border-[#bfdbfe] bg-[#eff6ff] text-[#1e3a8a]",
  potential_match: "border-[#fed7aa] bg-[#fff7ed] text-[#9a3412]",
  failed: "border-[#fecaca] bg-[#fef2f2] text-[#991b1b]",
  timeout: "border-[#fecaca] bg-[#fef2f2] text-[#991b1b]",
  unavailable: "border-slate-300 bg-slate-50 text-slate-700",
  demo_fixture: "border-[#bfdbfe] bg-[#eff6ff] text-[#1e3a8a]",
  cached: "border-[#d8b4fe] bg-[#faf5ff] text-[#6b21a8]",
  partial: "border-[#fde68a] bg-[#fefce8] text-[#854d0e]",
};

export function SourceTransparencyTable({
  sources,
  labels,
  statusLabels,
}: {
  sources: SourceCheck[];
  labels: AppDictionary["sourcesChecked"];
  statusLabels: AppDictionary["badges"]["sourceCheckStatuses"];
}) {
  return (
    <section className="print-break-inside-avoid min-w-0 rounded-lg border border-line bg-white p-5 sm:p-8">
      <div className="mb-5">
        <p className="text-xs font-medium uppercase tracking-[0.05em] text-muted">{labels.eyebrow}</p>
        <h2 className="mt-2 text-lg font-medium leading-[1.4] text-ink">{labels.title}</h2>
      </div>

      {sources.length === 0 ? (
        <div className="rounded-md border border-line bg-panel p-4 text-sm leading-[1.55] text-muted">
          {labels.noSources}
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto">
          <table className="min-w-[820px] divide-y divide-line text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-[0.05em] text-muted">
                <th className="whitespace-nowrap py-3 pr-4 font-medium">{labels.source}</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">{labels.provider}</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">{labels.status}</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">{labels.mode}</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">{labels.checkedAt}</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">{labels.confidence}</th>
                <th className="min-w-56 pl-4 py-3 font-medium">{labels.notes}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {sources.map((source) => (
                <tr key={source.id}>
                  <td className="py-4 pr-4 align-top font-medium text-ink">{source.label}</td>
                  <td className="px-4 py-4 align-top text-muted">{source.provider}</td>
                  <td className="px-4 py-4 align-top">
                    <span
                      className={`inline-flex rounded-sm border px-2 py-1 text-xs font-medium uppercase tracking-[0.05em] ${statusStyles[source.status]}`}
                    >
                      {statusLabels[source.status]}
                    </span>
                  </td>
                  <td className="px-4 py-4 align-top text-muted">{source.mode}</td>
                  <td className="px-4 py-4 align-top text-muted">{source.checkedAt}</td>
                  <td className="px-4 py-4 align-top text-muted">{source.confidence ?? "-"}</td>
                  <td className="pl-4 py-4 align-top leading-6 text-muted">{source.details ?? labels.checked}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
