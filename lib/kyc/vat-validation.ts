import type { VatSirenMatchStatus, VatValidationResult } from "@/types/additional-checks";
import { env, userAgent } from "@/lib/utils/env";
import { fetchWithTimeout } from "@/lib/utils/fetch-with-timeout";

const VIES_REST_URL =
  "https://ec.europa.eu/taxation_customs/vies/rest-api/check-vat-number";
const VIES_SOURCE_URL = "https://ec.europa.eu/taxation_customs/vies/";
const VAT_PATTERN = /^[A-Z]{2}[0-9A-Z+*.]{2,12}$/;

type VatFetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

type ViesResponse = {
  countryCode?: unknown;
  vatNumber?: unknown;
  requestDate?: unknown;
  valid?: unknown;
  isValid?: unknown;
  userError?: unknown;
  name?: unknown;
  address?: unknown;
};

function nowIso(now?: Date) {
  return (now ?? new Date()).toISOString();
}

function textValue(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function booleanValue(value: unknown) {
  return typeof value === "boolean" ? value : undefined;
}

export function normalizeVatNumber(raw: string) {
  return raw.replace(/[\s_-]/g, "").toUpperCase();
}

export function extractFrenchSirenFromVat(normalizedVat: string) {
  if (!normalizedVat.startsWith("FR")) {
    return undefined;
  }

  const candidate = normalizedVat.slice(-9);

  return /^\d{9}$/.test(candidate) ? candidate : undefined;
}

function normalizeSiren(value: string | undefined) {
  const normalized = value?.replace(/\D/g, "") ?? "";

  return normalized.length === 9 ? normalized : undefined;
}

function deriveSirenMatch(input: {
  normalizedVat: string;
  countryCode: string;
  companySiren?: string;
}): { status: VatSirenMatchStatus; matchedSiren?: string; note?: string } {
  if (input.countryCode !== "FR") {
    return {
      status: "not_applicable",
      note: "SIREN cross-check only applies to French VAT numbers.",
    };
  }

  const companySiren = normalizeSiren(input.companySiren);

  if (!companySiren) {
    return {
      status: "not_checked",
      note: "No company SIREN was available for cross-check.",
    };
  }

  const vatSiren = extractFrenchSirenFromVat(input.normalizedVat);

  if (!vatSiren) {
    return {
      status: "mismatch",
      note: "The French VAT number does not expose a usable SIREN suffix.",
    };
  }

  return {
    status: vatSiren === companySiren ? "match" : "mismatch",
    matchedSiren: vatSiren,
    note:
      vatSiren === companySiren
        ? "The French VAT SIREN suffix matches the checked company."
        : "The French VAT SIREN suffix does not match the checked company.",
  };
}

function baseResult(input: {
  raw: string;
  normalized: string;
  checkedAt: string;
  companySiren?: string;
}) {
  const countryCode = input.normalized.slice(0, 2);
  const vatNumber = input.normalized.slice(2);
  const sirenMatch = deriveSirenMatch({
    normalizedVat: input.normalized,
    countryCode,
    companySiren: input.companySiren,
  });

  return {
    raw: input.raw,
    normalized: input.normalized,
    countryCode,
    vatNumber,
    sirenMatch,
    source: {
      sourceName: "EU_VIES_VAT" as const,
      provider: "European Commission VIES",
      mode: "live" as const,
      checkedAt: input.checkedAt,
      url: VIES_SOURCE_URL,
    },
  };
}

function invalidResult(input: {
  raw: string;
  normalized: string;
  checkedAt: string;
  companySiren?: string;
  userError: string;
  note: string;
}): VatValidationResult {
  const result = baseResult(input);

  return {
    kind: "vat",
    status: "invalid",
    valid: false,
    raw: result.raw,
    normalized: result.normalized,
    countryCode: result.countryCode,
    vatNumber: result.vatNumber,
    userError: input.userError,
    sirenMatch: result.sirenMatch.status,
    matchedSiren: result.sirenMatch.matchedSiren,
    notes: [input.note, result.sirenMatch.note].filter(Boolean) as string[],
    source: result.source,
  };
}

async function postToVies(input: {
  countryCode: string;
  vatNumber: string;
  fetcher?: VatFetcher;
  timeoutMs?: number;
}) {
  const body = JSON.stringify({
    countryCode: input.countryCode,
    vatNumber: input.vatNumber,
  });
  const init: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": userAgent,
    },
    body,
  };

  if (input.fetcher) {
    return input.fetcher(VIES_REST_URL, init);
  }

  return fetchWithTimeout(VIES_REST_URL, init, input.timeoutMs ?? env.externalFetchTimeoutMs);
}

export async function validateVatNumber(
  raw: string,
  options: { companySiren?: string; fetcher?: VatFetcher; timeoutMs?: number; now?: Date } = {},
): Promise<VatValidationResult> {
  const normalized = normalizeVatNumber(raw);
  const checkedAt = nowIso(options.now);

  if (!VAT_PATTERN.test(normalized)) {
    return invalidResult({
      raw,
      normalized,
      checkedAt,
      companySiren: options.companySiren,
      userError: "INVALID_FORMAT",
      note: "Expected a two-letter country code followed by 2 to 12 VAT characters.",
    });
  }

  if (normalized.startsWith("GB")) {
    return invalidResult({
      raw,
      normalized,
      checkedAt,
      companySiren: options.companySiren,
      userError: "GB_UNSUPPORTED_BY_VIES",
      note: 'VIES no longer supports GB VAT numbers. Northern Ireland VAT numbers should use the "XI" prefix.',
    });
  }

  const result = baseResult({
    raw,
    normalized,
    checkedAt,
    companySiren: options.companySiren,
  });

  try {
    const response = await postToVies({
      countryCode: result.countryCode,
      vatNumber: result.vatNumber,
      fetcher: options.fetcher,
      timeoutMs: options.timeoutMs,
    });
    const payload = (await response.json().catch(() => ({}))) as ViesResponse;

    if (!response.ok) {
      return {
        kind: "vat",
        status: "unavailable",
        valid: null,
        raw: result.raw,
        normalized: result.normalized,
        countryCode: result.countryCode,
        vatNumber: result.vatNumber,
        userError: textValue(payload.userError),
        sirenMatch: result.sirenMatch.status,
        matchedSiren: result.sirenMatch.matchedSiren,
        notes: [
          "The VIES service did not return a usable validation response.",
          result.sirenMatch.note,
        ].filter(Boolean) as string[],
        error: `VIES returned HTTP ${response.status}.`,
        source: result.source,
      };
    }

    const valid = booleanValue(payload.valid) ?? booleanValue(payload.isValid) ?? false;
    const responseCountryCode = textValue(payload.countryCode) ?? result.countryCode;
    const responseVatNumber = textValue(payload.vatNumber) ?? result.vatNumber;

    return {
      kind: "vat",
      status: valid ? "valid" : "invalid",
      valid,
      raw: result.raw,
      normalized: `${responseCountryCode}${responseVatNumber}`,
      countryCode: responseCountryCode,
      vatNumber: responseVatNumber,
      name: textValue(payload.name),
      address: textValue(payload.address),
      requestDate: textValue(payload.requestDate),
      userError: textValue(payload.userError),
      sirenMatch: result.sirenMatch.status,
      matchedSiren: result.sirenMatch.matchedSiren,
      notes: [
        "Live VAT validation response from the European Commission VIES service.",
        result.sirenMatch.note,
      ].filter(Boolean) as string[],
      source: result.source,
    };
  } catch (error) {
    return {
      kind: "vat",
      status: "unavailable",
      valid: null,
      raw: result.raw,
      normalized: result.normalized,
      countryCode: result.countryCode,
      vatNumber: result.vatNumber,
      sirenMatch: result.sirenMatch.status,
      matchedSiren: result.sirenMatch.matchedSiren,
      notes: [
        "The VIES service could not be reached. Retry later or verify the VAT number manually.",
        result.sirenMatch.note,
      ].filter(Boolean) as string[],
      error: error instanceof Error ? error.message : "Unknown VIES validation error.",
      source: result.source,
    };
  }
}
