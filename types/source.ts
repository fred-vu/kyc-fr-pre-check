export type SourceName =
  | "DEMO_FIXTURE"
  | "ANNUAIRE_ENTREPRISES"
  | "DG_TRESOR_GELS"
  | "AMF_BLACKLIST";

export type SourceStatus = "success" | "partial" | "failed" | "not_checked";

export type SourceMode = "demo" | "live" | "snapshot" | "skipped";

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
