import type { RedFlag, RedFlagCode, RiskLevel, RiskScore } from "@/types/risk";

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
  const raw = redFlags.reduce((total, flag) => total + RED_FLAG_WEIGHTS[flag.code], 0);

  return {
    raw,
    display: Math.min(raw, 100),
  };
}

export function deriveRiskLevel(score: RiskScore): RiskLevel {
  if (score.raw >= 80) {
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
