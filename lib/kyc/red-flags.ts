import type { CompanyIdentifier, CompanyProfile } from "@/types/company";
import type { RedFlag, RedFlagCode, RedFlagSeverity, RiskFlagCategory } from "@/types/risk";
import type { ScreeningMatch } from "@/types/screening";
import type { SourceRecord } from "@/types/source";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";
import { normalizeAddress, normalizeCompanyName } from "./normalize-text";
import { RED_FLAG_WEIGHTS } from "./risk-scoring";

type CreateFlagInput = {
  code: RedFlagCode;
  label: string;
  severity: RedFlagSeverity;
  category: RiskFlagCategory;
  description: string;
  evidence: string;
  source: string;
  recommendation: string;
  manualReviewRequired?: boolean;
};

function createFlag(input: CreateFlagInput): RedFlag {
  const id =
    input.code === "SOURCE_UNAVAILABLE"
      ? `${input.code.toLowerCase()}_${input.source.toLowerCase()}`
      : input.code.toLowerCase();

  return {
    ...input,
    id,
    title: input.label,
    scoreContribution: RED_FLAG_WEIGHTS[input.code],
    recommendedAction: input.recommendation,
    manualReviewRequired:
      input.manualReviewRequired ?? (input.severity === "high" || input.severity === "critical"),
  };
}

function localizedFlag(
  code: RedFlagCode,
  severity: RedFlagSeverity,
  category: RiskFlagCategory,
  evidence: string,
  copy: ReturnType<typeof getDictionary>["redFlagCopy"],
  manualReviewRequired?: boolean,
) {
  return createFlag({
    code,
    severity,
    category,
    evidence,
    manualReviewRequired,
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

function displayValue(value: string | undefined) {
  return value?.trim() || "not available";
}

function matchEvidence(matches: ScreeningMatch[]) {
  return matches
    .map(
      (match) =>
        `${match.listName}: ${match.matchedValue} (${match.matchType}, confidence ${Math.round(
          match.confidence * 100,
        )}%)`,
    )
    .join("; ");
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
    flags.push(
      localizedFlag(
        "INVALID_IDENTIFIER",
        "high",
        "identity",
        `Submitted value: ${identifier.raw || "empty"}. Normalized value: ${
          identifier.normalized || "not available"
        }.`,
        redFlagCopy,
        true,
      ),
    );
    return flags;
  }

  if (!company) {
    flags.push(
      localizedFlag(
        "COMPANY_NOT_FOUND",
        "high",
        "identity",
        `No company profile was resolved for ${identifier.normalized}.`,
        redFlagCopy,
        true,
      ),
    );
  }

  if (company?.status === "inactive") {
    flags.push(
      localizedFlag(
        "COMPANY_INACTIVE",
        "medium",
        "identity",
        `Company status: ${company.status}.`,
        redFlagCopy,
        true,
      ),
    );
  }

  if (company?.status === "closed") {
    flags.push(
      localizedFlag(
        "COMPANY_CLOSED",
        "high",
        "identity",
        `Company status: ${company.status}.`,
        redFlagCopy,
        true,
      ),
    );
  }

  if (company && !normalizeCompanyName(company.legalName)) {
    flags.push(
      localizedFlag(
        "MISSING_LEGAL_NAME",
        "medium",
        "identity",
        "Legal name is missing or empty in the company profile.",
        redFlagCopy,
        true,
      ),
    );
  }

  if (company && !hasAddress(company)) {
    flags.push(
      localizedFlag(
        "MISSING_ADDRESS",
        "medium",
        "address",
        "No registered or establishment address is available in the company profile.",
        redFlagCopy,
        true,
      ),
    );
  }

  if (company && hasAddressMismatch(company)) {
    flags.push(
      localizedFlag(
        "ADDRESS_MISMATCH",
        "medium",
        "address",
        `Registered address: ${displayValue(company.headOfficeAddress?.raw)}. Establishment address: ${displayValue(
          company.establishmentAddress?.raw,
        )}.`,
        redFlagCopy,
        true,
      ),
    );
  }

  if (company && isRecentlyCreated(company.creationDate, now)) {
    flags.push(
      localizedFlag(
        "RECENTLY_CREATED_COMPANY",
        "medium",
        "age",
        `Creation date: ${displayValue(company.creationDate)}.`,
        redFlagCopy,
        true,
      ),
    );
  }

  if (company && isSensitiveActivity(company.activityCode)) {
    flags.push(
      localizedFlag(
        "SENSITIVE_ACTIVITY",
        "high",
        "activity",
        `Activity code: ${displayValue(company.activityCode)}. Activity label: ${displayValue(
          company.activityLabel,
        )}.`,
        redFlagCopy,
        true,
      ),
    );
  }

  if (warningMatches.length > 0) {
    flags.push(
      localizedFlag(
        "AMF_WARNING_POTENTIAL_MATCH",
        "high",
        "regulatory_warning",
        matchEvidence(warningMatches),
        redFlagCopy,
        true,
      ),
    );
  }

  if (sanctionsMatches.length > 0) {
    flags.push(
      localizedFlag(
        "SANCTIONS_POTENTIAL_MATCH",
        "critical",
        "sanctions",
        matchEvidence(sanctionsMatches),
        redFlagCopy,
        true,
      ),
    );
  }

  const failedSources = sourcesChecked.filter((source) => source.status === "failed");

  for (const source of failedSources) {
    const sourceUnavailable = dictionary.sourceUnavailable;

    flags.push(
      createFlag({
        code: "SOURCE_UNAVAILABLE",
        label: `${source.sourceName} ${sourceUnavailable.labelSuffix}`,
        severity: "low",
        category: "source_quality",
        description: source.error
          ? `${sourceUnavailable.descriptionWithErrorPrefix} ${source.error}`
          : sourceUnavailable.descriptionNoError,
        evidence: `Source ${source.sourceName} returned status ${source.status}. ${
          source.error || source.notes || "No additional error detail."
        }`,
        source: source.sourceName,
        recommendation: sourceUnavailable.recommendation,
        manualReviewRequired: true,
      }),
    );
  }

  return flags;
}
