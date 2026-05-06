import { describe, expect, it } from "vitest";
import { getDemoCompanyByIdentifier } from "@/lib/demo/companies";
import { generateRedFlags, isSensitiveActivity } from "@/lib/kyc/red-flags";
import { validateIdentifier } from "@/lib/kyc/validate-identifier";

describe("red flags", () => {
  it("detects sensitive activities", () => {
    expect(isSensitiveActivity("6619B")).toBe(true);
    expect(isSensitiveActivity("6201Z")).toBe(false);
  });

  it("generates multiple flags for inconsistent demo company", () => {
    const identifier = validateIdentifier("100000025");
    const company = getDemoCompanyByIdentifier("100000025");
    const flags = generateRedFlags({
      identifier,
      company,
      sanctionsMatches: [],
      warningMatches: [
        {
          listName: "AMF_BLACKLIST",
          matchType: "fuzzy",
          matchedValue: "Nova Capital Demo",
          confidence: 0.86,
          severity: "high",
          reviewLabel: "Potential match requiring review",
        },
      ],
      sourcesChecked: company?.sourceRecords ?? [],
      now: new Date("2026-05-02T12:00:00.000Z"),
    });

    expect(flags.map((flag) => flag.code)).toEqual(
      expect.arrayContaining([
        "ADDRESS_MISMATCH",
        "RECENTLY_CREATED_COMPANY",
        "SENSITIVE_ACTIVITY",
        "AMF_WARNING_POTENTIAL_MATCH",
      ]),
    );
    expect(flags.every((flag) => flag.evidence.length > 0)).toBe(true);
    expect(flags.every((flag) => flag.source.length > 0)).toBe(true);
    expect(
      flags
        .filter((flag) => ["high", "critical"].includes(flag.severity))
        .every((flag) => flag.recommendedAction.length > 0),
    ).toBe(true);
  });
});
