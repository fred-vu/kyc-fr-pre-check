export type ScreeningListName = "DG_TRESOR_GELS" | "AMF_BLACKLIST";

export type ScreeningMatch = {
  listName: ScreeningListName;
  matchType: "exact" | "near_exact" | "fuzzy" | "domain" | "unknown";
  matchedValue: string;
  confidence: number;
  severity: "medium" | "high" | "critical";
  reviewLabel: "Potential match requiring review";
  sourceUrl?: string;
  rawRecord?: unknown;
};

export type ScreeningResult = {
  sourceName: ScreeningListName;
  checked: boolean;
  matches: ScreeningMatch[];
  error?: string;
};

export type DgTresorSnapshotStatus =
  | "success"
  | "stale_success"
  | "not_available"
  | "failed";

export type DgTresorFreshness = "fresh" | "stale" | "very_stale" | "unknown";

export type DgTresorScreeningState = {
  status: DgTresorSnapshotStatus;
  publicationDate?: string;
  snapshotGeneratedAt?: string;
  recordCount?: number;
  indexVersion?: number;
  freshness: DgTresorFreshness;
  message: string;
};
