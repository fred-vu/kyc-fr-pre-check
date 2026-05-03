import type { KycPrecheckResult } from "@/types/report";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";

function formatDate(value: string | undefined, empty: string) {
  if (!value) {
    return empty;
  }

  return value;
}

function formatAddress(value: string | undefined, empty: string) {
  return value || empty;
}

export function generateReportMarkdown(
  result: Omit<KycPrecheckResult, "reportMarkdown">,
  locale?: Locale,
) {
  const dictionary = getDictionary(locale);
  const labels = dictionary.report;
  const empty = labels.notAvailable;
  const company = result.company;
  const dgState = result.dgTresorState;
  const redFlags = result.redFlags.length
    ? result.redFlags
        .map(
          (flag) =>
            `| ${dictionary.badges.riskLevels[flag.severity].toUpperCase()} | ${flag.label} | ${flag.description} | ${flag.recommendation} |`,
        )
        .join("\n")
    : `| ${dictionary.badges.riskLevels.low.toUpperCase()} | ${labels.noMajorIndicatorRow} | ${labels.noMajorFinding} | ${labels.standardReview} |`;

  const sanctionsMatches = result.sanctionsMatches.length
    ? result.sanctionsMatches
        .map((match) => `- ${dictionary.screeningCard.potentialMatchLabel}: ${match.matchedValue} (${match.matchType})`)
        .join("\n")
    : `- ${labels.noPotentialMatch}`;

  const warningMatches = result.warningMatches.length
    ? result.warningMatches
        .map((match) => `- ${dictionary.screeningCard.potentialMatchLabel}: ${match.matchedValue} (${match.matchType})`)
        .join("\n")
    : `- ${labels.noPotentialMatch}`;

  const sources = result.sourcesChecked
    .map(
      (source) =>
        `- ${source.sourceName}: ${dictionary.badges.sourceStatuses[source.status]} (${dictionary.badges.sourceModes[source.mode]})${source.error ? ` - ${source.error}` : ""}`,
    )
    .join("\n");

  return `# ${labels.title}

## ${labels.companyIdentity}
- ${labels.legalName}: ${company?.legalName || empty}
- SIREN: ${company?.siren || result.identifier.normalized || empty}
- SIRET: ${company?.siret || empty}
- ${labels.legalForm}: ${company?.legalForm || empty}
- ${labels.activityCode}: ${company?.activityCode || empty}
- ${labels.activityLabel}: ${company?.activityLabel || empty}
- ${labels.status}: ${company?.status || labels.unknown}
- ${labels.address}: ${formatAddress(company?.headOfficeAddress?.raw, empty)}
- ${labels.creationDate}: ${formatDate(company?.creationDate, empty)}

## ${labels.riskSummary}
- ${labels.indicativeRiskLevel}: ${dictionary.badges.riskLevels[result.riskLevel].toUpperCase()}
- ${labels.riskScore}: ${result.riskScore.display}/100
- ${labels.rawAdditiveScore}: ${result.riskScore.raw}
- ${labels.generatedAt}: ${result.generatedAt}

## ${labels.keyFindings}
${result.redFlags.length ? result.redFlags.map((flag, index) => `${index + 1}. ${flag.label}`).join("\n") : `1. ${labels.noMajorFinding}`}

## ${labels.redFlags}
| ${labels.severity} | ${labels.flag} | ${labels.description} | ${labels.recommendedAction} |
|---|---|---|---|
${redFlags}

## ${labels.screeningResults}
### ${labels.dgTresor}
${sanctionsMatches}

### ${labels.amf}
${warningMatches}

## ${labels.screeningFreshness}
- ${labels.dgStatus}: ${dgState.status}
- ${labels.dgFreshness}: ${dictionary.badges.freshness[dgState.freshness]}
- ${labels.dgPublicationDate}: ${dgState.publicationDate || empty}
- ${labels.dgSnapshotGeneratedAt}: ${dgState.snapshotGeneratedAt || empty}
- ${labels.dgRecordCount}: ${dgState.recordCount ?? 0}
- ${labels.dgNotes}: ${dgState.message}

## ${labels.sourcesChecked}
${sources || `- ${labels.noSourceChecked}`}

## ${labels.disclaimerTitle}
${labels.disclaimer}
`;
}
