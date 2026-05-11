export type SourceName =
  | "DEMO_FIXTURE"
  | "ANNUAIRE_ENTREPRISES"
  | "DG_TRESOR_GELS"
  | "AMF_BLACKLIST"
  | "EU_VIES_VAT"
  | "IBAN_LOCAL_VALIDATION";

export type SourceStatus = "success" | "partial" | "failed" | "not_checked";

export type SourceMode = "demo" | "live" | "snapshot" | "skipped";

export type DataMode = "demo" | "live" | "hybrid" | "cached" | "unavailable";

export type SourceCheckStatus =
  | "success"
  | "no_match"
  | "potential_match"
  | "failed"
  | "timeout"
  | "unavailable"
  | "demo_fixture"
  | "cached"
  | "partial";

export type SourceCheckMode = "live" | "demo" | "cached";

export type SourceRecord = {
  sourceName: SourceName;
  status: SourceStatus;
  mode: SourceMode;
  checkedAt: string;
  url?: string;
  error?: string;
  notes?: string;
  latencyMs?: number;
  freshness?: "fresh" | "stale" | "very_stale" | "unknown";
};

export type SourceCheck = {
  id: string;
  label: string;
  provider: string;
  status: SourceCheckStatus;
  checkedAt: string;
  mode: SourceCheckMode;
  confidence?: "low" | "medium" | "high";
  details?: string;
  url?: string;
};
