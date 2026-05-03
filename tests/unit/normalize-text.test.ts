import { describe, expect, it } from "vitest";
import {
  getCompanyNameCandidates,
  normalizeAddress,
  normalizeCompanyName,
  normalizeText,
} from "@/lib/kyc/normalize-text";

describe("text normalization", () => {
  it("normalizes accents and punctuation", () => {
    expect(normalizeText("Societe ABC-Trading, Lyon")).toBe("societe abc trading lyon");
  });

  it("normalizes ampersands as French et for entity names", () => {
    expect(normalizeText("ASSOCIATION SCIENCES & EDUCATION")).toBe(
      "association sciences et education",
    );
  });

  it("removes common legal forms from company names", () => {
    expect(normalizeCompanyName("Hexa Services Demo SAS")).toBe("hexa services demo");
  });

  it("removes association as a French legal descriptor", () => {
    expect(normalizeCompanyName("association « JONAS PARIS »")).toBe("jonas paris");
  });

  it("creates candidates from parenthetical and quoted entity names", () => {
    expect(getCompanyNameCandidates("SODELIM (TAWHID)")).toEqual(
      expect.arrayContaining(["sodelim tawhid", "sodelim", "tawhid"]),
    );
    expect(getCompanyNameCandidates("association « JONAS PARIS »")).toEqual(
      expect.arrayContaining(["jonas paris"]),
    );
  });

  it("normalizes common address tokens", () => {
    expect(normalizeAddress("12 Rue du Canal")).toBe("12 r du canal");
  });
});
