import { z } from "zod";
import type { CompanyIdentifier } from "@/types/company";

export const identifierSchema = z
  .string()
  .min(1)
  .transform((value) => value.replace(/\D/g, ""));

export function isValidLuhn(value: string) {
  let sum = 0;
  let shouldDouble = false;

  for (let index = value.length - 1; index >= 0; index -= 1) {
    let digit = Number(value[index]);

    if (Number.isNaN(digit)) {
      return false;
    }

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

export function validateIdentifier(raw: string): CompanyIdentifier {
  const normalized = identifierSchema.safeParse(raw).success
    ? identifierSchema.parse(raw)
    : raw.replace(/\D/g, "");

  const type = normalized.length === 14 ? "siret" : "siren";
  const isExpectedLength = normalized.length === 9 || normalized.length === 14;

  return {
    raw,
    normalized,
    type,
    isValid: isExpectedLength && isValidLuhn(normalized),
  };
}
