import { describe, expect, it } from "vitest";
import { calculateRiskScore, deriveRiskLevel, RED_FLAG_WEIGHTS } from "@/lib/kyc/risk-scoring";
import type { RedFlag } from "@/types/risk";

const flag = (code: RedFlag["code"]): RedFlag => ({
  id: code.toLowerCase(),
  code,
  title: code,
  label: code,
  severity: "medium",
  category: "identity",
  description: code,
  evidence: `${code} evidence`,
  source: "test",
  scoreContribution: RED_FLAG_WEIGHTS[code],
  recommendedAction: "Review manually.",
  recommendation: "Review manually.",
  manualReviewRequired: true,
});

describe("risk scoring", () => {
  it("calculates additive raw score and capped display score", () => {
    const score = calculateRiskScore([
      flag("SENSITIVE_ACTIVITY"),
      flag("AMF_WARNING_POTENTIAL_MATCH"),
      flag("SOURCE_UNAVAILABLE"),
    ]);

    expect(score.raw).toBe(115);
    expect(score.display).toBe(100);
  });

  it("derives risk level from raw score", () => {
    expect(deriveRiskLevel({ raw: 24, display: 24, capped: false, contributions: [] })).toBe("low");
    expect(deriveRiskLevel({ raw: 25, display: 25, capped: false, contributions: [] })).toBe("medium");
    expect(deriveRiskLevel({ raw: 50, display: 50, capped: false, contributions: [] })).toBe("high");
    expect(deriveRiskLevel({ raw: 75, display: 75, capped: false, contributions: [] })).toBe("critical");
  });
});
