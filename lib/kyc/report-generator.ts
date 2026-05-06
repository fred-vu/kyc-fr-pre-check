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

function tableValue(value: string | number | undefined, empty: string) {
  return `${value ?? empty}`.replace(/\|/g, "\\|").replace(/\n/g, " ");
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
            `| ${dictionary.badges.riskLevels[flag.severity].toUpperCase()} | ${tableValue(
              flag.label,
              empty,
            )} | ${tableValue(flag.evidence, empty)} | ${tableValue(flag.source, empty)} | ${
              flag.scoreContribution
            } | ${tableValue(flag.recommendedAction, empty)} |`,
        )
        .join("\n")
    : `| ${dictionary.badges.riskLevels.low.toUpperCase()} | ${labels.noMajorIndicatorRow} | ${labels.noMajorFinding} | ${labels.notAvailable} | 0 | ${labels.standardReview} |`;

  const scoreBreakdown = result.risk.contributions.length
    ? result.risk.contributions
        .map((contribution) => `| ${tableValue(contribution.label, empty)} | ${contribution.points} |`)
        .join("\n")
    : `| ${labels.noMajorIndicatorRow} | 0 |`;

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

  const sources = result.sourceChecks
    .map(
      (source) =>
        `| ${tableValue(source.label, empty)} | ${tableValue(source.provider, empty)} | ${
          dictionary.badges.sourceCheckStatuses[source.status]
        } | ${source.mode} | ${source.checkedAt} | ${source.confidence ?? empty} | ${tableValue(
          source.details,
          empty,
        )} |`,
    )
    .join("\n");

  const recommendedActions = result.redFlags.length
    ? result.redFlags
        .filter((flag) => flag.manualReviewRequired || ["high", "critical"].includes(flag.severity))
        .map((flag, index) => `${index + 1}. ${flag.recommendedAction}`)
        .join("\n")
    : `1. ${labels.standardReview}`;

  return `# ${labels.title}

## ${labels.caseMetadata}
- ${labels.caseId}: ${result.caseId}
- ${labels.inputIdentifier}: ${result.identifier.normalized || result.identifier.raw || empty}
- ${labels.generatedAt}: ${result.generatedAt}
- ${labels.dataMode}: ${dictionary.dataMode.modes[result.dataMode]}

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
- ${labels.reviewOutcome}: ${dictionary.reviewOutcome.labels[result.reviewOutcome]}
- ${labels.indicativeRiskLevel}: ${dictionary.badges.riskLevels[result.riskLevel].toUpperCase()}
- ${labels.riskScore}: ${result.riskScore.display}/100
- ${labels.rawAdditiveScore}: ${result.riskScore.raw}
- ${labels.displayedScoreCapped}: ${result.riskScore.capped ? "yes" : "no"}
- ${labels.scoringModel}: ${result.risk.modelDescription}
- ${labels.generatedAt}: ${result.generatedAt}

## ${labels.scoreBreakdown}
| ${labels.indicator} | ${labels.points} |
|---|---:|
${scoreBreakdown}

## ${labels.keyFindings}
${result.redFlags.length ? result.redFlags.map((flag, index) => `${index + 1}. ${flag.label}`).join("\n") : `1. ${labels.noMajorFinding}`}

## ${labels.redFlags}
| ${labels.severity} | ${labels.flag} | ${labels.evidence} | ${labels.source} | ${labels.points} | ${labels.recommendedAction} |
|---|---|---|---|---:|---|
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
| ${labels.source} | ${labels.provider} | ${labels.sourceStatus} | ${labels.mode} | ${labels.checkedAt} | ${labels.confidence} | ${labels.notes} |
|---|---|---|---|---|---|---|
${sources || `| ${labels.noSourceChecked} | ${empty} | ${empty} | ${empty} | ${empty} | ${empty} | ${empty} |`}

## ${labels.recommendedActions}
${recommendedActions}

## ${labels.disclaimerTitle}
${labels.disclaimer}
`;
}
