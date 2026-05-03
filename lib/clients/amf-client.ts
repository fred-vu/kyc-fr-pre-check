import Papa from "papaparse";
import type { ScreeningMatch } from "@/types/screening";
import type { SourceRecord } from "@/types/source";
import { env, userAgent } from "@/lib/utils/env";
import { fetchWithTimeout } from "@/lib/utils/fetch-with-timeout";
import { getCached, setCached } from "@/lib/utils/cache";
import { extractDomain, isExactCompanyNameMatch } from "@/lib/kyc/matching";
import { normalizeCompanyName, normalizeText } from "@/lib/kyc/normalize-text";

type AmfRecord = Record<string, string>;

const CACHE_KEY = "amf-warning-records";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const DATASET_API_URL =
  "https://www.data.gouv.fr/api/1/datasets/listes-noires-des-entites-non-autorisees-a-proposer-des-produits-ou-services-financiers-en-france/";
const DATASET_PAGE_URL =
  "https://www.data.gouv.fr/datasets/listes-noires-des-entites-non-autorisees-a-proposer-des-produits-ou-services-financiers-en-france/";

function readRecordValue(record: AmfRecord, includes: string[]) {
  for (const [key, value] of Object.entries(record)) {
    const normalizedKey = normalizeText(key);

    if (includes.some((item) => normalizedKey.includes(item)) && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function stripBom(value: string) {
  return value.replace(/^\uFEFF/, "");
}

function isLikelyCsvUrl(value: string) {
  try {
    const url = new URL(value);
    return url.pathname.toLowerCase().endsWith(".csv");
  } catch {
    return false;
  }
}

function isDomainOrEmailLike(value: string) {
  const normalized = value.trim().toLowerCase();

  return Boolean(
    normalized.includes("@") ||
      /^https?:\/\//.test(normalized) ||
      (/^[a-z0-9.-]+\.[a-z]{2,}/.test(normalized) && !normalized.includes(" ")),
  );
}

function normalizeDatasetApiUrl(value: string) {
  try {
    const url = new URL(value);
    const datasetMatch = url.pathname.match(/\/datasets\/([^/]+)\/?/);

    if (url.hostname.includes("data.gouv.fr") && datasetMatch?.[1]) {
      return `https://www.data.gouv.fr/api/1/datasets/${datasetMatch[1]}/`;
    }

    if (url.hostname.includes("data.gouv.fr") && url.pathname.includes("/api/1/datasets/")) {
      return value;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

async function fetchCsvUrlFromDatasetApi(datasetApiUrl: string) {
  const response = await fetchWithTimeout(
    datasetApiUrl,
    {
      headers: {
        Accept: "application/json",
        "User-Agent": userAgent,
      },
      next: { revalidate: 60 * 60 * 24 },
    },
    env.externalFetchTimeoutMs,
  );

  if (!response.ok) {
    throw new Error(`data.gouv.fr returned HTTP ${response.status}`);
  }

  const data = (await response.json()) as {
    resources?: Array<{ url?: string; format?: string; title?: string }>;
  };
  const csv = data.resources?.find((resource) => {
    const format = normalizeText(resource.format);
    const title = normalizeText(resource.title);
    const url = normalizeText(resource.url);
    return format.includes("csv") || title.includes("csv") || url.endsWith("csv");
  });

  if (!csv?.url) {
    throw new Error("No CSV resource found for AMF blacklist dataset");
  }

  return csv.url;
}

async function resolveCsvUrl() {
  const configuredUrl = env.amfBlacklistDatasetUrl.trim();

  if (configuredUrl && isLikelyCsvUrl(configuredUrl)) {
    return configuredUrl;
  }

  const datasetApiUrl = configuredUrl
    ? normalizeDatasetApiUrl(configuredUrl) ?? DATASET_API_URL
    : DATASET_API_URL;

  return fetchCsvUrlFromDatasetApi(datasetApiUrl);
}

async function downloadAmfRecords() {
  const cached = getCached<AmfRecord[]>(CACHE_KEY);

  if (cached) {
    return cached;
  }

  const csvUrl = await resolveCsvUrl();
  const response = await fetchWithTimeout(
    csvUrl,
    {
      headers: {
        Accept: "text/csv,*/*",
        "User-Agent": userAgent,
      },
      next: { revalidate: 60 * 60 * 24 },
    },
    env.externalFetchTimeoutMs,
  );

  if (!response.ok) {
    throw new Error(`AMF CSV returned HTTP ${response.status}`);
  }

  const text = stripBom(await response.text());
  const parsed = Papa.parse<AmfRecord>(text, {
    header: true,
    skipEmptyLines: true,
    delimiter: ";",
    transformHeader: (header) => stripBom(header).trim(),
  });

  if (parsed.errors.length) {
    throw new Error(`AMF CSV parse error: ${parsed.errors[0].message}`);
  }

  setCached(CACHE_KEY, parsed.data, CACHE_TTL_MS);
  return parsed.data;
}

export async function screenAmfWarnings(input: {
  companyName: string;
  tradingName?: string;
  website?: string;
}): Promise<{
  matches: ScreeningMatch[];
  source: SourceRecord;
}> {
  const checkedAt = new Date().toISOString();

  try {
    const records = await downloadAmfRecords();
    const requestedDomain = extractDomain(input.website);
    const requestedNames = [input.companyName, input.tradingName].filter(Boolean) as string[];
    const matches: ScreeningMatch[] = [];

    for (const record of records) {
      const recordName = readRecordValue(record, ["nom", "denomination", "raison", "societe"]);
      const recordSite = readRecordValue(record, ["site", "url", "domaine"]);
      const recordNameIsDomain = isDomainOrEmailLike(recordName);
      const recordDomain = extractDomain(recordSite || (recordNameIsDomain ? recordName : ""));
      const normalizedRecordName = normalizeCompanyName(recordName);
      const normalizedRequestedNames = requestedNames.map(normalizeCompanyName);

      const exactName =
        !recordNameIsDomain && requestedNames.some((name) => isExactCompanyNameMatch(name, recordName));
      const domainMatch = Boolean(requestedDomain && recordDomain && requestedDomain === recordDomain);
      const fuzzyName =
        !recordNameIsDomain &&
        normalizedRecordName.length > 4 &&
        normalizedRequestedNames.some(
          (name) =>
            name.length > 4 &&
            (normalizedRecordName.includes(name) || name.includes(normalizedRecordName)),
        );

      if (exactName || domainMatch || fuzzyName) {
        matches.push({
          listName: "AMF_BLACKLIST",
          matchType: domainMatch ? "domain" : exactName ? "exact" : "fuzzy",
          matchedValue: recordName || recordSite || "AMF warning record",
          confidence: domainMatch || exactName ? 1 : 0.82,
          severity: "high",
          reviewLabel: "Potential match requiring review",
          sourceUrl:
            DATASET_PAGE_URL,
          rawRecord: record,
        });
      }

      if (matches.length >= 5) {
        break;
      }
    }

    return {
      matches,
      source: {
        sourceName: "AMF_BLACKLIST",
        status: "success",
        mode: "live",
        checkedAt,
        url: DATASET_PAGE_URL,
      },
    };
  } catch (error) {
    return {
      matches: [],
      source: {
        sourceName: "AMF_BLACKLIST",
        status: "failed",
        mode: "live",
        checkedAt,
        url: DATASET_PAGE_URL,
        error: error instanceof Error ? error.message : "Unknown AMF error",
      },
    };
  }
}
