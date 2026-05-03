import type { ScreeningMatch } from "@/types/screening";
import type { SourceRecord } from "@/types/source";
import type { Locale } from "@/lib/i18n/config";
import { isExactCompanyNameMatch, isNearExactCompanyNameMatch } from "@/lib/kyc/matching";
import { normalizeCompanyName } from "@/lib/kyc/normalize-text";
import { getDictionary } from "@/lib/i18n/dictionary";
import {
  buildDgTresorState,
  getDgTresorIndex,
  getDgTresorMetadata,
  isDgTresorSnapshotAvailable,
  type DgTresorIndexRecord,
} from "@/lib/sanctions/dg-tresor-snapshot";
import type { DgTresorScreeningState } from "@/types/screening";

const PUBLICATION_PATH = "/ApiPublic/api/v1/publication/derniere-publication-fichier-json";
const SOURCE_URL = `https://gels-avoirs.dgtresor.gouv.fr${PUBLICATION_PATH}`;

type DgTresorPublicationDetail = {
  IdRegistre?: number;
  Nature?: string;
  Nom?: string;
  RegistreDetail?: Array<{
    TypeChamp?: string;
    Valeur?: unknown;
  }>;
};

type DgTresorPublication = {
  Publications?: {
    DatePublication?: string;
    PublicationDetail?: DgTresorPublicationDetail[];
  };
};

function extractAliasValues(value: unknown): string[] {
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
    return Object.entries(value as Record<string, unknown>)
      .filter(([key]) => key.toLowerCase() === "alias")
      .flatMap(([, item]) => extractAliasValues(item));
  }

  return [];
}

function unique(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function extractTextValues(value: unknown): string[] {
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
    return Object.values(value as Record<string, unknown>).flatMap(extractTextValues);
  }

  return [];
}

function extractIdentifiersFromText(value: string) {
  const identifiers: string[] = [];
  const digitRuns = value.match(/\d{9,14}/g) ?? [];

  for (const run of digitRuns) {
    identifiers.push(run);

    if (run.length >= 9) {
      identifiers.push(run.slice(0, 9));
    }
  }

  return identifiers;
}

function extractIdentifiers(detail: DgTresorPublicationDetail) {
  return unique(
    detail.RegistreDetail?.filter((field) => field.TypeChamp === "IDENTIFICATION")
      .flatMap((field) => extractTextValues(field.Valeur))
      .flatMap(extractIdentifiersFromText) ?? [],
  );
}

export function parseSanctionsPublication(payload: unknown): DgTresorIndexRecord[] {
  const publication = payload as DgTresorPublication;
  const details = publication.Publications?.PublicationDetail ?? [];

  return details
    .map((detail) => {
      const aliases = unique(
        detail.RegistreDetail?.filter((field) => field.TypeChamp === "ALIAS").flatMap((field) =>
          extractAliasValues(field.Valeur),
        ) ?? [],
      );

      return {
        idRegistre: detail.IdRegistre ?? 0,
        name: detail.Nom?.trim() ?? "",
        normalizedName: normalizeCompanyName(detail.Nom),
        nature: detail.Nature ?? "unknown",
        aliases,
        normalizedAliases: aliases.map(normalizeCompanyName),
        identifiers: extractIdentifiers(detail),
        sourceName: "DG_TRESOR_GELS" as const,
      };
    })
    .filter((record) => record.name.length > 1);
}

function canMatchCompanyName(record: DgTresorIndexRecord) {
  return record.nature !== "Personne physique";
}

export async function screenSanctions(input: {
  companyName: string;
  identifiers?: string[];
  locale?: Locale;
}): Promise<{
  matches: ScreeningMatch[];
  source: SourceRecord;
  state: DgTresorScreeningState;
}> {
  const checkedAt = new Date().toISOString();
  const metadata = getDgTresorMetadata();
  const dictionary = getDictionary(input.locale);

  try {
    if (!isDgTresorSnapshotAvailable()) {
      const state = buildDgTresorState({
        status: "not_available",
        freshness: "unknown",
        message: dictionary.dgTresorState.notAvailable,
      });

      return {
        matches: [],
        state,
        source: {
          sourceName: "DG_TRESOR_GELS",
          status: "failed",
          mode: "snapshot",
          checkedAt,
          url: metadata.sourceUrl || SOURCE_URL,
          error: state.message,
          freshness: "unknown",
        },
      };
    }

    const records = getDgTresorIndex();
    const requestedIdentifiers = new Set((input.identifiers ?? []).map((value) => value.replace(/\D/g, "")));
    const matches = records
      .filter(
        (record) =>
          record.identifiers.some((identifier) => requestedIdentifiers.has(identifier)) ||
          (canMatchCompanyName(record) &&
            (isExactCompanyNameMatch(input.companyName, record.name) ||
              isNearExactCompanyNameMatch(input.companyName, record.name) ||
              record.aliases.some(
                (alias) =>
                  isExactCompanyNameMatch(input.companyName, alias) ||
                  isNearExactCompanyNameMatch(input.companyName, alias),
              ))),
      )
      .slice(0, 5)
      .map<ScreeningMatch>((record) => {
        const identifierMatch = record.identifiers.find((identifier) => requestedIdentifiers.has(identifier));
        const exactName = isExactCompanyNameMatch(input.companyName, record.name);
        const exactAlias = record.aliases.find((alias) =>
          isExactCompanyNameMatch(input.companyName, alias),
        );

        return {
          listName: "DG_TRESOR_GELS",
          matchType: identifierMatch || exactName || exactAlias ? "exact" : "near_exact",
          matchedValue: identifierMatch ?? exactAlias ?? record.name,
          confidence: identifierMatch || exactName || exactAlias ? 1 : 0.95,
          severity: "critical",
          reviewLabel: "Potential match requiring review",
          sourceUrl: metadata.sourceUrl || SOURCE_URL,
          rawRecord: record,
        };
      });
    const state = buildDgTresorState({
      message: `${dictionary.dgTresorState.snapshotCompletedPrefix} ${metadata.snapshotGeneratedAt ?? dictionary.dgTresorState.unknownDate}.`,
    });

    return {
      matches,
      state,
      source: {
        sourceName: "DG_TRESOR_GELS",
        status: "success",
        mode: "snapshot",
        checkedAt,
        url: metadata.sourceUrl || SOURCE_URL,
        notes: dictionary.sourceNotes.dgRecordsLoaded.replace("{count}", String(records.length)),
        freshness: state.freshness,
      },
    };
  } catch (error) {
    const state = buildDgTresorState({
      status: "failed",
      message:
        error instanceof Error
          ? `${dictionary.dgTresorState.failedPrefix} ${error.message}`
          : dictionary.dgTresorState.failedPrefix,
    });

    return {
      matches: [],
      state,
      source: {
        sourceName: "DG_TRESOR_GELS",
        status: "failed",
        mode: "snapshot",
        checkedAt,
        url: metadata.sourceUrl || SOURCE_URL,
        error: error instanceof Error ? error.message : "Unknown DG Tresor error",
        freshness: state.freshness,
      },
    };
  }
}
