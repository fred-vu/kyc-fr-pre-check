import { describe, expect, it } from "vitest";
import { runPrecheck } from "@/lib/kyc/run-precheck";

describe("runPrecheck", () => {
  it("runs complete demo pre-check without external APIs", async () => {
    const result = await runPrecheck("100000025");

    expect(result.isDemo).toBe(true);
    expect(result.company?.legalName).toBe("Nova Capital Demo SAS");
    expect(result.warningMatches.length).toBe(1);
    expect(result.riskLevel).toBe("critical");
    expect(result.dgTresorState.status).toBe("success");
    expect(result.dgTresorState.freshness).toBe("fresh");
  });

  it("handles invalid identifiers safely", async () => {
    const result = await runPrecheck("bad-value");

    expect(result.identifier.isValid).toBe(false);
    expect(result.redFlags.map((flag) => flag.code)).toContain("INVALID_IDENTIFIER");
    expect(result.company).toBeUndefined();
    expect(result.dgTresorState.status).toBe("not_available");
  });
});
