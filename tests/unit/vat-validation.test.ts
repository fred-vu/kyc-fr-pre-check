import { describe, expect, it, vi } from "vitest";
import {
  extractFrenchSirenFromVat,
  normalizeVatNumber,
  validateVatNumber,
} from "@/lib/kyc/vat-validation";

describe("vat-validation", () => {
  it("normalizes VAT numbers and extracts the French SIREN suffix", () => {
    expect(normalizeVatNumber(" fr 40 552 100 554 ")).toBe("FR40552100554");
    expect(extractFrenchSirenFromVat("FR40552100554")).toBe("552100554");
    expect(extractFrenchSirenFromVat("DE123456789")).toBeUndefined();
  });

  it("maps a valid VIES response and cross-checks a French SIREN", async () => {
    const fetcher = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      expect(init?.method).toBe("POST");
      expect(JSON.parse(String(init?.body))).toEqual({
        countryCode: "FR",
        vatNumber: "40552100554",
      });

      return Response.json({
        countryCode: "FR",
        vatNumber: "40552100554",
        requestDate: "2026-05-11T10:00:00.000Z",
        valid: true,
        userError: "VALID",
        name: "TEST SAS",
        address: "1 RUE TEST",
      });
    });

    const result = await validateVatNumber("FR 40 552 100 554", {
      companySiren: "552100554",
      fetcher,
      now: new Date("2026-05-11T10:00:00.000Z"),
    });

    expect(result.status).toBe("valid");
    expect(result.valid).toBe(true);
    expect(result.normalized).toBe("FR40552100554");
    expect(result.name).toBe("TEST SAS");
    expect(result.sirenMatch).toBe("match");
    expect(result.matchedSiren).toBe("552100554");
  });

  it("returns an invalid result without calling VIES for invalid format", async () => {
    const fetcher = vi.fn();
    const result = await validateVatNumber("123", { fetcher });

    expect(fetcher).not.toHaveBeenCalled();
    expect(result.status).toBe("invalid");
    expect(result.valid).toBe(false);
    expect(result.userError).toBe("INVALID_FORMAT");
  });

  it("treats VIES transport failures as unavailable, not invalid", async () => {
    const result = await validateVatNumber("EE101600930", {
      fetcher: vi.fn(async () => {
        throw new Error("network down");
      }),
    });

    expect(result.status).toBe("unavailable");
    expect(result.valid).toBeNull();
    expect(result.error).toBe("network down");
  });
});
