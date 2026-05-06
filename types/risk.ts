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

export type RiskFlagCategory =
  | "identity"
  | "address"
  | "activity"
  | "age"
  | "sanctions"
  | "regulatory_warning"
  | "source_quality"
  | "data_freshness";

export type RiskFlag = {
  id: string;
  code: RedFlagCode;
  title: string;
  label: string;
  severity: RedFlagSeverity;
  category: RiskFlagCategory;
  description: string;
  evidence: string;
  source: string;
  scoreContribution: number;
  recommendedAction: string;
  recommendation: string;
  manualReviewRequired: boolean;
};

export type RiskScore = {
  raw: number;
  display: number;
  capped: boolean;
  contributions: Array<{
    flagId: string;
    label: string;
    points: number;
  }>;
};

export type RiskScoreBreakdown = RiskScore & {
  level: RiskLevel;
  thresholdExplanation: string;
  modelDescription: string;
};

export type ReviewOutcome =
  | "PASS_PRE_CHECK"
  | "MANUAL_REVIEW_REQUIRED"
  | "ESCALATE_BEFORE_ONBOARDING"
  | "INSUFFICIENT_DATA";

export type RedFlag = RiskFlag;
