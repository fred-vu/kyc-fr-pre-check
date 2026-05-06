import type { RedFlag, RedFlagCode, RiskLevel, RiskScore, RiskScoreBreakdown } from "@/types/risk";

export const RED_FLAG_WEIGHTS: Record<RedFlagCode, number> = {
  INVALID_IDENTIFIER: 50,
  COMPANY_NOT_FOUND: 50,
  COMPANY_INACTIVE: 30,
  COMPANY_CLOSED: 40,
  MISSING_LEGAL_NAME: 20,
  MISSING_ADDRESS: 20,
  ADDRESS_MISMATCH: 25,
  NAME_MISMATCH: 25,
  RECENTLY_CREATED_COMPANY: 35,
  SENSITIVE_ACTIVITY: 40,
  AMF_WARNING_POTENTIAL_MATCH: 60,
  SANCTIONS_POTENTIAL_MATCH: 90,
  SOURCE_UNAVAILABLE: 15,
};

export function calculateRiskScore(redFlags: RedFlag[]): RiskScore {
  const contributions = redFlags.map((flag) => ({
    flagId: flag.id,
    label: flag.label,
    points: flag.scoreContribution,
  }));
  const raw = contributions.reduce((total, contribution) => total + contribution.points, 0);
  const display = Math.min(raw, 100);

  return {
    raw,
    display,
    capped: raw > display,
    contributions,
  };
}

export function deriveRiskLevel(score: RiskScore): RiskLevel {
  if (score.raw >= 75) {
    return "critical";
  }

  if (score.raw >= 50) {
    return "high";
  }

  if (score.raw >= 25) {
    return "medium";
  }

  return "low";
}

export function buildRiskScoreBreakdown(score: RiskScore): RiskScoreBreakdown {
  return {
    ...score,
    level: deriveRiskLevel(score),
    thresholdExplanation: "0-24: low; 25-49: medium; 50-74: high; 75-100: critical.",
    modelDescription:
      "Deterministic rule-based scoring. Each risk indicator contributes fixed points. The displayed score is capped at 100 and is not a probability or final compliance decision.",
  };
}
