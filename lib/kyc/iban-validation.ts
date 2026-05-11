import {
  electronicFormatIBAN,
  friendlyFormatIBAN,
  isSEPACountry,
  validateIBAN,
  ValidationErrorsIBAN,
} from "ibantools";
import type { IbanValidationResult } from "@/types/additional-checks";

const IBAN_PROVIDER = "ibantools";

const ibanErrorMessages: Record<string, string> = {
  NoIBANProvided: "No IBAN was provided.",
  NoIBANCountry: "The IBAN country code is missing or unsupported.",
  WrongBBANLength: "The BBAN length does not match the country specification.",
  WrongBBANFormat: "The BBAN format does not match the country specification.",
  ChecksumNotNumber: "The IBAN checksum digits are not numeric.",
  WrongIBANChecksum: "The IBAN checksum is invalid.",
  WrongAccountBankBranchChecksum:
    "The national account, bank, or branch checksum is invalid.",
  QRIBANNotAllowed: "QR-IBAN values are not allowed for this check.",
};

function nowIso(now?: Date) {
  return (now ?? new Date()).toISOString();
}

export function normalizeIban(raw: string) {
  return electronicFormatIBAN(raw)?.replace(/[^A-Z0-9]/g, "") ?? "";
}

export function maskIban(raw: string) {
  const normalized = normalizeIban(raw);

  if (!normalized) {
    return "";
  }

  if (normalized.length <= 8) {
    return normalized.replace(/[A-Z0-9]/g, "*");
  }

  const visibleStart = normalized.slice(0, 4);
  const visibleEnd = normalized.slice(-4);
  const middleGroups = Math.max(1, Math.ceil((normalized.length - 8) / 4));

  return `${visibleStart} ${Array.from({ length: middleGroups }, () => "****").join(
    " ",
  )} ${visibleEnd}`;
}

function ibanErrorName(code: ValidationErrorsIBAN) {
  return ValidationErrorsIBAN[code] ?? "UnknownIBANValidationError";
}

export function validateIban(
  raw: string,
  options: { now?: Date; allowQRIBAN?: boolean } = {},
): IbanValidationResult {
  const normalized = normalizeIban(raw);
  const checkedAt = nowIso(options.now);
  const validation = validateIBAN(normalized, {
    allowQRIBAN: options.allowQRIBAN ?? false,
  });
  const countryCode = normalized.slice(0, 2);
  const checksumDigits = normalized.slice(2, 4);
  const errorCodes = validation.errorCodes.map(ibanErrorName);
  const errors = errorCodes.map(
    (code) => ibanErrorMessages[code] ?? "The IBAN could not be validated.",
  );
  const friendly = validation.valid ? friendlyFormatIBAN(normalized) : null;

  return {
    kind: "iban",
    status: validation.valid ? "valid" : "invalid",
    valid: validation.valid,
    masked: maskIban(friendly ?? normalized),
    countryCode,
    checksumDigits,
    inSepaZone: countryCode ? isSEPACountry(countryCode) : null,
    errorCodes,
    errors,
    notes: [
      "Local IBAN structure and checksum validation only.",
      "This check does not confirm account ownership, balance, or account status.",
    ],
    source: {
      sourceName: "IBAN_LOCAL_VALIDATION",
      provider: IBAN_PROVIDER,
      mode: "local",
      checkedAt,
    },
  };
}
