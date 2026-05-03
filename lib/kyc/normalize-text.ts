const LEGAL_FORMS = [
  "sas",
  "sasu",
  "sarl",
  "sa",
  "sci",
  "eurl",
  "snc",
  "selarl",
  "sca",
  "association",
  "assoc",
  "societe",
  "societe par actions simplifiee",
  "societe a responsabilite limitee",
];

export function normalizeText(value: string | undefined | null) {
  if (!value) {
    return "";
  }

  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " et ")
    .replace(/[''`]/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeCompanyName(value: string | undefined | null) {
  let normalized = normalizeText(value);

  for (const form of LEGAL_FORMS) {
    const normalizedForm = normalizeText(form);
    normalized = normalized.replace(new RegExp(`\\b${normalizedForm}\\b`, "g"), " ");
  }

  return normalized.replace(/\s+/g, " ").trim();
}

export function getCompanyNameCandidates(value: string | undefined | null) {
  if (!value) {
    return [];
  }

  const candidates = new Set<string>();
  const add = (candidate: string | undefined | null) => {
    const normalized = normalizeCompanyName(candidate);

    if (normalized.length >= 3) {
      candidates.add(normalized);
    }
  };

  add(value);
  add(value.replace(/\([^)]*\)|«[^»]*»|"[^"]*"/g, " "));

  for (const match of value.matchAll(/\(([^)]*)\)|«([^»]*)»|"([^"]*)"/g)) {
    add(match[1] ?? match[2] ?? match[3]);
  }

  return Array.from(candidates);
}

export function normalizeAddress(value: string | undefined | null) {
  return normalizeText(value)
    .replace(/\bavenue\b/g, "av")
    .replace(/\bboulevard\b/g, "bd")
    .replace(/\brue\b/g, "r")
    .replace(/\s+/g, " ")
    .trim();
}
