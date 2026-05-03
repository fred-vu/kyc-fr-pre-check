import type { CompanyProfile } from "@/types/company";
import type { SourceRecord } from "@/types/source";

const demoCheckedAt = "2026-05-02T12:00:00.000Z";

const demoSource = (notes: string): SourceRecord => ({
  sourceName: "DEMO_FIXTURE",
  status: "success",
  mode: "demo",
  checkedAt: demoCheckedAt,
  notes,
});

export const demoCompanies: CompanyProfile[] = [
  {
    siren: "100000009",
    siret: "10000000900017",
    legalName: "Hexa Services Demo SAS",
    tradingName: "Hexa Services",
    legalForm: "SAS",
    activityCode: "6201Z",
    activityLabel: "Computer programming activities",
    creationDate: "2018-04-12",
    status: "active",
    headOfficeAddress: {
      line1: "12 Rue du Canal",
      postalCode: "75010",
      city: "Paris",
      country: "France",
      raw: "12 Rue du Canal, 75010 Paris, France",
    },
    sourceRecords: [demoSource("Fictional active company used for the happy-path demo.")],
    scenario: "normal_active",
  },
  {
    siren: "100000017",
    siret: "10000001700010",
    legalName: "Atelier Nord Demo SARL",
    tradingName: "Atelier Nord",
    legalForm: "SARL",
    activityCode: "7022Z",
    activityLabel: "Business and management consultancy activities",
    creationDate: "2016-09-05",
    status: "closed",
    headOfficeAddress: {
      line1: "8 Avenue des Archives",
      postalCode: "59000",
      city: "Lille",
      country: "France",
      raw: "8 Avenue des Archives, 59000 Lille, France",
    },
    sourceRecords: [demoSource("Fictional closed company used to demonstrate status flags.")],
    scenario: "closed_company",
  },
  {
    siren: "100000025",
    siret: "10000002500013",
    legalName: "Nova Capital Demo SAS",
    tradingName: "Nova Capital",
    legalForm: "SAS",
    activityCode: "6619B",
    activityLabel: "Other activities auxiliary to financial services",
    creationDate: "2026-02-14",
    status: "active",
    headOfficeAddress: {
      line1: "21 Rue Saint-Charles",
      postalCode: "69003",
      city: "Lyon",
      country: "France",
      raw: "21 Rue Saint-Charles, 69003 Lyon, France",
    },
    establishmentAddress: {
      line1: "4 Boulevard Maritime",
      postalCode: "13002",
      city: "Marseille",
      country: "France",
      raw: "4 Boulevard Maritime, 13002 Marseille, France",
    },
    sourceRecords: [demoSource("Fictional company with inconsistent source data for review workflow demo.")],
    scenario: "inconsistent_sensitive",
  },
];

export function getDemoCompanyByIdentifier(identifier: string) {
  const normalized = identifier.replace(/\D/g, "");

  return demoCompanies.find(
    (company) => company.siren === normalized || company.siret === normalized,
  );
}
