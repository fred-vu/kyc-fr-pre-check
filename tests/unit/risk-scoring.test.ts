import { describe, expect, it } from "vitest";
import { calculateRiskScore, deriveRiskLevel } from "@/lib/kyc/risk-scoring";
import type { RedFlag } from "@/types/risk";

const flag = (code: RedFlag["code"]): RedFlag => ({
  code,
  label: code,
  severity: "medium",
  description: code,
  source: "test",
  recommendation: "Review manually.",
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
    expect(deriveRiskLevel({ raw: 24, display: 24 })).toBe("low");
    expect(deriveRiskLevel({ raw: 25, display: 25 })).toBe("medium");
    expect(deriveRiskLevel({ raw: 50, display: 50 })).toBe("high");
    expect(deriveRiskLevel({ raw: 80, display: 80 })).toBe("critical");
  });
});
