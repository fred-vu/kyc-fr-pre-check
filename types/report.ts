import type { CompanyIdentifier, CompanyProfile } from "./company";
import type { RedFlag, RiskLevel, RiskScore } from "./risk";
import type { DgTresorScreeningState, ScreeningMatch } from "./screening";
import type { SourceRecord } from "./source";

export type KycPrecheckResult = {
  identifier: CompanyIdentifier;
  company?: CompanyProfile;
  riskLevel: RiskLevel;
  riskScore: RiskScore;
  redFlags: RedFlag[];
  sanctionsMatches: ScreeningMatch[];
  warningMatches: ScreeningMatch[];
  dgTresorState: DgTresorScreeningState;
  sourcesChecked: SourceRecord[];
  generatedAt: string;
  reportMarkdown: string;
  isDemo: boolean;
};
