import type { CompanyIdentifier, CompanyProfile } from "./company";
import type { RedFlag, ReviewOutcome, RiskLevel, RiskScore, RiskScoreBreakdown } from "./risk";
import type { DgTresorScreeningState, ScreeningMatch } from "./screening";
import type { DataMode, SourceCheck, SourceRecord } from "./source";

export type EvidencePayload = {
  caseId: string;
  inputIdentifier: string;
  generatedAt: string;
  dataMode: DataMode;
  company?: CompanyProfile;
  risk: RiskScoreBreakdown;
  flags: RedFlag[];
  sources: SourceCheck[];
  reviewOutcome: ReviewOutcome;
  limitations: string[];
};

export type KycPrecheckResult = {
  caseId: string;
  identifier: CompanyIdentifier;
  company?: CompanyProfile;
  dataMode: DataMode;
  riskLevel: RiskLevel;
  riskScore: RiskScore;
  risk: RiskScoreBreakdown;
  redFlags: RedFlag[];
  sanctionsMatches: ScreeningMatch[];
  warningMatches: ScreeningMatch[];
  dgTresorState: DgTresorScreeningState;
  sourcesChecked: SourceRecord[];
  sourceChecks: SourceCheck[];
  reviewOutcome: ReviewOutcome;
  evidencePayload: EvidencePayload;
  escalationMemo?: string;
  generatedAt: string;
  reportMarkdown: string;
  isDemo: boolean;
};
