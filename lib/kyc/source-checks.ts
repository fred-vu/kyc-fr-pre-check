import type { ScreeningMatch } from "@/types/screening";
import type { DataMode, SourceCheck, SourceCheckMode, SourceCheckStatus, SourceRecord } from "@/types/source";

const sourceLabels: Record<SourceRecord["sourceName"], { label: string; provider: string }> = {
  DEMO_FIXTURE: {
    label: "Demo company fixture",
    provider: "Local deterministic fixture",
  },
  ANNUAIRE_ENTREPRISES: {
    label: "Annuaire des Entreprises",
    provider: "data.gouv.fr",
  },
  DG_TRESOR_GELS: {
    label: "DG Tresor GELS",
    provider: "DG Tresor",
  },
  AMF_BLACKLIST: {
    label: "AMF warning list",
    provider: "AMF / data.gouv.fr",
  },
  EU_VIES_VAT: {
    label: "EU VIES VAT validation",
    provider: "European Commission VIES",
  },
  IBAN_LOCAL_VALIDATION: {
    label: "IBAN local validation",
    provider: "ibantools",
  },
};

function normalizeMode(mode: SourceRecord["mode"]): SourceCheckMode {
  if (mode === "demo") {
    return "demo";
  }

  if (mode === "snapshot" || mode === "skipped") {
    return "cached";
  }

  return "live";
}

function confidenceForSource(source: SourceRecord, matches: ScreeningMatch[]) {
  if (source.status === "failed" || source.status === "not_checked") {
    return "low" as const;
  }

  if (matches.some((match) => match.confidence >= 0.9)) {
    return "high" as const;
  }

  if (matches.length > 0 || source.mode === "demo" || source.status === "partial") {
    return "medium" as const;
  }

  return "high" as const;
}

function statusForSource(source: SourceRecord, matches: ScreeningMatch[]): SourceCheckStatus {
  if (source.status === "failed") {
    const error = `${source.error ?? source.notes ?? ""}`.toLowerCase();
    return error.includes("timeout") ? "timeout" : "failed";
  }

  if (source.status === "not_checked") {
    return "unavailable";
  }

  if (source.status === "partial") {
    return "partial";
  }

  if (matches.length > 0) {
    return "potential_match";
  }

  if (source.mode === "demo") {
    return "demo_fixture";
  }

  if (source.sourceName === "DG_TRESOR_GELS" || source.sourceName === "AMF_BLACKLIST") {
    return "no_match";
  }

  if (source.mode === "snapshot") {
    return "cached";
  }

  return "success";
}

export function normalizeSourceChecks(input: {
  sources: SourceRecord[];
  sanctionsMatches: ScreeningMatch[];
  warningMatches: ScreeningMatch[];
}): SourceCheck[] {
  return input.sources.map((source, index) => {
    const matches =
      source.sourceName === "DG_TRESOR_GELS"
        ? input.sanctionsMatches
        : source.sourceName === "AMF_BLACKLIST"
          ? input.warningMatches
          : [];
    const label = sourceLabels[source.sourceName];

    return {
      id: `${source.sourceName.toLowerCase()}_${index}`,
      label: label.label,
      provider: label.provider,
      status: statusForSource(source, matches),
      checkedAt: source.checkedAt,
      mode: normalizeMode(source.mode),
      confidence: confidenceForSource(source, matches),
      details: source.error || source.notes || source.url,
      url: source.url,
    };
  });
}

export function deriveDataMode(input: { isDemo: boolean; sourceChecks: SourceCheck[] }): DataMode {
  if (input.isDemo) {
    return "demo";
  }

  if (input.sourceChecks.length === 0) {
    return "unavailable";
  }

  const modes = new Set(input.sourceChecks.map((source) => source.mode));
  const hasUnavailable = input.sourceChecks.every((source) =>
    ["failed", "timeout", "unavailable"].includes(source.status),
  );

  if (hasUnavailable) {
    return "unavailable";
  }

  if (modes.size > 1) {
    return "hybrid";
  }

  if (modes.has("cached")) {
    return "cached";
  }

  return modes.has("live") ? "live" : "demo";
}
