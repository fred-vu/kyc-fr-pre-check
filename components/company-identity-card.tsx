import { Building2 } from "lucide-react";
import type { AppDictionary } from "@/lib/i18n/dictionary";
import type { CompanyIdentifier, CompanyProfile } from "@/types/company";

function Row({ label, value, fallback }: { label: string; value?: string; fallback: string }) {
  return (
    <div className="grid gap-1 border-b border-line py-3 last:border-b-0 sm:grid-cols-[180px_1fr]">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="break-words text-sm font-medium text-ink">{value || fallback}</dd>
    </div>
  );
}

export function CompanyIdentityCard({
  company,
  identifier,
  labels,
}: {
  company?: CompanyProfile;
  identifier: CompanyIdentifier;
  labels: AppDictionary["companyIdentity"];
}) {
  return (
    <section className="print-break-inside-avoid rounded-lg border border-line bg-white p-8">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.05em] text-muted">{labels.eyebrow}</p>
          <h2 className="mt-2 text-lg font-medium leading-[1.4] text-ink">
            {company?.legalName || labels.unavailableTitle}
          </h2>
        </div>
        <Building2 className="h-6 w-6 text-ink" aria-hidden="true" />
      </div>

      <dl>
        <Row label={labels.submittedIdentifier} value={identifier.normalized || identifier.raw} fallback={labels.notAvailable} />
        <Row label={labels.identifierType} value={identifier.type.toUpperCase()} fallback={labels.notAvailable} />
        <Row label={labels.siren} value={company?.siren} fallback={labels.notAvailable} />
        <Row label={labels.siret} value={company?.siret} fallback={labels.notAvailable} />
        <Row label={labels.legalForm} value={company?.legalForm} fallback={labels.notAvailable} />
        <Row label={labels.status} value={company?.status} fallback={labels.notAvailable} />
        <Row label={labels.activityCode} value={company?.activityCode} fallback={labels.notAvailable} />
        <Row label={labels.activity} value={company?.activityLabel} fallback={labels.notAvailable} />
        <Row label={labels.creationDate} value={company?.creationDate} fallback={labels.notAvailable} />
        <Row label={labels.registeredAddress} value={company?.headOfficeAddress?.raw} fallback={labels.notAvailable} />
        <Row label={labels.establishmentAddress} value={company?.establishmentAddress?.raw} fallback={labels.notAvailable} />
      </dl>
    </section>
  );
}
