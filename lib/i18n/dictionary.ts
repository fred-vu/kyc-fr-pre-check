import type { RedFlagCode, RiskLevel } from "@/types/risk";
import type { DgTresorFreshness } from "@/types/screening";
import type { SourceMode, SourceStatus } from "@/types/source";
import { defaultLocale, type Locale, normalizeLocale } from "./config";

type RedFlagCopy = {
  label: string;
  description: string;
  source: string;
  recommendation: string;
};

type Dictionary = {
  appName: string;
  metadata: {
    title: string;
    description: string;
  };
  nav: {
    demo: string;
    sources: string;
    languageLabel: string;
    english: string;
    french: string;
  };
  home: {
    eyebrow: string;
    title: string;
    description: string;
    cards: Array<{
      title: string;
      text: string;
    }>;
    runTitle: string;
    runDescription: string;
    demoCta: string;
  };
  searchForm: {
    identifierLabel: string;
    placeholder: string;
    submit: string;
  };
  disclaimer: {
    paragraphs: string[];
  };
  demo: {
    eyebrow: string;
    title: string;
    backToSearch: string;
    status: string;
    flags: string;
    openPrecheck: string;
  };
  check: {
    newCheck: string;
    demoMode: string;
    invalidTitle: string;
    invalidDescription: string;
    dgTitle: string;
    dgDescription: string;
    amfTitle: string;
    amfDescription: string;
  };
  companyIdentity: {
    eyebrow: string;
    unavailableTitle: string;
    notAvailable: string;
    submittedIdentifier: string;
    identifierType: string;
    siren: string;
    siret: string;
    legalForm: string;
    status: string;
    activityCode: string;
    activity: string;
    creationDate: string;
    registeredAddress: string;
    establishmentAddress: string;
  };
  redFlags: {
    eyebrow: string;
    title: string;
    empty: string;
    severity: string;
    flag: string;
    description: string;
    recommendation: string;
  };
  riskSummary: {
    eyebrow: string;
    displayScore: string;
    rawScore: string;
    redFlags: string;
    sources: string;
    scoreNote: string;
    generatedAt: string;
    dateLocale: string;
    generateFullPdf: string;
  };
  screeningCard: {
    eyebrow: string;
    noMatches: string;
    confidence: string;
    potentialMatchLabel: string;
  };
  sourcesChecked: {
    eyebrow: string;
    title: string;
    source: string;
    status: string;
    mode: string;
    freshness: string;
    notes: string;
    checked: string;
    noSources: string;
  };
  reportPreview: {
    eyebrow: string;
    title: string;
    copy: string;
    copied: string;
    print: string;
  };
  errors: {
    globalTitle: string;
    globalDescription: string;
    notFoundTitle: string;
    notFoundDescription: string;
    returnToSearch: string;
  };
  footer: {
    disclaimer: string;
    sources: string;
    updated: string;
    credit: string;
  };
  badges: {
    riskLevels: Record<RiskLevel, string>;
    sourceStatuses: Record<SourceStatus, string>;
    sourceModes: Record<SourceMode, string>;
    freshness: Record<DgTresorFreshness, string>;
  };
  report: {
    title: string;
    companyIdentity: string;
    legalName: string;
    legalForm: string;
    activityCode: string;
    activityLabel: string;
    status: string;
    address: string;
    creationDate: string;
    riskSummary: string;
    indicativeRiskLevel: string;
    riskScore: string;
    rawAdditiveScore: string;
    generatedAt: string;
    keyFindings: string;
    noMajorFinding: string;
    redFlags: string;
    severity: string;
    flag: string;
    description: string;
    recommendedAction: string;
    noMajorIndicatorRow: string;
    standardReview: string;
    screeningResults: string;
    dgTresor: string;
    amf: string;
    noPotentialMatch: string;
    screeningFreshness: string;
    dgStatus: string;
    dgFreshness: string;
    dgPublicationDate: string;
    dgSnapshotGeneratedAt: string;
    dgRecordCount: string;
    dgNotes: string;
    sourcesChecked: string;
    noSourceChecked: string;
    disclaimerTitle: string;
    disclaimer: string;
    notAvailable: string;
    unknown: string;
  };
  redFlagCopy: Record<RedFlagCode, RedFlagCopy>;
  sourceUnavailable: {
    labelSuffix: string;
    descriptionWithErrorPrefix: string;
    descriptionNoError: string;
    recommendation: string;
  };
  sourceNotes: {
    externalApisDisabled: string;
    demoScreening: string;
    noCompanyProfile: string;
    dgRecordsLoaded: string;
  };
  dgTresorState: {
    notAvailable: string;
    invalidIdentifier: string;
    notRun: string;
    noCompanyProfile: string;
    demo: string;
    snapshotCompletedPrefix: string;
    unknownDate: string;
    failedPrefix: string;
  };
};

const redFlagCopyEn: Record<RedFlagCode, RedFlagCopy> = {
  INVALID_IDENTIFIER: {
    label: "Invalid SIREN or SIRET",
    description: "The submitted identifier does not pass French SIREN/SIRET validation.",
    source: "Input validation",
    recommendation: "Ask the analyst to verify the identifier before continuing.",
  },
  COMPANY_NOT_FOUND: {
    label: "Company not found",
    description: "No company profile could be resolved for the submitted identifier.",
    source: "Company lookup",
    recommendation: "Verify the identifier and retry with official source access if needed.",
  },
  COMPANY_INACTIVE: {
    label: "Company inactive",
    description: "The company profile indicates an inactive administrative status.",
    source: "Company profile",
    recommendation: "Review the company status before onboarding or continuing checks.",
  },
  COMPANY_CLOSED: {
    label: "Company closed",
    description: "The company profile indicates that the company is closed.",
    source: "Company profile",
    recommendation: "Ask for updated registration evidence and route the case to manual review.",
  },
  MISSING_LEGAL_NAME: {
    label: "Missing legal name",
    description: "The company profile does not include a usable legal name.",
    source: "Company profile",
    recommendation: "Request official registration evidence from the applicant.",
  },
  MISSING_ADDRESS: {
    label: "Missing address",
    description: "The company profile does not include a usable registered address.",
    source: "Company profile",
    recommendation: "Request proof of registered address or check another public source.",
  },
  ADDRESS_MISMATCH: {
    label: "Address mismatch",
    description: "Head office and establishment addresses differ across available records.",
    source: "Source comparison",
    recommendation: "Confirm which address should be used for the KYC file.",
  },
  NAME_MISMATCH: {
    label: "Name mismatch",
    description: "Company names differ across available records.",
    source: "Source comparison",
    recommendation: "Review official registration evidence before proceeding.",
  },
  RECENTLY_CREATED_COMPANY: {
    label: "Recently created company",
    description: "The company appears to have been created within the last six months.",
    source: "Company profile",
    recommendation: "Apply enhanced manual review if this is inconsistent with the customer profile.",
  },
  SENSITIVE_ACTIVITY: {
    label: "Sensitive or regulated activity indicator",
    description: "The activity code belongs to a sector that may require closer compliance review.",
    source: "APE/NAF activity code",
    recommendation: "Confirm applicable licensing, business model, and expected transaction profile.",
  },
  AMF_WARNING_POTENTIAL_MATCH: {
    label: "AMF warning-list potential match",
    description: "A possible match was found in warning-list screening.",
    source: "AMF blacklist screening",
    recommendation: "Review the match manually. Do not treat it as a final compliance decision.",
  },
  SANCTIONS_POTENTIAL_MATCH: {
    label: "Sanctions potential match",
    description: "A possible match was found in asset-freezing screening.",
    source: "DG Tresor Gels des avoirs",
    recommendation: "Escalate for human compliance review before proceeding.",
  },
  SOURCE_UNAVAILABLE: {
    label: "Source unavailable",
    description: "The source could not be checked.",
    source: "Source monitoring",
    recommendation: "Retry later or review the source manually.",
  },
};

const redFlagCopyFr: Record<RedFlagCode, RedFlagCopy> = {
  INVALID_IDENTIFIER: {
    label: "SIREN ou SIRET invalide",
    description: "L'identifiant soumis ne passe pas la validation française SIREN/SIRET.",
    source: "Validation de l'entrée",
    recommendation: "Demander à l'analyste de vérifier l'identifiant avant de continuer.",
  },
  COMPANY_NOT_FOUND: {
    label: "Entreprise introuvable",
    description: "Aucun profil d'entreprise n'a pu être résolu pour l'identifiant soumis.",
    source: "Recherche d'entreprise",
    recommendation: "Vérifier l'identifiant et réessayer avec l'accès aux sources officielles si nécessaire.",
  },
  COMPANY_INACTIVE: {
    label: "Entreprise inactive",
    description: "Le profil indique un statut administratif inactif.",
    source: "Profil d'entreprise",
    recommendation: "Examiner le statut de l'entreprise avant l'entrée en relation ou la poursuite des contrôles.",
  },
  COMPANY_CLOSED: {
    label: "Entreprise fermée",
    description: "Le profil indique que l'entreprise est fermée.",
    source: "Profil d'entreprise",
    recommendation: "Demander une preuve d'immatriculation à jour et orienter le dossier vers une revue manuelle.",
  },
  MISSING_LEGAL_NAME: {
    label: "Dénomination manquante",
    description: "Le profil ne contient pas de dénomination exploitable.",
    source: "Profil d'entreprise",
    recommendation: "Demander une preuve officielle d'immatriculation au demandeur.",
  },
  MISSING_ADDRESS: {
    label: "Adresse manquante",
    description: "Le profil ne contient pas d'adresse enregistrée exploitable.",
    source: "Profil d'entreprise",
    recommendation: "Demander un justificatif d'adresse ou consulter une autre source publique.",
  },
  ADDRESS_MISMATCH: {
    label: "Incohérence d'adresse",
    description: "Le siège et l'établissement présentent des adresses différentes dans les données disponibles.",
    source: "Comparaison des sources",
    recommendation: "Confirmer l'adresse à retenir dans le dossier KYC.",
  },
  NAME_MISMATCH: {
    label: "Incohérence de nom",
    description: "Les noms de l'entreprise diffèrent entre les données disponibles.",
    source: "Comparaison des sources",
    recommendation: "Examiner les preuves officielles d'immatriculation avant de poursuivre.",
  },
  RECENTLY_CREATED_COMPANY: {
    label: "Entreprise récemment créée",
    description: "L'entreprise semble avoir été créée au cours des six derniers mois.",
    source: "Profil d'entreprise",
    recommendation: "Appliquer une revue manuelle renforcée si cela ne correspond pas au profil client.",
  },
  SENSITIVE_ACTIVITY: {
    label: "Indicateur d'activité sensible ou réglementée",
    description: "Le code d'activité appartient à un secteur qui peut nécessiter une revue conformité approfondie.",
    source: "Code APE/NAF",
    recommendation: "Confirmer les licences applicables, le modèle économique et le profil transactionnel attendu.",
  },
  AMF_WARNING_POTENTIAL_MATCH: {
    label: "Correspondance potentielle avec une liste d'alerte AMF",
    description: "Une correspondance possible a été trouvée dans le screening des listes d'alerte.",
    source: "Screening des listes noires AMF",
    recommendation: "Examiner la correspondance manuellement. Ne pas la traiter comme une décision conformité finale.",
  },
  SANCTIONS_POTENTIAL_MATCH: {
    label: "Correspondance potentielle sanctions",
    description: "Une correspondance possible a été trouvée dans le screening gels des avoirs.",
    source: "DG Trésor Gels des avoirs",
    recommendation: "Escalader vers une revue conformité humaine avant de poursuivre.",
  },
  SOURCE_UNAVAILABLE: {
    label: "Source indisponible",
    description: "La source n'a pas pu être vérifiée.",
    source: "Suivi des sources",
    recommendation: "Réessayer plus tard ou examiner la source manuellement.",
  },
};

export const dictionaries: Record<Locale, Dictionary> = {
  en: {
    appName: "French Company KYC Pre-Check",
    metadata: {
      title: "French Company KYC Pre-Check",
      description: "Demo-first operational pre-check prototype for French company KYC review.",
    },
    nav: {
      demo: "Demo",
      sources: "Sources",
      languageLabel: "Select language",
      english: "English",
      french: "Français",
    },
    home: {
      eyebrow: "Operational pre-check prototype",
      title: "French Company KYC Pre-Check",
      description:
        "Validate a SIREN or SIRET, collect company profile data, flag preliminary risk indicators, and generate a structured review report.",
      cards: [
        {
          title: "Company identity",
          text: "SIREN/SIRET validation and normalized profile view.",
        },
        {
          title: "Risk indicators",
          text: "Transparent rules for status, missing data, activity, and source issues.",
        },
        {
          title: "Review report",
          text: "Markdown report with source statuses and review-safe language.",
        },
      ],
      runTitle: "Run pre-check",
      runDescription: "Enter a French company identifier.",
      demoCta: "Open stable demo",
    },
    searchForm: {
      identifierLabel: "SIREN / SIRET",
      placeholder: "100000009",
      submit: "Run pre-check",
    },
    disclaimer: {
      paragraphs: [
        "This application is a portfolio project and an operational pre-check prototype. It does not provide legal, regulatory, AML, sanctions, or compliance advice.",
      ],
    },
    demo: {
      eyebrow: "Stable fixtures",
      title: "Demo companies",
      backToSearch: "Back to search",
      status: "Status",
      flags: "Flags",
      openPrecheck: "Open pre-check",
    },
    check: {
      newCheck: "New check",
      demoMode: "Demo mode",
      invalidTitle: "Invalid SIREN or SIRET",
      invalidDescription: "The submitted identifier could not be validated. Check the number and try again.",
      dgTitle: "DG Tresor asset-freezing screening",
      dgDescription: "Pre-screening against checked public data.",
      amfTitle: "AMF warning-list screening",
      amfDescription: "Warning-list screening for unauthorized financial services indicators.",
    },
    companyIdentity: {
      eyebrow: "Company identity",
      unavailableTitle: "Company profile unavailable",
      notAvailable: "Not available",
      submittedIdentifier: "Submitted identifier",
      identifierType: "Identifier type",
      siren: "SIREN",
      siret: "SIRET",
      legalForm: "Legal form",
      status: "Status",
      activityCode: "APE / NAF code",
      activity: "Activity",
      creationDate: "Creation date",
      registeredAddress: "Registered address",
      establishmentAddress: "Establishment address",
    },
    redFlags: {
      eyebrow: "Red flags",
      title: "Review indicators",
      empty: "No major indicator was generated by this pre-check.",
      severity: "Severity",
      flag: "Flag",
      description: "Description",
      recommendation: "Recommended action",
    },
    riskSummary: {
      eyebrow: "Risk summary",
      displayScore: "Display score",
      rawScore: "Raw score",
      redFlags: "Red flags",
      sources: "Sources",
      scoreNote: "Risk scoring is indicative and intended for operational pre-check only.",
      generatedAt: "Generated at",
      dateLocale: "en-GB",
      generateFullPdf: "Generate full PDF",
    },
    screeningCard: {
      eyebrow: "Screening",
      noMatches: "No potential match found in checked data.",
      confidence: "Confidence",
      potentialMatchLabel: "Potential match requiring review",
    },
    sourcesChecked: {
      eyebrow: "Sources checked",
      title: "Source status",
      source: "Source",
      status: "Status",
      mode: "Mode",
      freshness: "Freshness",
      notes: "Notes",
      checked: "Checked",
      noSources: "No source checked.",
    },
    reportPreview: {
      eyebrow: "Report",
      title: "Markdown preview",
      copy: "Copy",
      copied: "Copied",
      print: "Print",
    },
    errors: {
      globalTitle: "Something went wrong",
      globalDescription:
        "The pre-check interface could not render this view. No final compliance decision has been made.",
      notFoundTitle: "Page not found",
      notFoundDescription: "The requested page is not available.",
      returnToSearch: "Return to search",
    },
    footer: {
      disclaimer: "Portfolio project and first-level operational pre-check. No final compliance decision is made by this tool.",
      sources: "Sources: Annuaire des Entreprises, INSEE/Sirene, DG Tresor, AMF.",
      updated: "Updated",
      credit: "2026 - from Paris by Fred-Vu -",
    },
    badges: {
      riskLevels: {
        low: "low",
        medium: "medium",
        high: "high",
        critical: "critical",
        unknown: "unknown",
      },
      sourceStatuses: {
        success: "success",
        partial: "partial",
        failed: "failed",
        not_checked: "not checked",
      },
      sourceModes: {
        demo: "demo",
        live: "live",
        snapshot: "snapshot",
        skipped: "skipped",
      },
      freshness: {
        fresh: "fresh",
        stale: "stale",
        very_stale: "very stale",
        unknown: "unknown",
      },
    },
    report: {
      title: "French Company KYC Pre-Check Report",
      companyIdentity: "Company Identity",
      legalName: "Legal name",
      legalForm: "Legal form",
      activityCode: "Activity code",
      activityLabel: "Activity label",
      status: "Status",
      address: "Address",
      creationDate: "Creation date",
      riskSummary: "Risk Summary",
      indicativeRiskLevel: "Indicative risk level",
      riskScore: "Risk score",
      rawAdditiveScore: "Raw additive score",
      generatedAt: "Generated at",
      keyFindings: "Key Findings",
      noMajorFinding: "No major indicator was generated by this pre-check.",
      redFlags: "Red Flags",
      severity: "Severity",
      flag: "Flag",
      description: "Description",
      recommendedAction: "Recommended action",
      noMajorIndicatorRow: "No major indicator",
      standardReview: "Continue standard human review.",
      screeningResults: "Screening Results",
      dgTresor: "DG Tresor Registre National des Gels",
      amf: "AMF Blacklists",
      noPotentialMatch: "No potential match found in checked data.",
      screeningFreshness: "Screening Freshness",
      dgStatus: "DG Tresor status",
      dgFreshness: "DG Tresor freshness",
      dgPublicationDate: "DG Tresor publication date",
      dgSnapshotGeneratedAt: "DG Tresor snapshot generated at",
      dgRecordCount: "DG Tresor record count",
      dgNotes: "DG Tresor notes",
      sourcesChecked: "Sources Checked",
      noSourceChecked: "No source checked.",
      disclaimerTitle: "Disclaimer",
      disclaimer:
        "This report is a first-level operational pre-check. It does not replace human compliance review and does not constitute a final KYC, AML, sanctions, or compliance decision.",
      notAvailable: "Not available",
      unknown: "unknown",
    },
    redFlagCopy: redFlagCopyEn,
    sourceUnavailable: {
      labelSuffix: "unavailable",
      descriptionWithErrorPrefix: "The source could not be checked:",
      descriptionNoError: "The source could not be checked.",
      recommendation: "Retry later or review the source manually.",
    },
    sourceNotes: {
      externalApisDisabled: "External API calls are disabled. No matching demo fixture was found.",
      demoScreening: "Demo screening result generated from deterministic fixture data.",
      noCompanyProfile: "No company profile was available for screening.",
      dgRecordsLoaded: "{count} DG Tresor records loaded from local snapshot.",
    },
    dgTresorState: {
      notAvailable: "DG Tresor data snapshot is not available. Manual screening recommended.",
      invalidIdentifier: "DG Tresor screening was not run because the submitted identifier is invalid.",
      notRun: "DG Tresor screening was not run.",
      noCompanyProfile: "DG Tresor screening was not run because no company profile was available.",
      demo: "DG Tresor demo screening completed using deterministic fixture data.",
      snapshotCompletedPrefix: "DG Tresor screening completed using local snapshot generated at",
      unknownDate: "unknown",
      failedPrefix: "DG Tresor snapshot screening failed:",
    },
  },
  fr: {
    appName: "Pré-contrôle KYC des entreprises françaises",
    metadata: {
      title: "Pré-contrôle KYC des entreprises françaises",
      description: "Prototype opérationnel demo-first pour la revue KYC d'entreprises françaises.",
    },
    nav: {
      demo: "Démo",
      sources: "Sources",
      languageLabel: "Choisir la langue",
      english: "English",
      french: "Français",
    },
    home: {
      eyebrow: "Prototype de pré-contrôle opérationnel",
      title: "Pré-contrôle KYC des entreprises françaises",
      description:
        "Validez un SIREN ou SIRET, collectez les données de profil, identifiez les premiers indicateurs de risque et générez un rapport structuré.",
      cards: [
        {
          title: "Identité de l'entreprise",
          text: "Validation SIREN/SIRET et vue normalisée du profil.",
        },
        {
          title: "Indicateurs de risque",
          text: "Règles transparentes pour le statut, les données manquantes, l'activité et les sources.",
        },
        {
          title: "Rapport de revue",
          text: "Rapport Markdown avec statut des sources et formulation adaptée à la revue.",
        },
      ],
      runTitle: "Lancer le pré-contrôle",
      runDescription: "Saisissez un identifiant d'entreprise française.",
      demoCta: "Ouvrir la démo stable",
    },
    searchForm: {
      identifierLabel: "SIREN / SIRET",
      placeholder: "100000009",
      submit: "Lancer le pré-contrôle",
    },
    disclaimer: {
      paragraphs: [
        "Cette application est un projet portfolio et un prototype de pré-vérification opérationnelle. Elle ne fournit pas de conseil juridique, réglementaire, AML, sanctions ou conformité.",
      ],
    },
    demo: {
      eyebrow: "Jeux de données stables",
      title: "Entreprises de démonstration",
      backToSearch: "Retour à la recherche",
      status: "Statut",
      flags: "Alertes",
      openPrecheck: "Ouvrir le pré-contrôle",
    },
    check: {
      newCheck: "Nouveau contrôle",
      demoMode: "Mode démo",
      invalidTitle: "SIREN ou SIRET invalide",
      invalidDescription: "L'identifiant soumis n'a pas pu être validé. Vérifiez le numéro puis réessayez.",
      dgTitle: "Screening gels des avoirs DG Trésor",
      dgDescription: "Pré-screening sur les données publiques contrôlées.",
      amfTitle: "Screening des listes d'alerte AMF",
      amfDescription: "Screening des indicateurs liés aux services financiers non autorisés.",
    },
    companyIdentity: {
      eyebrow: "Identité de l'entreprise",
      unavailableTitle: "Profil d'entreprise indisponible",
      notAvailable: "Non disponible",
      submittedIdentifier: "Identifiant soumis",
      identifierType: "Type d'identifiant",
      siren: "SIREN",
      siret: "SIRET",
      legalForm: "Forme juridique",
      status: "Statut",
      activityCode: "Code APE / NAF",
      activity: "Activité",
      creationDate: "Date de création",
      registeredAddress: "Adresse du siège",
      establishmentAddress: "Adresse de l'établissement",
    },
    redFlags: {
      eyebrow: "Alertes",
      title: "Indicateurs de revue",
      empty: "Aucun indicateur majeur n'a été généré par ce pré-contrôle.",
      severity: "Sévérité",
      flag: "Alerte",
      description: "Description",
      recommendation: "Action recommandée",
    },
    riskSummary: {
      eyebrow: "Synthèse du risque",
      displayScore: "Score affiché",
      rawScore: "Score brut",
      redFlags: "Alertes",
      sources: "Sources",
      scoreNote: "Le scoring est indicatif et destiné uniquement au pré-contrôle opérationnel.",
      generatedAt: "Généré le",
      dateLocale: "fr-FR",
      generateFullPdf: "Générer le PDF complet",
    },
    screeningCard: {
      eyebrow: "Screening",
      noMatches: "Aucune correspondance potentielle trouvée dans les données contrôlées.",
      confidence: "Confiance",
      potentialMatchLabel: "Correspondance potentielle nécessitant une revue",
    },
    sourcesChecked: {
      eyebrow: "Sources contrôlées",
      title: "Statut des sources",
      source: "Source",
      status: "Statut",
      mode: "Mode",
      freshness: "Fraîcheur",
      notes: "Notes",
      checked: "Contrôlée",
      noSources: "Aucune source contrôlée.",
    },
    reportPreview: {
      eyebrow: "Rapport",
      title: "Aperçu Markdown",
      copy: "Copier",
      copied: "Copié",
      print: "Imprimer",
    },
    errors: {
      globalTitle: "Une erreur est survenue",
      globalDescription:
        "L'interface de pré-contrôle n'a pas pu afficher cette vue. Aucune décision conformité finale n'a été prise.",
      notFoundTitle: "Page introuvable",
      notFoundDescription: "La page demandée n'est pas disponible.",
      returnToSearch: "Retour à la recherche",
    },
    footer: {
      disclaimer:
        "Projet portfolio et pré-contrôle opérationnel de premier niveau. Cet outil ne prend aucune décision conformité finale.",
      sources: "Sources : Annuaire des Entreprises, INSEE/Sirene, DG Trésor, AMF.",
      updated: "Mis à jour",
      credit: "2026 - from Paris by Fred-Vu -",
    },
    badges: {
      riskLevels: {
        low: "faible",
        medium: "moyen",
        high: "élevé",
        critical: "critique",
        unknown: "inconnu",
      },
      sourceStatuses: {
        success: "succès",
        partial: "partiel",
        failed: "échec",
        not_checked: "non contrôlée",
      },
      sourceModes: {
        demo: "démo",
        live: "live",
        snapshot: "snapshot",
        skipped: "ignorée",
      },
      freshness: {
        fresh: "à jour",
        stale: "vieillissant",
        very_stale: "très ancien",
        unknown: "inconnu",
      },
    },
    report: {
      title: "Rapport de pré-contrôle KYC entreprise française",
      companyIdentity: "Identité de l'entreprise",
      legalName: "Dénomination",
      legalForm: "Forme juridique",
      activityCode: "Code d'activité",
      activityLabel: "Libellé d'activité",
      status: "Statut",
      address: "Adresse",
      creationDate: "Date de création",
      riskSummary: "Synthèse du risque",
      indicativeRiskLevel: "Niveau de risque indicatif",
      riskScore: "Score de risque",
      rawAdditiveScore: "Score additif brut",
      generatedAt: "Généré le",
      keyFindings: "Constats clés",
      noMajorFinding: "Aucun indicateur majeur n'a été généré par ce pré-contrôle.",
      redFlags: "Alertes",
      severity: "Sévérité",
      flag: "Alerte",
      description: "Description",
      recommendedAction: "Action recommandée",
      noMajorIndicatorRow: "Aucun indicateur majeur",
      standardReview: "Poursuivre la revue humaine standard.",
      screeningResults: "Résultats de screening",
      dgTresor: "DG Trésor Registre National des Gels",
      amf: "Listes noires AMF",
      noPotentialMatch: "Aucune correspondance potentielle trouvée dans les données contrôlées.",
      screeningFreshness: "Fraîcheur du screening",
      dgStatus: "Statut DG Trésor",
      dgFreshness: "Fraîcheur DG Trésor",
      dgPublicationDate: "Date de publication DG Trésor",
      dgSnapshotGeneratedAt: "Snapshot DG Trésor généré le",
      dgRecordCount: "Nombre d'enregistrements DG Trésor",
      dgNotes: "Notes DG Trésor",
      sourcesChecked: "Sources contrôlées",
      noSourceChecked: "Aucune source contrôlée.",
      disclaimerTitle: "Clause de non-responsabilité",
      disclaimer:
        "Ce rapport est une pré-vérification opérationnelle de premier niveau. Il ne remplace pas la revue humaine conformité et ne constitue pas une décision finale en matière de KYC, AML, sanctions ou conformité.",
      notAvailable: "Non disponible",
      unknown: "inconnu",
    },
    redFlagCopy: redFlagCopyFr,
    sourceUnavailable: {
      labelSuffix: "indisponible",
      descriptionWithErrorPrefix: "La source n'a pas pu être contrôlée :",
      descriptionNoError: "La source n'a pas pu être contrôlée.",
      recommendation: "Réessayer plus tard ou examiner la source manuellement.",
    },
    sourceNotes: {
      externalApisDisabled: "Les appels API externes sont désactivés. Aucun fixture de démo correspondant n'a été trouvé.",
      demoScreening: "Résultat de screening démo généré à partir de données déterministes.",
      noCompanyProfile: "Aucun profil d'entreprise n'était disponible pour le screening.",
      dgRecordsLoaded: "{count} enregistrements DG Trésor chargés depuis le snapshot local.",
    },
    dgTresorState: {
      notAvailable: "Le snapshot DG Trésor n'est pas disponible. Un screening manuel est recommandé.",
      invalidIdentifier: "Le screening DG Trésor n'a pas été lancé car l'identifiant soumis est invalide.",
      notRun: "Le screening DG Trésor n'a pas été lancé.",
      noCompanyProfile: "Le screening DG Trésor n'a pas été lancé car aucun profil d'entreprise n'était disponible.",
      demo: "Screening DG Trésor démo terminé à partir de données déterministes.",
      snapshotCompletedPrefix: "Screening DG Trésor terminé avec le snapshot local généré le",
      unknownDate: "date inconnue",
      failedPrefix: "Échec du screening snapshot DG Trésor :",
    },
  },
};

export type AppDictionary = Dictionary;

export function getDictionary(locale: Locale = defaultLocale): AppDictionary {
  return dictionaries[normalizeLocale(locale)];
}
