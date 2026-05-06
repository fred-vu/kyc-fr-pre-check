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
  {
    siren: "200000008",
    siret: "20000000800018",
    legalName: "Source Timeout Demo SAS",
    tradingName: "Source Timeout",
    legalForm: "SAS",
    activityCode: "6202A",
    activityLabel: "Computer consultancy activities",
    creationDate: "2021-11-18",
    status: "active",
    headOfficeAddress: {
      line1: "15 Rue de la Source",
      postalCode: "44000",
      city: "Nantes",
      country: "France",
      raw: "15 Rue de la Source, 44000 Nantes, France",
    },
    sourceRecords: [demoSource("Fictional active company used to demonstrate degraded source availability.")],
    scenario: "source_timeout",
  },
  {
    siren: "200000016",
    siret: "20000001600017",
    legalName: "Stale Snapshot Demo SARL",
    tradingName: "Stale Snapshot",
    legalForm: "SARL",
    activityCode: "7022Z",
    activityLabel: "Business and management consultancy activities",
    creationDate: "2019-06-03",
    status: "active",
    headOfficeAddress: {
      line1: "2 Place des Archives",
      postalCode: "33000",
      city: "Bordeaux",
      country: "France",
      raw: "2 Place des Archives, 33000 Bordeaux, France",
    },
    sourceRecords: [demoSource("Fictional company used to demonstrate stale cached source metadata.")],
    scenario: "stale_cached",
  },
  {
    siren: "200000024",
    siret: "20000002400016",
    legalName: "Conflicting Identity Demo SAS",
    tradingName: "CID Demo",
    legalForm: "SAS",
    activityCode: "6201Z",
    activityLabel: "Computer programming activities",
    creationDate: "2020-01-22",
    status: "active",
    headOfficeAddress: {
      line1: "42 Rue de la Paix",
      postalCode: "75002",
      city: "Paris",
      country: "France",
      raw: "42 Rue de la Paix, 75002 Paris, France",
    },
    establishmentAddress: {
      line1: "9 Avenue du Port",
      postalCode: "13002",
      city: "Marseille",
      country: "France",
      raw: "9 Avenue du Port, 13002 Marseille, France",
    },
    sourceRecords: [demoSource("Fictional company used to demonstrate conflicting identity evidence.")],
    scenario: "conflicting_identity",
  },
];

export function getDemoCompanyByIdentifier(identifier: string) {
  const normalized = identifier.replace(/\D/g, "");

  return demoCompanies.find(
    (company) => company.siren === normalized || company.siret === normalized,
  );
}
