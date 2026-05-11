import { describe, expect, it } from "vitest";
import { maskIban, normalizeIban, validateIban } from "@/lib/kyc/iban-validation";

describe("iban-validation", () => {
  it("validates a known-good IBAN locally and masks the account number", () => {
    const result = validateIban("DE89 3704 0044 0532 0130 00", {
      now: new Date("2026-05-11T10:00:00.000Z"),
    });

    expect(result.status).toBe("valid");
    expect(result.valid).toBe(true);
    expect(result.countryCode).toBe("DE");
    expect(result.checksumDigits).toBe("89");
    expect(result.inSepaZone).toBe(true);
    expect(result.masked).toBe("DE89 **** **** **** **** 3000");
    expect(JSON.stringify(result)).not.toContain("370400440532013000");
  });

  it("returns validation error details for invalid checksums", () => {
    const result = validateIban("DE89370400440532013001");

    expect(result.status).toBe("invalid");
    expect(result.valid).toBe(false);
    expect(result.errorCodes).toContain("WrongIBANChecksum");
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("normalizes and masks IBAN-like input consistently", () => {
    expect(normalizeIban(" fr76 3000-6000 0112 3456 7890 189 ")).toBe(
      "FR7630006000011234567890189",
    );
    expect(maskIban("FR7630006000011234567890189")).toBe(
      "FR76 **** **** **** **** **** 0189",
    );
  });
});
