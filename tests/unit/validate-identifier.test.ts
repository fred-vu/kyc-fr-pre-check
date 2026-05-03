import { describe, expect, it } from "vitest";
import { validateIdentifier } from "@/lib/kyc/validate-identifier";

describe("validateIdentifier", () => {
  it("accepts checksum-valid demo SIREN values", () => {
    expect(validateIdentifier("100000009")).toMatchObject({
      normalized: "100000009",
      type: "siren",
      isValid: true,
    });
  });

  it("accepts checksum-valid demo SIRET values", () => {
    expect(validateIdentifier("10000000900017")).toMatchObject({
      normalized: "10000000900017",
      type: "siret",
      isValid: true,
    });
  });

  it("rejects invalid identifiers", () => {
    expect(validateIdentifier("123")).toMatchObject({
      normalized: "123",
      isValid: false,
    });
  });
});
