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
import { calculateRiskScore, deriveRiskLevel } from "./risk-scoring";
import { generateReportMarkdown } from "./report-generator";

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
    const initial: Omit<KycPrecheckResult, "reportMarkdown"> = {
      identifier,
      riskLevel: "unknown",
      riskScore: { raw: 0, display: 0 },
      redFlags: [],
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
    const riskScore = calculateRiskScore(redFlags);
    const resultWithoutReport = {
      ...initial,
      riskLevel: deriveRiskLevel(riskScore),
      riskScore,
      redFlags,
    };

    return {
      ...resultWithoutReport,
      reportMarkdown: generateReportMarkdown(resultWithoutReport, options.locale),
    };
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
    dgTresorState = demoDgTresorState(generatedAt, options.locale);
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
  const riskScore = calculateRiskScore(redFlags);
  const resultWithoutReport: Omit<KycPrecheckResult, "reportMarkdown"> = {
    identifier,
    company,
    riskLevel: deriveRiskLevel(riskScore),
    riskScore,
    redFlags,
    sanctionsMatches,
    warningMatches,
    dgTresorState,
    sourcesChecked,
    generatedAt,
    isDemo: companyResolution.isDemo,
  };

  return {
    ...resultWithoutReport,
    reportMarkdown: generateReportMarkdown(resultWithoutReport, options.locale),
  };
}

export function getDemoPrecheckIdentifiers() {
  return demoCompanies.map((company) => company.siren);
}
