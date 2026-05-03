import type { Address, CompanyProfile } from "@/types/company";
import type { SourceRecord } from "@/types/source";
import { env, userAgent } from "@/lib/utils/env";
import { fetchWithTimeout } from "@/lib/utils/fetch-with-timeout";

type AnnuaireResult = Record<string, unknown>;

function readString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

function readNestedObject(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function normalizeStatus(value: string | undefined): CompanyProfile["status"] {
  if (!value) {
    return "unknown";
  }

  const normalized = value.toUpperCase();

  if (normalized === "A" || normalized.includes("ACTIF") || normalized.includes("ACTIVE")) {
    return "active";
  }

  if (normalized === "F" || normalized.includes("FERME") || normalized.includes("CLOSED")) {
    return "closed";
  }

  return "inactive";
}

function buildAddress(source: Record<string, unknown> | undefined): Address | undefined {
  if (!source) {
    return undefined;
  }

  const raw = readString(source, ["adresse", "adresse_complete", "geo_adresse"]);
  const line1 =
    raw ||
    [
      readString(source, ["numero_voie"]),
      readString(source, ["type_voie"]),
      readString(source, ["libelle_voie"]),
    ]
      .filter(Boolean)
      .join(" ");
  const postalCode = readString(source, ["code_postal", "code_postal_etablissement"]);
  const city = readString(source, ["libelle_commune", "commune", "ville"]);

  if (!raw && !line1 && !postalCode && !city) {
    return undefined;
  }

  return {
    line1: line1 || undefined,
    postalCode,
    city,
    country: "France",
    raw: raw || [line1, postalCode, city, "France"].filter(Boolean).join(", "),
  };
}

export function normalizeAnnuaireCompany(result: AnnuaireResult): CompanyProfile {
  const siege = readNestedObject(result, "siege");
  const legalName =
    readString(result, ["nom_complet", "nom_raison_sociale", "denomination", "nom"]) ||
    readString(siege ?? {}, ["nom_complet", "nom_raison_sociale", "denomination", "nom"]) ||
    "Unknown company";
  const siren = readString(result, ["siren"]) ?? legalName;
  const siret =
    readString(result, ["siret"]) ?? readString(siege ?? {}, ["siret", "siret_siege_social"]);
  const status = normalizeStatus(
    readString(result, ["etat_administratif"]) ?? readString(siege ?? {}, ["etat_administratif"]),
  );
  const address = buildAddress(siege) ?? buildAddress(result);

  return {
    siren,
    siret,
    legalName,
    tradingName: readString(result, ["nom_commercial", "enseigne"]),
    legalForm: readString(result, ["nature_juridique", "forme_juridique"]),
    activityCode:
      readString(result, ["activite_principale", "activite_principale_unite_legale"]) ??
      readString(siege ?? {}, ["activite_principale"]),
    activityLabel: readString(result, ["libelle_activite_principale", "section_activite_principale"]),
    creationDate: readString(result, ["date_creation", "date_creation_unite_legale"]),
    status,
    headOfficeAddress: address,
    sourceRecords: [],
    scenario: "live",
  };
}

export async function fetchCompanyFromAnnuaire(identifier: string): Promise<{
  company?: CompanyProfile;
  source: SourceRecord;
}> {
  const checkedAt = new Date().toISOString();
  const url = `${env.annuaireApiBaseUrl.replace(/\/$/, "")}/search?q=${encodeURIComponent(identifier)}&limite=1`;

  try {
    const response = await fetchWithTimeout(
      url,
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
      throw new Error(`Annuaire returned HTTP ${response.status}`);
    }

    const data = (await response.json()) as { results?: AnnuaireResult[] };
    const first = data.results?.[0];

    if (!first) {
      return {
        source: {
          sourceName: "ANNUAIRE_ENTREPRISES",
          status: "partial",
          mode: "live",
          checkedAt,
          url,
          notes: "No result returned by live lookup.",
        },
      };
    }

    const company = normalizeAnnuaireCompany(first);
    const source: SourceRecord = {
      sourceName: "ANNUAIRE_ENTREPRISES",
      status: "success",
      mode: "live",
      checkedAt,
      url,
    };

    company.sourceRecords = [source];

    return { company, source };
  } catch (error) {
    return {
      source: {
        sourceName: "ANNUAIRE_ENTREPRISES",
        status: "failed",
        mode: "live",
        checkedAt,
        url,
        error: error instanceof Error ? error.message : "Unknown Annuaire error",
      },
    };
  }
}
