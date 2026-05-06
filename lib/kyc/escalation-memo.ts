import type { CompanyProfile } from "@/types/company";
import type { RedFlag, ReviewOutcome, RiskLevel } from "@/types/risk";

const escalationOutcomes: ReviewOutcome[] = [
  "MANUAL_REVIEW_REQUIRED",
  "ESCALATE_BEFORE_ONBOARDING",
];

export function generateEscalationMemo(input: {
  company?: CompanyProfile;
  inputIdentifier: string;
  reviewOutcome: ReviewOutcome;
  riskLevel: RiskLevel;
  displayScore: number;
  flags: RedFlag[];
}) {
  if (
    !["high", "critical"].includes(input.riskLevel) ||
    !escalationOutcomes.includes(input.reviewOutcome)
  ) {
    return undefined;
  }

  const materialFlags = input.flags.filter((flag) =>
    ["high", "critical"].includes(flag.severity),
  );
  const concerns = materialFlags.length ? materialFlags : input.flags.slice(0, 3);
  const recommendedAction =
    concerns.find((flag) => flag.recommendedAction)?.recommendedAction ??
    "Route the case to manual compliance review before proceeding.";

  return `Preliminary KYB escalation memo

Company: ${input.company?.legalName ?? "Not available"}
Identifier: ${input.company?.siren ?? input.inputIdentifier}
Outcome: ${input.reviewOutcome}
Risk level: ${input.riskLevel}
Score: ${input.displayScore}/100

Key concerns:
${concerns.map((flag) => `- ${flag.title}: ${flag.evidence}`).join("\n")}

Recommended next step:
${recommendedAction}

Note: This is a preliminary pre-check and not a final compliance decision.`;
}
