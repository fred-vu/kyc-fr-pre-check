import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import { demoCompanies } from "@/lib/demo/companies";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { RiskBadge } from "@/components/risk-badge";
import { runPrecheck } from "@/lib/kyc/run-precheck";
import { getCurrentDictionary } from "@/lib/i18n/server";

export default async function DemoPage() {
  const { locale, dictionary } = await getCurrentDictionary();
  const results = await Promise.all(
    demoCompanies.map((company) => runPrecheck(company.siren, { forceDemo: true, locale })),
  );

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:space-y-8 sm:px-6 sm:py-section lg:px-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.05em] text-muted">{dictionary.demo.eyebrow}</p>
          <h1 className="mt-2 text-[32px] font-normal leading-[1.2] tracking-normal text-ink">{dictionary.demo.title}</h1>
        </div>
        <Link className="text-sm font-medium text-accent" href="/">
          {dictionary.demo.backToSearch}
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {results.map((result) => (
          <Link
            key={result.company?.siren}
            className="rounded-lg border border-line bg-white p-5 sm:p-8"
            href={`/check/${result.company?.siren}`}
          >
            <div className="flex items-start justify-between gap-3">
              <Building2 className="h-6 w-6 text-ink" aria-hidden="true" />
              <RiskBadge level={result.riskLevel} labels={dictionary.badges.riskLevels} />
            </div>
            <h2 className="mt-5 text-lg font-medium leading-[1.4] text-ink">{result.company?.legalName}</h2>
            <dl className="mt-4 space-y-2 text-sm leading-[1.55]">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">SIREN</dt>
                <dd className="font-medium text-ink">{result.company?.siren}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{dictionary.demo.status}</dt>
                <dd className="font-medium capitalize text-ink">{result.company?.status}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{dictionary.demo.flags}</dt>
                <dd className="font-medium text-ink">{result.redFlags.length}</dd>
              </div>
            </dl>
            <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-accent">
              {dictionary.demo.openPrecheck}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </div>
          </Link>
        ))}
      </div>

      <DisclaimerBanner labels={dictionary.disclaimer} />
    </main>
  );
}
