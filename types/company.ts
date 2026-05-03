import type { SourceRecord } from "./source";

export type CompanyIdentifierType = "siren" | "siret";

export type CompanyIdentifier = {
  raw: string;
  normalized: string;
  type: CompanyIdentifierType;
  isValid: boolean;
};

export type Address = {
  line1?: string;
  line2?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  raw?: string;
};

export type CompanyStatus = "active" | "inactive" | "closed" | "unknown";

export type CompanyProfile = {
  siren: string;
  siret?: string;
  legalName: string;
  tradingName?: string;
  legalForm?: string;
  activityCode?: string;
  activityLabel?: string;
  creationDate?: string;
  status: CompanyStatus;
  headOfficeAddress?: Address;
  establishmentAddress?: Address;
  sourceRecords: SourceRecord[];
  scenario?: "normal_active" | "closed_company" | "inconsistent_sensitive" | "live";
};
