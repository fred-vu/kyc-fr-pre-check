import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdditionalChecksPanel } from "@/components/additional-checks-panel";
import { CompanyIdentityCard } from "@/components/company-identity-card";
import { DataModeBanner } from "@/components/data-mode-banner";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { ErrorState } from "@/components/error-state";
import { RedFlagsTable } from "@/components/red-flags-table";
import { ReportPreview } from "@/components/report-preview";
import { ReviewOutcomeCard } from "@/components/review-outcome-card";
import { RiskScoreBreakdown } from "@/components/risk-score-breakdown";
import { RiskSummaryCard } from "@/components/risk-summary-card";
import { ScreeningCard } from "@/components/screening-card";
import { SourceTransparencyTable } from "@/components/source-transparency-table";
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
    <main className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:space-y-6 sm:px-6 sm:py-section lg:px-12">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
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

      <DataModeBanner
        mode={result.dataMode}
        checkedAt={new Date(result.generatedAt).toLocaleString(dictionary.riskSummary.dateLocale)}
        labels={dictionary.dataMode}
      />

      <DisclaimerBanner labels={dictionary.disclaimer} />

      {!result.identifier.isValid ? (
        <ErrorState
          title={dictionary.check.invalidTitle}
          description={dictionary.check.invalidDescription}
        />
      ) : null}

      <div className="print-surface grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="min-w-0 space-y-6">
          <ReviewOutcomeCard outcome={result.reviewOutcome} labels={dictionary.reviewOutcome} />
          <CompanyIdentityCard
            company={result.company}
            identifier={result.identifier}
            labels={dictionary.companyIdentity}
          />
          <AdditionalChecksPanel
            labels={dictionary.additionalChecks}
            companySiren={result.company?.siren}
            dateLocale={dictionary.riskSummary.dateLocale}
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
          <SourceTransparencyTable
            sources={result.sourceChecks}
            labels={dictionary.sourcesChecked}
            statusLabels={dictionary.badges.sourceCheckStatuses}
          />
        </section>

        <aside className="min-w-0 space-y-6">
          <RiskSummaryCard
            result={result}
            labels={dictionary.riskSummary}
            riskLabels={dictionary.badges.riskLevels}
          />
          <RiskScoreBreakdown risk={result.risk} labels={dictionary.riskBreakdown} />
          <ReportPreview
            markdown={result.reportMarkdown}
            evidencePayload={result.evidencePayload}
            escalationMemo={result.escalationMemo}
            labels={dictionary.reportPreview}
          />
        </aside>
      </div>
    </main>
  );
}
