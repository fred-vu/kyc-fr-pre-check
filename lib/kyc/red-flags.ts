import type { CompanyIdentifier, CompanyProfile } from "@/types/company";
import type { RedFlag, RedFlagCode, RedFlagSeverity } from "@/types/risk";
import type { ScreeningMatch } from "@/types/screening";
import type { SourceRecord } from "@/types/source";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";
import { normalizeAddress, normalizeCompanyName } from "./normalize-text";

type CreateFlagInput = {
  code: RedFlagCode;
  label: string;
  severity: RedFlagSeverity;
  description: string;
  source: string;
  recommendation: string;
};

function createFlag(input: CreateFlagInput): RedFlag {
  return input;
}

function localizedFlag(
  code: RedFlagCode,
  severity: RedFlagSeverity,
  copy: ReturnType<typeof getDictionary>["redFlagCopy"],
) {
  return createFlag({
    code,
    severity,
    ...copy[code],
  });
}

function isRecentlyCreated(creationDate: string | undefined, now = new Date()) {
  if (!creationDate) {
    return false;
  }

  const createdAt = new Date(creationDate);

  if (Number.isNaN(createdAt.getTime())) {
    return false;
  }

  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  return createdAt >= sixMonthsAgo;
}

export function isSensitiveActivity(activityCode: string | undefined) {
  if (!activityCode) {
    return false;
  }

  const normalized = activityCode.toUpperCase().trim();

  return (
    normalized.startsWith("64") ||
    normalized.startsWith("65") ||
    normalized.startsWith("66") ||
    normalized.startsWith("92") ||
    normalized === "46.35Z" ||
    normalized === "47.78Z"
  );
}

function hasAddress(company: CompanyProfile) {
  return Boolean(
    company.headOfficeAddress?.raw ||
      company.headOfficeAddress?.line1 ||
      company.establishmentAddress?.raw ||
      company.establishmentAddress?.line1,
  );
}

function hasAddressMismatch(company: CompanyProfile) {
  const headOffice = normalizeAddress(company.headOfficeAddress?.raw);
  const establishment = normalizeAddress(company.establishmentAddress?.raw);

  return Boolean(headOffice && establishment && headOffice !== establishment);
}

export function generateRedFlags(input: {
  identifier: CompanyIdentifier;
  company?: CompanyProfile;
  sanctionsMatches: ScreeningMatch[];
  warningMatches: ScreeningMatch[];
  sourcesChecked: SourceRecord[];
  now?: Date;
  locale?: Locale;
}) {
  const { identifier, company, sanctionsMatches, warningMatches, sourcesChecked, now } = input;
  const dictionary = getDictionary(input.locale);
  const redFlagCopy = dictionary.redFlagCopy;
  const flags: RedFlag[] = [];

  if (!identifier.isValid) {
    flags.push(localizedFlag("INVALID_IDENTIFIER", "high", redFlagCopy));
    return flags;
  }

  if (!company) {
    flags.push(localizedFlag("COMPANY_NOT_FOUND", "high", redFlagCopy));
  }

  if (company?.status === "inactive") {
    flags.push(localizedFlag("COMPANY_INACTIVE", "medium", redFlagCopy));
  }

  if (company?.status === "closed") {
    flags.push(localizedFlag("COMPANY_CLOSED", "high", redFlagCopy));
  }

  if (company && !normalizeCompanyName(company.legalName)) {
    flags.push(localizedFlag("MISSING_LEGAL_NAME", "medium", redFlagCopy));
  }

  if (company && !hasAddress(company)) {
    flags.push(localizedFlag("MISSING_ADDRESS", "medium", redFlagCopy));
  }

  if (company && hasAddressMismatch(company)) {
    flags.push(localizedFlag("ADDRESS_MISMATCH", "medium", redFlagCopy));
  }

  if (company && isRecentlyCreated(company.creationDate, now)) {
    flags.push(localizedFlag("RECENTLY_CREATED_COMPANY", "medium", redFlagCopy));
  }

  if (company && isSensitiveActivity(company.activityCode)) {
    flags.push(localizedFlag("SENSITIVE_ACTIVITY", "high", redFlagCopy));
  }

  if (warningMatches.length > 0) {
    flags.push(localizedFlag("AMF_WARNING_POTENTIAL_MATCH", "high", redFlagCopy));
  }

  if (sanctionsMatches.length > 0) {
    flags.push(localizedFlag("SANCTIONS_POTENTIAL_MATCH", "critical", redFlagCopy));
  }

  const failedSources = sourcesChecked.filter((source) => source.status === "failed");

  for (const source of failedSources) {
    const sourceUnavailable = dictionary.sourceUnavailable;

    flags.push(
      createFlag({
        code: "SOURCE_UNAVAILABLE",
        label: `${source.sourceName} ${sourceUnavailable.labelSuffix}`,
        severity: "low",
        description: source.error
          ? `${sourceUnavailable.descriptionWithErrorPrefix} ${source.error}`
          : sourceUnavailable.descriptionNoError,
        source: source.sourceName,
        recommendation: sourceUnavailable.recommendation,
      }),
    );
  }

  return flags;
}
