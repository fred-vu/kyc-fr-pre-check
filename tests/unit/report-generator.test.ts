import { describe, expect, it } from "vitest";
import { runPrecheck } from "@/lib/kyc/run-precheck";

describe("report generation", () => {
  it("generates a markdown report for demo fixture", async () => {
    const result = await runPrecheck("100000009");

    expect(result.reportMarkdown).toContain("# French Company KYC Pre-Check Report");
    expect(result.reportMarkdown).toContain("Hexa Services Demo SAS");
    expect(result.reportMarkdown).toContain("Disclaimer");
  });

  it("generates a French markdown report when requested", async () => {
    const result = await runPrecheck("100000009", { locale: "fr" });

    expect(result.reportMarkdown).toContain("# Rapport de pré-contrôle KYC entreprise française");
    expect(result.reportMarkdown).toContain("Hexa Services Demo SAS");
    expect(result.reportMarkdown).toContain("Clause de non-responsabilité");
  });
});
