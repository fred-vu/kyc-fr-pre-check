import indexData from "@/data/dg-tresor-index.json";
import metadata from "@/data/dg-tresor-metadata.json";
import type { DgTresorFreshness, DgTresorScreeningState } from "@/types/screening";

export type DgTresorIndexRecord = {
  idRegistre: number;
  nature: "Personne physique" | "Personne morale" | "Navire" | string;
  name: string;
  normalizedName: string;
  aliases: string[];
  normalizedAliases: string[];
  identifiers: string[];
  sourceName: "DG_TRESOR_GELS";
};

export type DgTresorSnapshotMetadata = {
  publicationDate: string | null;
  snapshotGeneratedAt: string | null;
  recordCount: number;
  sourceUrl: string;
  indexVersion: number;
};

let cachedIndex: DgTresorIndexRecord[] | null = null;

export function getDgTresorIndex(): DgTresorIndexRecord[] {
  if (!cachedIndex) {
    cachedIndex = indexData as DgTresorIndexRecord[];
  }

  return cachedIndex;
}

export function getDgTresorMetadata(): DgTresorSnapshotMetadata {
  return metadata as DgTresorSnapshotMetadata;
}

export function isDgTresorSnapshotAvailable() {
  return Array.isArray(indexData) && indexData.length > 0;
}

export function getDgTresorFreshness(now = new Date()): DgTresorFreshness {
  const snapshotGeneratedAt = getDgTresorMetadata().snapshotGeneratedAt;

  if (!snapshotGeneratedAt) {
    return "unknown";
  }

  const generatedAt = new Date(snapshotGeneratedAt);

  if (Number.isNaN(generatedAt.getTime())) {
    return "unknown";
  }

  const ageMs = now.getTime() - generatedAt.getTime();
  const ageDays = ageMs / (24 * 60 * 60 * 1000);

  if (ageDays <= 7) {
    return "fresh";
  }

  if (ageDays <= 14) {
    return "stale";
  }

  return "very_stale";
}

export function buildDgTresorState(input?: {
  status?: DgTresorScreeningState["status"];
  message?: string;
  freshness?: DgTresorFreshness;
}): DgTresorScreeningState {
  const metadata = getDgTresorMetadata();
  const freshness = input?.freshness ?? getDgTresorFreshness();
  const hasSnapshot = isDgTresorSnapshotAvailable();
  const status =
    input?.status ?? (!hasSnapshot ? "not_available" : freshness === "fresh" ? "success" : "stale_success");

  return {
    status,
    publicationDate: metadata.publicationDate ?? undefined,
    snapshotGeneratedAt: metadata.snapshotGeneratedAt ?? undefined,
    recordCount: metadata.recordCount,
    indexVersion: metadata.indexVersion,
    freshness,
    message:
      input?.message ??
      (status === "not_available"
        ? "DG Tresor data snapshot is not available. Manual screening recommended."
        : `DG Tresor screening completed using local snapshot generated at ${metadata.snapshotGeneratedAt ?? "unknown"}.`),
  };
}
