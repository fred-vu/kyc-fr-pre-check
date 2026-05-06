import type { CompanyProfile } from "@/types/company";
import type { EvidencePayload } from "@/types/report";
import type { RedFlag, ReviewOutcome, RiskScoreBreakdown } from "@/types/risk";
import type { DataMode, SourceCheck } from "@/types/source";

export const DEFAULT_LIMITATIONS = [
  "Preliminary operational pre-check only.",
  "Not legal, AML, sanctions, regulatory, or compliance advice.",
  "Not a final onboarding decision.",
  "Public sources may be unavailable, delayed, incomplete, or inconsistent.",
  "Potential screening matches require manual review.",
];

export function generateEvidencePayload(input: {
  caseId: string;
  inputIdentifier: string;
  generatedAt: string;
  dataMode: DataMode;
  company?: CompanyProfile;
  risk: RiskScoreBreakdown;
  flags: RedFlag[];
  sources: SourceCheck[];
  reviewOutcome: ReviewOutcome;
}): EvidencePayload {
  return {
    ...input,
    limitations: DEFAULT_LIMITATIONS,
  };
}
