const bool = (value: string | undefined, fallback: boolean) => {
  if (value === undefined || value === "") {
    return fallback;
  }

  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
};

const numberFromEnv = (value: string | undefined, fallback: number) => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  enableDemoMode: bool(process.env.ENABLE_DEMO_MODE, true),
  enableExternalApiCalls: bool(process.env.ENABLE_EXTERNAL_API_CALLS, false),
  annuaireApiBaseUrl:
    process.env.ANNUAIRE_API_BASE_URL ?? "https://recherche-entreprises.api.gouv.fr",
  amfBlacklistDatasetUrl: process.env.AMF_BLACKLIST_DATASET_URL ?? "",
  externalFetchTimeoutMs: numberFromEnv(process.env.EXTERNAL_FETCH_TIMEOUT_MS, 5000),
  precheckTotalTimeoutMs: numberFromEnv(process.env.PRECHECK_TOTAL_TIMEOUT_MS, 10000),
};

export const userAgent = `kyc-fr-precheck/1.0 (${env.appUrl})`;
