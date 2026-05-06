import type { CompanyProfile } from "@/types/company";
import type { KycPrecheckResult } from "@/types/report";
import type { DgTresorScreeningState, ScreeningMatch } from "@/types/screening";
import type { SourceRecord } from "@/types/source";
import type { Locale } from "@/lib/i18n/config";
import { fetchCompanyFromAnnuaire } from "@/lib/clients/annuaire-client";
import { screenAmfWarnings } from "@/lib/clients/amf-client";
import { screenSanctions } from "@/lib/clients/sanctions-client";
import { demoCompanies, getDemoCompanyByIdentifier } from "@/lib/demo/companies";
import { getDemoScreeningMatches } from "@/lib/demo/screening-records";
import { getDictionary } from "@/lib/i18n/dictionary";
import { buildDgTresorState } from "@/lib/sanctions/dg-tresor-snapshot";
import { env } from "@/lib/utils/env";
import { validateIdentifier } from "./validate-identifier";
import { generateRedFlags } from "./red-flags";
import { buildRiskScoreBreakdown, calculateRiskScore, deriveRiskLevel } from "./risk-scoring";
import { generateReportMarkdown } from "./report-generator";
import { deriveDataMode, normalizeSourceChecks } from "./source-checks";
import { deriveReviewOutcome } from "./review-outcome";
import { generateEvidencePayload } from "./evidence-payload";
import { generateEscalationMemo } from "./escalation-memo";

function skippedSource(sourceName: SourceRecord["sourceName"], notes: string): SourceRecord {
  return {
    sourceName,
    status: "not_checked",
    mode: "skipped",
    checkedAt: new Date().toISOString(),
    notes,
  };
}

function demoDgTresorState(generatedAt: string, locale?: Locale): DgTresorScreeningState {
  const dictionary = getDictionary(locale);

  return {
    status: "success",
    publicationDate: generatedAt,
    snapshotGeneratedAt: generatedAt,
    recordCount: 0,
    indexVersion: 1,
    freshness: "fresh",
    message: dictionary.dgTresorState.demo,
  };
}

function buildCaseId(identifier: string, generatedAt: string) {
  const timestamp = generatedAt.replace(/\D/g, "").slice(0, 14);
  return `check_${identifier || "invalid"}_${timestamp}`;
}

function finalizeResult(
  input: {
    identifier: KycPrecheckResult["identifier"];
    company?: CompanyProfile;
    redFlags: KycPrecheckResult["redFlags"];
    sanctionsMatches: ScreeningMatch[];
    warningMatches: ScreeningMatch[];
    dgTresorState: DgTresorScreeningState;
    sourcesChecked: SourceRecord[];
    generatedAt: string;
    isDemo: boolean;
  },
  locale?: Locale,
): KycPrecheckResult {
  const riskScore = calculateRiskScore(input.redFlags);
  const riskLevel = deriveRiskLevel(riskScore);
  const risk = buildRiskScoreBreakdown(riskScore);
  const sourceChecks = normalizeSourceChecks({
    sources: input.sourcesChecked,
    sanctionsMatches: input.sanctionsMatches,
    warningMatches: input.warningMatches,
  });
  const dataMode = deriveDataMode({ isDemo: input.isDemo, sourceChecks });
  const reviewOutcome = deriveReviewOutcome({
    score: riskScore,
    flags: input.redFlags,
    sources: sourceChecks,
  });
  const caseId = buildCaseId(input.identifier.normalized, input.generatedAt);
  const evidencePayload = generateEvidencePayload({
    caseId,
    inputIdentifier: input.identifier.normalized || input.identifier.raw,
    generatedAt: input.generatedAt,
    dataMode,
    company: input.company,
    risk,
    flags: input.redFlags,
    sources: sourceChecks,
    reviewOutcome,
  });
  const escalationMemo = generateEscalationMemo({
    company: input.company,
    inputIdentifier: input.identifier.normalized || input.identifier.raw,
    reviewOutcome,
    riskLevel,
    displayScore: riskScore.display,
    flags: input.redFlags,
  });
  const resultWithoutReport: Omit<KycPrecheckResult, "reportMarkdown"> = {
    caseId,
    identifier: input.identifier,
    company: input.company,
    dataMode,
    riskLevel,
    riskScore,
    risk,
    redFlags: input.redFlags,
    sanctionsMatches: input.sanctionsMatches,
    warningMatches: input.warningMatches,
    dgTresorState: input.dgTresorState,
    sourcesChecked: input.sourcesChecked,
    sourceChecks,
    reviewOutcome,
    evidencePayload,
    escalationMemo,
    generatedAt: input.generatedAt,
    isDemo: input.isDemo,
  };

  return {
    ...resultWithoutReport,
    reportMarkdown: generateReportMarkdown(resultWithoutReport, locale),
  };
}

async function resolveCompany(identifier: string, forceDemo = false, locale?: Locale): Promise<{
  company?: CompanyProfile;
  sources: SourceRecord[];
  isDemo: boolean;
}> {
  const dictionary = getDictionary(locale);
  const demoCompany =
    forceDemo || env.enableDemoMode ? getDemoCompanyByIdentifier(identifier) : undefined;

  if (demoCompany) {
    return {
      company: demoCompany,
      sources: demoCompany.sourceRecords,
      isDemo: true,
    };
  }

  if (!env.enableExternalApiCalls) {
    return {
      sources: [
        skippedSource(
          "ANNUAIRE_ENTREPRISES",
          dictionary.sourceNotes.externalApisDisabled,
        ),
      ],
      isDemo: false,
    };
  }

  const lookup = await fetchCompanyFromAnnuaire(identifier);

  return {
    company: lookup.company,
    sources: [lookup.source],
    isDemo: false,
  };
}

export async function runPrecheck(
  rawIdentifier: string,
  options: { forceDemo?: boolean; locale?: Locale } = {},
): Promise<KycPrecheckResult> {
  const identifier = validateIdentifier(rawIdentifier);
  const generatedAt = new Date().toISOString();
  const dictionary = getDictionary(options.locale);

  if (!identifier.isValid) {
    const initial = {
      identifier,
      sanctionsMatches: [],
      warningMatches: [],
      dgTresorState: buildDgTresorState({
        status: "not_available",
        freshness: "unknown",
        message: dictionary.dgTresorState.invalidIdentifier,
      }),
      sourcesChecked: [],
      generatedAt,
      isDemo: false,
    };
    const redFlags = generateRedFlags({
      identifier,
      sanctionsMatches: [],
      warningMatches: [],
      sourcesChecked: [],
      locale: options.locale,
    });

    return finalizeResult(
      {
      ...initial,
      redFlags,
      },
      options.locale,
    );
  }

  const companyResolution = await resolveCompany(identifier.normalized, options.forceDemo, options.locale);
  const company = companyResolution.company;
  const sourcesChecked: SourceRecord[] = [...companyResolution.sources];
  let sanctionsMatches: ScreeningMatch[] = [];
  let warningMatches: ScreeningMatch[] = [];
  let dgTresorState = buildDgTresorState({
    status: "not_available",
    freshness: "unknown",
    message: dictionary.dgTresorState.notRun,
  });

  if (companyResolution.isDemo) {
    const demoMatches = getDemoScreeningMatches(company?.scenario);
    sanctionsMatches = demoMatches.sanctionsMatches;
    warningMatches = demoMatches.warningMatches;
    dgTresorState =
      company?.scenario === "source_timeout"
        ? buildDgTresorState({
            status: "failed",
            freshness: "unknown",
            message: "Demo degraded state: DG Tresor source timeout simulation.",
          })
        : demoDgTresorState(generatedAt, options.locale);

    if (company?.scenario === "source_timeout") {
      sourcesChecked.push(
        {
          sourceName: "DG_TRESOR_GELS",
          status: "failed",
          mode: "demo",
          checkedAt: generatedAt,
          error: "Demo degraded state: DG Tresor source timeout simulation.",
          freshness: "unknown",
        },
        {
          sourceName: "AMF_BLACKLIST",
          status: "success",
          mode: "demo",
          checkedAt: generatedAt,
          notes: dictionary.sourceNotes.demoScreening,
        },
      );
    } else if (company?.scenario === "stale_cached") {
      sourcesChecked.push(
        {
          sourceName: "DG_TRESOR_GELS",
          status: "success",
          mode: "snapshot",
          checkedAt: "2026-02-01T00:00:00.000Z",
          notes: "Demo degraded state: stale local snapshot metadata.",
          freshness: "very_stale",
        },
        {
          sourceName: "AMF_BLACKLIST",
          status: "success",
          mode: "demo",
          checkedAt: generatedAt,
          notes: dictionary.sourceNotes.demoScreening,
        },
      );
    } else {
      sourcesChecked.push(
        {
          sourceName: "DG_TRESOR_GELS",
          status: "success",
          mode: "demo",
          checkedAt: generatedAt,
          notes: dictionary.sourceNotes.demoScreening,
          freshness: "fresh",
        },
        {
          sourceName: "AMF_BLACKLIST",
          status: "success",
          mode: "demo",
          checkedAt: generatedAt,
          notes: dictionary.sourceNotes.demoScreening,
        },
      );
    }
  } else if (company && env.enableExternalApiCalls) {
    const [sanctions, warnings] = await Promise.all([
      screenSanctions({
        companyName: company.legalName,
        identifiers: [identifier.normalized, company.siren, company.siret].filter(Boolean) as string[],
        locale: options.locale,
      }),
      screenAmfWarnings({
        companyName: company.legalName,
        tradingName: company.tradingName,
      }),
    ]);

    sanctionsMatches = sanctions.matches;
    dgTresorState = sanctions.state;
    warningMatches = warnings.matches;
    sourcesChecked.push(sanctions.source, warnings.source);
  } else {
    dgTresorState = buildDgTresorState({
      status: "not_available",
      freshness: "unknown",
      message: dictionary.dgTresorState.noCompanyProfile,
    });
    sourcesChecked.push(
      skippedSource("DG_TRESOR_GELS", dictionary.sourceNotes.noCompanyProfile),
      skippedSource("AMF_BLACKLIST", dictionary.sourceNotes.noCompanyProfile),
    );
  }

  const redFlags = generateRedFlags({
    identifier,
    company,
    sanctionsMatches,
    warningMatches,
    sourcesChecked,
    locale: options.locale,
  });
  return finalizeResult(
    {
      identifier,
      company,
      redFlags,
      sanctionsMatches,
      warningMatches,
      dgTresorState,
      sourcesChecked,
      generatedAt,
      isDemo: companyResolution.isDemo,
    },
    options.locale,
  );
}

export function getDemoPrecheckIdentifiers() {
  return demoCompanies.map((company) => company.siren);
}
