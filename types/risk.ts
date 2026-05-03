export type RiskLevel = "low" | "medium" | "high" | "critical" | "unknown";

export type RedFlagCode =
  | "INVALID_IDENTIFIER"
  | "COMPANY_NOT_FOUND"
  | "COMPANY_INACTIVE"
  | "COMPANY_CLOSED"
  | "MISSING_LEGAL_NAME"
  | "MISSING_ADDRESS"
  | "ADDRESS_MISMATCH"
  | "NAME_MISMATCH"
  | "RECENTLY_CREATED_COMPANY"
  | "SENSITIVE_ACTIVITY"
  | "AMF_WARNING_POTENTIAL_MATCH"
  | "SANCTIONS_POTENTIAL_MATCH"
  | "SOURCE_UNAVAILABLE";

export type RedFlagSeverity = "low" | "medium" | "high" | "critical";

export type RedFlag = {
  code: RedFlagCode;
  label: string;
  severity: RedFlagSeverity;
  description: string;
  source: string;
  recommendation: string;
};

export type RiskScore = {
  raw: number;
  display: number;
};
