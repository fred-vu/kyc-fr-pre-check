import { describe, expect, it } from "vitest";
import {
  extractDomain,
  isExactCompanyNameMatch,
  isNearExactCompanyNameMatch,
  levenshteinDistance,
} from "@/lib/kyc/matching";

describe("matching", () => {
  it("matches names after legal suffix normalization", () => {
    expect(isExactCompanyNameMatch("ABC Trading SAS", "ABC Trading")).toBe(true);
  });

  it("matches DG Tresor names that use et while company data uses ampersand", () => {
    expect(
      isExactCompanyNameMatch(
        "ASSOCIATION SCIENCES & EDUCATION",
        "Association Sciences et éducation",
      ),
    ).toBe(true);
  });

  it("matches the current DG Tresor legal-entity edge cases", () => {
    expect(isExactCompanyNameMatch("SMART PEGASUS", "Smart Pegasus")).toBe(true);
    expect(isExactCompanyNameMatch("LUMIERES ELYSEES", "Lumières Elysées")).toBe(true);
    expect(isExactCompanyNameMatch("SODELIM (TAWHID)", "SODELIM")).toBe(true);
    expect(isExactCompanyNameMatch("ASSOCIATION CENTRE TAWHID", "Centre TAWHID")).toBe(true);
    expect(isExactCompanyNameMatch("JONAS PARIS", "association « JONAS PARIS »")).toBe(true);
  });

  it("allows near-exact matching for conservative screening", () => {
    expect(isNearExactCompanyNameMatch("Nova Capital", "Nova Capitale")).toBe(true);
  });

  it("does not near-match short sanctions names", () => {
    expect(isNearExactCompanyNameMatch("SODELIM (TAWHID)", "RASHID")).toBe(false);
    expect(isNearExactCompanyNameMatch("SODELIM (TAWHID)", "TAWIL")).toBe(false);
  });

  it("computes edit distance", () => {
    expect(levenshteinDistance("abc", "abcd")).toBe(1);
  });

  it("extracts domains", () => {
    expect(extractDomain("https://www.example.fr/path")).toBe("example.fr");
  });
});
