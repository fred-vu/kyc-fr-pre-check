import { describe, expect, it } from "vitest";
import { deriveReviewOutcome } from "@/lib/kyc/review-outcome";
import type { RedFlag, RiskScore } from "@/types/risk";
import type { SourceCheck } from "@/types/source";

const score = (raw: number): RiskScore => ({
  raw,
  display: Math.min(raw, 100),
  capped: raw > 100,
  contributions: [],
});

const flag = (severity: RedFlag["severity"], manualReviewRequired = false): RedFlag => ({
  id: `${severity}_flag`,
  code: "SENSITIVE_ACTIVITY",
  title: `${severity} flag`,
  label: `${severity} flag`,
  severity,
  category: "activity",
  description: "Detected indicator.",
  evidence: "Activity code: 6619B.",
  source: "test",
  scoreContribution: 40,
  recommendedAction: "Review manually.",
  recommendation: "Review manually.",
  manualReviewRequired,
});

const source = (status: SourceCheck["status"]): SourceCheck => ({
  id: `source_${status}`,
  label: "Test source",
  provider: "Test provider",
  status,
  checkedAt: "2026-05-06T00:00:00.000Z",
  mode: "live",
  confidence: "high",
});

describe("review outcome", () => {
  it("routes low-risk checks to pass pre-check", () => {
    expect(deriveReviewOutcome({ score: score(0), flags: [], sources: [source("success")] })).toBe(
      "PASS_PRE_CHECK",
    );
  });

  it("routes manual-review flags to manual review", () => {
    expect(
      deriveReviewOutcome({
        score: score(30),
        flags: [flag("medium", true)],
        sources: [source("success")],
      }),
    ).toBe("MANUAL_REVIEW_REQUIRED");
  });

  it("routes critical score to escalation", () => {
    expect(
      deriveReviewOutcome({
        score: score(75),
        flags: [flag("critical", true)],
        sources: [source("success")],
      }),
    ).toBe("ESCALATE_BEFORE_ONBOARDING");
  });

  it("routes source failures to insufficient data", () => {
    expect(
      deriveReviewOutcome({
        score: score(10),
        flags: [],
        sources: [source("timeout")],
      }),
    ).toBe("INSUFFICIENT_DATA");
  });
});
