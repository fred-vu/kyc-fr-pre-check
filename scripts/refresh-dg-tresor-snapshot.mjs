import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const PUBLICATION_DATE_URL =
  "https://gels-avoirs.dgtresor.gouv.fr/ApiPublic/api/v1/publication/derniere-publication-date";
const PUBLICATION_JSON_URL =
  "https://gels-avoirs.dgtresor.gouv.fr/ApiPublic/api/v1/publication/derniere-publication-fichier-json";
const USER_AGENT = "kyc-fr-precheck-snapshot/1.0";
const INDEX_VERSION = 1;
const DATA_DIR = path.join(process.cwd(), "data");
const INDEX_PATH = path.join(DATA_DIR, "dg-tresor-index.json");
const METADATA_PATH = path.join(DATA_DIR, "dg-tresor-metadata.json");

const legalForms = [
  "sas",
  "sasu",
  "sarl",
  "sa",
  "sci",
  "eurl",
  "snc",
  "selarl",
  "sca",
  "association",
  "assoc",
  "societe",
  "societe par actions simplifiee",
  "societe a responsabilite limitee",
];

function normalizeText(value) {
  if (!value) {
    return "";
  }

  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " et ")
    .replace(/[''`]/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeCompanyName(value) {
  let normalized = normalizeText(value);

  for (const form of legalForms) {
    const normalizedForm = normalizeText(form);
    normalized = normalized.replace(new RegExp(`\\b${normalizedForm}\\b`, "g"), " ");
  }

  return normalized.replace(/\s+/g, " ").trim();
}

function unique(values) {
  return Array.from(new Set(values.map((value) => String(value).trim()).filter(Boolean)));
}

function extractAliasValues(value) {
  if (!value) {
    return [];
  }

  if (typeof value === "string") {
    return value.trim() ? [value.trim()] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap(extractAliasValues);
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .filter(([key]) => key.toLowerCase() === "alias")
      .flatMap(([, item]) => extractAliasValues(item));
  }

  return [];
}

function extractTextValues(value) {
  if (!value) {
    return [];
  }

  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(extractTextValues);
  }

  if (typeof value === "object") {
    return Object.values(value).flatMap(extractTextValues);
  }

  return [];
}

function extractIdentifiersFromText(value) {
  const identifiers = [];
  const digitRuns = String(value).match(/\d{9,14}/g) ?? [];

  for (const run of digitRuns) {
    identifiers.push(run);

    if (run.length >= 9) {
      identifiers.push(run.slice(0, 9));
    }
  }

  return identifiers;
}

function extractIdentifiers(detail) {
  return unique(
    (detail.RegistreDetail ?? [])
      .filter((field) => field.TypeChamp === "IDENTIFICATION")
      .flatMap((field) => extractTextValues(field.Valeur))
      .flatMap(extractIdentifiersFromText),
  );
}

function parsePublication(payload) {
  const details = payload?.Publications?.PublicationDetail ?? [];

  return details
    .map((detail) => {
      const aliases = unique(
        (detail.RegistreDetail ?? [])
          .filter((field) => field.TypeChamp === "ALIAS")
          .flatMap((field) => extractAliasValues(field.Valeur)),
      );
      const name = String(detail.Nom ?? "").trim();

      return {
        idRegistre: Number(detail.IdRegistre ?? 0),
        nature: String(detail.Nature ?? "unknown"),
        name,
        normalizedName: normalizeCompanyName(name),
        aliases,
        normalizedAliases: aliases.map(normalizeCompanyName),
        identifiers: extractIdentifiers(detail),
        sourceName: "DG_TRESOR_GELS",
      };
    })
    .filter((record) => record.name.length > 1);
}

function normalizePublicationDate(value) {
  const text = String(value ?? "").trim();

  if (!text) {
    return "";
  }

  try {
    const parsed = JSON.parse(text);

    if (typeof parsed === "string") {
      return parsed.trim();
    }
  } catch {
    // The endpoint may also return plain text, which is already suitable.
  }

  return text.replace(/^"+|"+$/g, "");
}

function publicationDateKey(value) {
  const normalized = normalizePublicationDate(value);
  const frenchDate = normalized.match(
    /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}:\d{2}:\d{2})$/,
  );

  if (frenchDate) {
    const [, day, month, year, time] = frenchDate;
    return `${year}-${month}-${day}T${time}`;
  }

  const isoDate = normalized.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}:\d{2}:\d{2})/);

  if (isoDate) {
    const [, year, month, day, time] = isoDate;
    return `${year}-${month}-${day}T${time}`;
  }

  return normalized;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 120000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json,text/plain;q=0.9",
        "User-Agent": USER_AGENT,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`${url} returned HTTP ${response.status}`);
    }

    return response;
  } finally {
    clearTimeout(timeout);
  }
}

async function readCurrentMetadata() {
  if (!existsSync(METADATA_PATH)) {
    return undefined;
  }

  try {
    return JSON.parse(await readFile(METADATA_PATH, "utf8"));
  } catch {
    return undefined;
  }
}

async function main() {
  const startedAt = Date.now();
  await mkdir(DATA_DIR, { recursive: true });

  const latestDateResponse = await fetchWithTimeout(PUBLICATION_DATE_URL, {
    headers: { Accept: "text/plain" },
  });
  const latestPublicationDate = normalizePublicationDate(await latestDateResponse.text());
  const currentMetadata = await readCurrentMetadata();
  const latestPublicationKey = publicationDateKey(latestPublicationDate);
  const currentPublicationKey = publicationDateKey(currentMetadata?.publicationDate);

  if (
    currentPublicationKey === latestPublicationKey &&
    currentMetadata?.indexVersion === INDEX_VERSION &&
    existsSync(INDEX_PATH)
  ) {
    console.log(`DG Tresor snapshot already current: ${latestPublicationDate}`);
    return;
  }

  const publicationResponse = await fetchWithTimeout(PUBLICATION_JSON_URL, {
    headers: { Accept: "application/json" },
  });
  const publication = await publicationResponse.json();
  const index = parsePublication(publication);
  const metadata = {
    publicationDate: publication?.Publications?.DatePublication ?? latestPublicationDate,
    snapshotGeneratedAt: new Date().toISOString(),
    recordCount: index.length,
    sourceUrl: PUBLICATION_JSON_URL,
    indexVersion: INDEX_VERSION,
  };

  await writeFile(INDEX_PATH, `${JSON.stringify(index)}\n`);
  await writeFile(METADATA_PATH, `${JSON.stringify(metadata, null, 2)}\n`);

  console.log(
    `DG Tresor snapshot refreshed: ${index.length} records, publication ${metadata.publicationDate}, ${Date.now() - startedAt}ms`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
