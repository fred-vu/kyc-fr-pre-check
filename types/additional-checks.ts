export type AdditionalCheckStatus = "valid" | "invalid" | "unavailable";

export type AdditionalCheckSourceName = "EU_VIES_VAT" | "IBAN_LOCAL_VALIDATION";

export type AdditionalCheckSource = {
  sourceName: AdditionalCheckSourceName;
  provider: string;
  mode: "live" | "local";
  checkedAt: string;
  url?: string;
};

export type VatSirenMatchStatus = "match" | "mismatch" | "not_applicable" | "not_checked";

export type VatValidationResult = {
  kind: "vat";
  status: AdditionalCheckStatus;
  valid: boolean | null;
  raw: string;
  normalized: string;
  countryCode: string;
  vatNumber: string;
  name?: string;
  address?: string;
  requestDate?: string;
  userError?: string;
  sirenMatch: VatSirenMatchStatus;
  matchedSiren?: string;
  notes: string[];
  error?: string;
  source: AdditionalCheckSource;
};

export type IbanValidationResult = {
  kind: "iban";
  status: AdditionalCheckStatus;
  valid: boolean;
  masked: string;
  countryCode: string;
  checksumDigits: string;
  inSepaZone: boolean | null;
  errorCodes: string[];
  errors: string[];
  notes: string[];
  source: AdditionalCheckSource;
};
