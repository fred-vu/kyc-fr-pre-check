import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CompanyIdentityCard } from "@/components/company-identity-card";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { ErrorState } from "@/components/error-state";
import { RedFlagsTable } from "@/components/red-flags-table";
import { ReportPreview } from "@/components/report-preview";
import { RiskSummaryCard } from "@/components/risk-summary-card";
import { ScreeningCard } from "@/components/screening-card";
import { SourcesChecked } from "@/components/sources-checked";
import { runPrecheck } from "@/lib/kyc/run-precheck";
import { getCurrentDictionary } from "@/lib/i18n/server";

type CheckPageProps = {
  params: Promise<{
    identifier: string;
  }>;
};

export default async function CheckPage({ params }: CheckPageProps) {
  const { identifier } = await params;
  const { locale, dictionary } = await getCurrentDictionary();
  const result = await runPrecheck(decodeURIComponent(identifier), { locale });

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-section sm:px-6 lg:px-12">
      <div className="no-print flex items-center justify-between gap-4">
        <Link className="inline-flex items-center gap-2 text-sm font-normal text-muted" href="/">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {dictionary.check.newCheck}
        </Link>
        {result.isDemo ? (
          <span className="rounded-sm border border-line bg-panel px-3 py-1 text-xs font-medium uppercase tracking-[0.05em] text-muted">
            {dictionary.check.demoMode}
          </span>
        ) : null}
      </div>

      <DisclaimerBanner labels={dictionary.disclaimer} />

      {!result.identifier.isValid ? (
        <ErrorState
          title={dictionary.check.invalidTitle}
          description={dictionary.check.invalidDescription}
        />
      ) : null}

      <div className="print-surface grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-6">
          <CompanyIdentityCard
            company={result.company}
            identifier={result.identifier}
            labels={dictionary.companyIdentity}
          />
          <RedFlagsTable
            flags={result.redFlags}
            labels={dictionary.redFlags}
            severityLabels={dictionary.badges.riskLevels}
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <ScreeningCard
              title={dictionary.check.dgTitle}
              description={dictionary.check.dgDescription}
              matches={result.sanctionsMatches}
              statusNote={result.dgTresorState.message}
              freshness={result.dgTresorState.freshness}
              labels={dictionary.screeningCard}
            />
            <ScreeningCard
              title={dictionary.check.amfTitle}
              description={dictionary.check.amfDescription}
              matches={result.warningMatches}
              labels={dictionary.screeningCard}
            />
          </div>
          <SourcesChecked
            sources={result.sourcesChecked}
            labels={dictionary.sourcesChecked}
            statusLabels={dictionary.badges.sourceStatuses}
            modeLabels={dictionary.badges.sourceModes}
            freshnessLabels={dictionary.badges.freshness}
          />
        </section>

        <aside className="space-y-6">
          <RiskSummaryCard
            result={result}
            labels={dictionary.riskSummary}
            riskLabels={dictionary.badges.riskLevels}
          />
          <ReportPreview markdown={result.reportMarkdown} labels={dictionary.reportPreview} />
        </aside>
      </div>
    </main>
  );
}
