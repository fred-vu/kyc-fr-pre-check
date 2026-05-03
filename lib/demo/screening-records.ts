import type { ScreeningMatch } from "@/types/screening";

export function getDemoScreeningMatches(scenario: string | undefined) {
  const sanctionsMatches: ScreeningMatch[] = [];
  const warningMatches: ScreeningMatch[] = [];

  if (scenario === "inconsistent_sensitive") {
    warningMatches.push({
      listName: "AMF_BLACKLIST",
      matchType: "fuzzy",
      matchedValue: "Nova Capital Demo",
      confidence: 0.86,
      severity: "high",
      reviewLabel: "Potential match requiring review",
      sourceUrl:
        "https://www.data.gouv.fr/datasets/listes-noires-des-entites-non-autorisees-a-proposer-des-produits-ou-services-financiers-en-france/",
      rawRecord: {
        note: "Fictional demo warning-list record. Not a real AMF entry.",
      },
    });
  }

  return {
    sanctionsMatches,
    warningMatches,
  };
}
