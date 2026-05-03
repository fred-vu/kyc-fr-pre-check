import Link from "next/link";
import { ArrowRight, Database, FileText, ShieldCheck } from "lucide-react";
import { CompanySearchForm } from "@/components/company-search-form";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { getCurrentDictionary } from "@/lib/i18n/server";

export default async function HomePage() {
  const { dictionary } = await getCurrentDictionary();
  const icons = [Database, ShieldCheck, FileText];

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-section sm:px-6 lg:grid-cols-[1fr_420px] lg:px-12">
      <section className="space-y-8">
        <div className="max-w-3xl space-y-5">
          <div className="inline-flex rounded-sm bg-panel px-3 py-1 text-xs font-medium uppercase tracking-[0.05em] text-muted">
            {dictionary.home.eyebrow}
          </div>
          <div className="space-y-4">
            <h1 className="text-[40px] font-normal leading-[1.2] tracking-normal text-ink">
              {dictionary.home.title}
            </h1>
            <p className="max-w-2xl text-sm font-normal leading-[1.55] text-body">
              {dictionary.home.description}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {dictionary.home.cards.map((item, index) => {
            const Icon = icons[index];

            return (
              <div key={item.title} className="rounded-lg bg-panel p-8">
                <Icon className="mb-4 h-5 w-5 text-ink" aria-hidden="true" />
                <h2 className="text-base font-medium leading-[1.4] text-ink">{item.title}</h2>
                <p className="mt-2 text-sm leading-[1.55] text-body">{item.text}</p>
              </div>
            );
          })}
        </div>

        <DisclaimerBanner labels={dictionary.disclaimer} />
      </section>

      <aside className="rounded-lg border border-line bg-white p-8">
        <div className="mb-5">
          <h2 className="text-lg font-medium leading-[1.4] text-ink">{dictionary.home.runTitle}</h2>
          <p className="mt-1 text-sm leading-[1.55] text-body">{dictionary.home.runDescription}</p>
        </div>
        <CompanySearchForm labels={dictionary.searchForm} />
        <Link
          className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-line bg-white px-5 text-sm font-medium text-ink active:bg-panel"
          href="/demo"
        >
          {dictionary.home.demoCta}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </aside>
    </main>
  );
}
