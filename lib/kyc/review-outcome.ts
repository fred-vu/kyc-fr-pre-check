import type { RedFlag, ReviewOutcome, RiskScore } from "@/types/risk";
import type { SourceCheck } from "@/types/source";

export function deriveReviewOutcome(params: {
  score: RiskScore;
  flags: RedFlag[];
  sources: SourceCheck[];
}): ReviewOutcome {
  const hasCriticalSourceFailure = params.sources.some((source) =>
    ["failed", "timeout", "unavailable"].includes(source.status),
  );
  const hasCriticalFlag = params.flags.some((flag) => flag.severity === "critical");
  const hasHighFlag = params.flags.some((flag) => flag.severity === "high");
  const hasManualReviewFlag = params.flags.some((flag) => flag.manualReviewRequired);

  if (hasCriticalSourceFailure) {
    return "INSUFFICIENT_DATA";
  }

  if (hasCriticalFlag || params.score.raw >= 75) {
    return "ESCALATE_BEFORE_ONBOARDING";
  }

  if (hasHighFlag || hasManualReviewFlag || params.score.raw >= 50) {
    return "MANUAL_REVIEW_REQUIRED";
  }

  return "PASS_PRE_CHECK";
}
