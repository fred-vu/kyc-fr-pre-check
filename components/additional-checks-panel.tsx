"use client";

import { FormEvent, useState } from "react";
import { ChevronDown, Landmark, Loader2, PlusCircle, ReceiptText } from "lucide-react";
import type { AppDictionary } from "@/lib/i18n/dictionary";
import type {
  AdditionalCheckStatus,
  IbanValidationResult,
  VatSirenMatchStatus,
  VatValidationResult,
} from "@/types/additional-checks";

type AdditionalChecksPanelProps = {
  labels: AppDictionary["additionalChecks"];
  companySiren?: string;
  dateLocale: string;
};

const statusStyles: Record<AdditionalCheckStatus, string> = {
  valid: "border-[#a7f3d0] bg-[#ecfdf5] text-[#065f46]",
  invalid: "border-[#fed7aa] bg-[#fff7ed] text-[#9a3412]",
  unavailable: "border-[#fecaca] bg-[#fef2f2] text-[#991b1b]",
};

function StatusBadge({
  status,
  labels,
}: {
  status: AdditionalCheckStatus;
  labels: AppDictionary["additionalChecks"];
}) {
  const text =
    status === "valid" ? labels.valid : status === "invalid" ? labels.invalid : labels.unavailable;

  return (
    <span
      className={`inline-flex rounded-sm border px-2 py-1 text-xs font-medium uppercase tracking-[0.05em] ${statusStyles[status]}`}
    >
      {text}
    </span>
  );
}

function formatDate(value: string | undefined, dateLocale: string) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(dateLocale);
}

function DetailRow({ label, value }: { label: string; value: string | undefined }) {
  if (!value) {
    return null;
  }

  return (
    <div className="grid gap-1 border-t border-line py-3 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-4">
      <dt className="text-xs font-medium uppercase tracking-[0.05em] text-muted">{label}</dt>
      <dd className="break-words text-sm leading-[1.55] text-ink">{value}</dd>
    </div>
  );
}

function joinValues(values: string[]) {
  return values.filter(Boolean).join("; ");
}

function sirenMatchLabel(status: VatSirenMatchStatus, labels: AppDictionary["additionalChecks"]) {
  if (status === "match") {
    return labels.sirenMatch;
  }

  if (status === "mismatch") {
    return labels.sirenMismatch;
  }

  if (status === "not_applicable") {
    return labels.sirenNotApplicable;
  }

  return labels.sirenNotChecked;
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function VatResultView({
  result,
  labels,
  dateLocale,
}: {
  result: VatValidationResult;
  labels: AppDictionary["additionalChecks"];
  dateLocale: string;
}) {
  return (
    <div className="border-t border-line pt-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ReceiptText className="h-4 w-4 text-ink" aria-hidden="true" />
          <h3 className="text-base font-medium text-ink">{labels.vatTitle}</h3>
        </div>
        <StatusBadge status={result.status} labels={labels} />
      </div>

      <dl>
        <DetailRow label={labels.normalizedVat} value={result.normalized} />
        <DetailRow label={labels.country} value={result.countryCode} />
        <DetailRow label={labels.registeredName} value={result.name} />
        <DetailRow label={labels.registeredAddress} value={result.address} />
        <DetailRow label={labels.requestDate} value={formatDate(result.requestDate, dateLocale)} />
        <DetailRow
          label={labels.checkedAt}
          value={formatDate(result.source.checkedAt, dateLocale)}
        />
        <DetailRow label={labels.source} value={result.source.provider} />
        <DetailRow label="SIREN" value={sirenMatchLabel(result.sirenMatch, labels)} />
        <DetailRow label={labels.errors} value={result.error ?? result.userError} />
        <DetailRow label={labels.notes} value={joinValues(result.notes)} />
      </dl>
    </div>
  );
}

function IbanResultView({
  result,
  labels,
  dateLocale,
}: {
  result: IbanValidationResult;
  labels: AppDictionary["additionalChecks"];
  dateLocale: string;
}) {
  const sepa =
    result.inSepaZone === null ? "-" : result.inSepaZone ? labels.yes : labels.no;

  return (
    <div className="border-t border-line pt-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Landmark className="h-4 w-4 text-ink" aria-hidden="true" />
          <h3 className="text-base font-medium text-ink">{labels.ibanTitle}</h3>
        </div>
        <StatusBadge status={result.status} labels={labels} />
      </div>

      <dl>
        <DetailRow label={labels.maskedIban} value={result.masked} />
        <DetailRow label={labels.country} value={result.countryCode} />
        <DetailRow label={labels.checksum} value={result.checksumDigits} />
        <DetailRow label={labels.sepa} value={sepa} />
        <DetailRow
          label={labels.checkedAt}
          value={formatDate(result.source.checkedAt, dateLocale)}
        />
        <DetailRow label={labels.source} value={result.source.provider} />
        <DetailRow label={labels.errors} value={joinValues(result.errors)} />
        <DetailRow label={labels.notes} value={joinValues(result.notes)} />
      </dl>
    </div>
  );
}

export function AdditionalChecksPanel({
  labels,
  companySiren,
  dateLocale,
}: AdditionalChecksPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [vatNumber, setVatNumber] = useState("");
  const [iban, setIban] = useState("");
  const [vatResult, setVatResult] = useState<VatValidationResult>();
  const [ibanResult, setIbanResult] = useState<IbanValidationResult>();
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedVat = vatNumber.trim();
    const trimmedIban = iban.trim();

    if (!trimmedVat && !trimmedIban) {
      setFormError(labels.noInput);
      return;
    }

    setFormError("");
    setIsSubmitting(true);

    try {
      const [nextVat, nextIban] = await Promise.all([
        trimmedVat
          ? postJson<VatValidationResult>("/api/validate/vat", {
              vatNumber: trimmedVat,
              companySiren,
            })
          : Promise.resolve(undefined),
        trimmedIban
          ? postJson<IbanValidationResult>("/api/validate/iban", {
              iban: trimmedIban,
            })
          : Promise.resolve(undefined),
      ]);

      setVatResult(nextVat);
      setIbanResult(nextIban);
    } catch {
      setFormError(labels.unexpectedError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="print:hidden rounded-lg border border-line bg-white p-5 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.05em] text-muted">
            {labels.eyebrow}
          </p>
          <h2 className="mt-2 text-lg font-medium leading-[1.4] text-ink">{labels.title}</h2>
        </div>
        <button
          aria-controls="additional-checks-panel"
          aria-expanded={isOpen}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-medium leading-snug text-ink active:bg-panel"
          type="button"
          onClick={() => setIsOpen((value) => !value)}
        >
          {isOpen ? (
            <ChevronDown className="h-4 w-4 rotate-180 transition" aria-hidden="true" />
          ) : (
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
          )}
          {isOpen ? labels.hideButton : labels.addButton}
        </button>
      </div>

      {isOpen ? (
        <div id="additional-checks-panel" className="mt-5 space-y-5">
          <form className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]" onSubmit={onSubmit}>
            <div>
              <label className="block text-sm font-medium text-ink" htmlFor="vat-number">
                {labels.vatLabel}
              </label>
              <input
                className="mt-2 h-12 w-full rounded-sm border border-line bg-white px-4 text-sm text-ink outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/15"
                id="vat-number"
                name="vatNumber"
                placeholder={labels.vatPlaceholder}
                value={vatNumber}
                onChange={(event) => setVatNumber(event.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink" htmlFor="iban">
                {labels.ibanLabel}
              </label>
              <input
                autoComplete="off"
                className="mt-2 h-12 w-full rounded-sm border border-line bg-white px-4 text-sm text-ink outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/15"
                id="iban"
                name="iban"
                placeholder={labels.ibanPlaceholder}
                value={iban}
                onChange={(event) => setIban(event.target.value)}
              />
            </div>

            <div className="flex items-end">
              <button
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-medium leading-snug text-white transition active:bg-[#0d1218] disabled:cursor-not-allowed disabled:bg-muted lg:w-auto"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <PlusCircle className="h-4 w-4" aria-hidden="true" />
                )}
                {isSubmitting ? labels.running : labels.runButton}
              </button>
            </div>
          </form>

          {formError ? (
            <div className="rounded-md border border-[#fed7aa] bg-[#fff7ed] p-3 text-sm leading-[1.55] text-[#9a3412]">
              {formError}
            </div>
          ) : null}

          {vatResult ? (
            <VatResultView result={vatResult} labels={labels} dateLocale={dateLocale} />
          ) : null}
          {ibanResult ? (
            <IbanResultView result={ibanResult} labels={labels} dateLocale={dateLocale} />
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
