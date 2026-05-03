# French Company KYC Pre-Check Tool

Demo-first MVP for first-level French company KYC pre-checks.

The application validates SIREN/SIRET identifiers, resolves a company profile, applies transparent risk indicators, screens against public warning data when enabled, and generates a structured report for human review.

## Live Demo

Production: https://kyc-fr-pre-check.vercel.app/

## What Problem This Solves

Compliance and operations teams often need a fast first-pass view before opening a full KYC review. This tool turns a French SIREN/SIRET into a review-ready pre-check: company identity, source status, preliminary risk indicators, screening matches, data freshness, and a printable report.

The goal is not to automate a final decision. The goal is to make the first human review faster, clearer, and easier to audit.

## Screenshots

### Landing Page

![Landing page](public/screenshots/home-desktop.png)

### Pre-Check Result

![Pre-check result](public/screenshots/check-desktop.png)

### Mobile Result View

![Mobile result view](public/screenshots/check-mobile.png)

## Scope

This is an operational pre-check prototype. It does not make final KYC, AML, sanctions, legal, regulatory, or compliance decisions.

V1 is intentionally demo-first:

- `/demo` works without external APIs or credentials.
- Known demo identifiers resolve through deterministic fixtures.
- Live sources are optional enrichment.
- Source failures are shown as partial results instead of breaking the workflow.

## Demo Identifiers

| Scenario | SIREN | SIRET |
|---|---:|---:|
| Normal active company | `100000009` | `10000000900017` |
| Closed company | `100000017` | `10000001700010` |
| Inconsistent sensitive activity | `100000025` | `10000002500013` |

All demo company names are fictional.

## Features

- SIREN/SIRET validation with checksum.
- Demo fixtures for stable offline operation.
- Company identity dashboard.
- Transparent risk scoring and red flags.
- Demo and optional live source status tracking.
- English/French interface with a flag language selector.
- Conservative screening match language.
- Markdown report generation.
- Copy report and browser print export.
- English and French disclaimers.

## Architecture Summary

- **Next.js App Router** serves the portfolio UI, result pages, and API routes.
- **KYC orchestration** lives in `lib/kyc/run-precheck.ts`, combining identifier validation, company lookup, screening, red flags, scoring, and report generation.
- **Demo-first data path** keeps `/demo` and known fixtures stable without external API dependencies.
- **Live enrichment** uses Annuaire des Entreprises, AMF dataset resolution, and the committed DG Tresor local snapshot.
- **DG Tresor snapshot strategy** keeps `/api/precheck` fast by reading `data/dg-tresor-index.json`; a GitHub Action refreshes the snapshot weekly.
- **i18n layer** uses a lightweight English/French dictionary and a language cookie.
- **Verification** combines Vitest unit/integration tests and Playwright production smoke tests.

## Architecture Diagram

```mermaid
flowchart TD
  User[Analyst or reviewer] --> UI[Next.js UI]
  UI --> API[API routes]
  API --> KYC[KYC pre-check orchestrator]

  KYC --> Validation[SIREN/SIRET validation]
  KYC --> Company[Company profile resolver]
  KYC --> Screening[Screening engine]
  KYC --> Risk[Risk scoring and red flags]
  KYC --> Report[Markdown and PDF report output]

  Company --> Demo[Demo fixtures]
  Company --> Annuaire[Annuaire des Entreprises]
  Screening --> DGTresor[DG Tresor local snapshot]
  Screening --> AMF[AMF warning-list dataset]

  KYC -. V2 .-> Cases[(Saved checks and case database)]
  Cases -. V2 .-> Audit[Audit trail and analyst notes]
  Cases -. V2 .-> Auth[Authenticated reviewer workspace]
```

## Data Sources

V1 source priority:

1. Demo fixtures.
2. Annuaire des Entreprises / API Recherche d'Entreprises.
3. DG Tresor Gels des avoirs local snapshot.
4. AMF blacklists dataset.

External references:

- https://www.data.gouv.fr/dataservices/api-recherche-dentreprises
- https://www.data.gouv.fr/dataservices/api-gels-des-avoirs
- https://www.data.gouv.fr/datasets/listes-noires-des-entites-non-autorisees-a-proposer-des-produits-ou-services-financiers-en-france/

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Zod
- Vitest
- Lucide React
- Vercel-ready deployment

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

Copy `.env.example` to `.env.local` for local overrides.

Default stable demo mode:

```env
ENABLE_DEMO_MODE=true
ENABLE_EXTERNAL_API_CALLS=false
```

Optional live enrichment:

```env
ENABLE_DEMO_MODE=true
ENABLE_EXTERNAL_API_CALLS=true
```

For AMF warning-list screening, leave `AMF_BLACKLIST_DATASET_URL` blank or set it to the stable data.gouv dataset API:

```env
AMF_BLACKLIST_DATASET_URL=https://www.data.gouv.fr/api/1/datasets/listes-noires-des-entites-non-autorisees-a-proposer-des-produits-ou-services-financiers-en-france/
```

Do not set it to the AMF public webpage URL, because that page returns HTML, not CSV.

DG Tresor screening uses the committed local snapshot in `data/dg-tresor-index.json`.
The snapshot is refreshed by `.github/workflows/refresh-dg-tresor.yml` every Monday at 04:00 UTC.
For local refreshes, run `npm run refresh:dg-tresor`.

## Scripts

```bash
npm run typecheck
npm test
npm run test:smoke:prod
npm run build
npm run refresh:dg-tresor
```

Production smoke tests default to `https://kyc-fr-pre-check.vercel.app`.
To run them against another deployment:

```bash
PLAYWRIGHT_BASE_URL=https://your-preview-url.vercel.app npm run test:smoke:prod
```

## Limitations & Compliance Disclaimer

This application is a portfolio project and an operational pre-check prototype. It does not provide legal, regulatory, AML, sanctions, or compliance advice. It does not replace official KYC procedures or human compliance review.

Cette application est un projet portfolio et un prototype de pre-verification operationnelle. Elle ne fournit pas de conseil juridique, reglementaire, AML, sanctions ou conformite. Elle ne remplace pas les procedures KYC officielles ni la revue humaine d'un analyste conformite.

Known limitations:

- Screening matches are conservative indicators, not verified sanctions or warning-list decisions.
- Public data sources can be unavailable, delayed, incomplete, or inconsistent.
- DG Tresor screening depends on the latest committed snapshot until the weekly refresh workflow runs.
- The AMF warning-list parser is designed for the public dataset shape and may need adaptation if the dataset schema changes.
- No authentication, audit trail, case assignment, or evidence storage is included in this MVP.
- Beneficial ownership, PEP screening, adverse media, and document verification are out of scope.

## V2 Roadmap

V2 should move the project from a demo-first pre-check into a trust-first review workflow. The next version should preserve the stable demo path while adding persistence, reviewer context, clearer evidence, and operational guardrails.

### V2.1: Production Readiness

- Add a GitHub Actions CI workflow for `typecheck`, `test`, `build`, and Playwright smoke tests.
- Add a source health view showing DG Tresor snapshot date, AMF dataset status, and live API availability.
- Improve error states for slow or unavailable public data sources.
- Version generated reports with app version, generation time, and source freshness metadata.

### V2.2: Saved Checks

- Add a database layer, likely Supabase or Neon Postgres.
- Persist each pre-check result with identifier, company snapshot, score, screening evidence, report markdown, language, and timestamp.
- Add a `/checks` history page with search, filters, and result reopening.
- Keep demo fixtures available so the app remains portfolio-friendly without credentials.

### V2.3: Case Review Workflow

- Add case states: `Draft`, `Needs Review`, `Cleared`, `Escalated`, and `Rejected`.
- Add analyst notes and decision rationale fields.
- Add a case detail page with source evidence, generated report, and status history.
- Add full PDF export per saved case.

### V2.4: Authenticated Workspace

- Add authentication for saved checks and case review, using magic link, GitHub, or Google login.
- Protect history, case pages, and reviewer notes.
- Keep a public demo path for portfolio review.
- Add minimal role separation if the app grows beyond a single reviewer.

### V2.5: Batch Screening

- Add CSV upload for multiple SIREN/SIRET identifiers.
- Return a review table with status, risk level, screening matches, and source errors.
- Add CSV export and batch PDF summary.
- Add queueing or throttling if live enrichment is enabled.

### V2.6: Screening Explainability

- Store matched list entry, normalized query, match score, rule name, and confidence tier.
- Strengthen name normalization for accents, legal form noise, punctuation, ampersands, quotes, and French association names.
- Separate exact, strong fuzzy, weak fuzzy, and no-match outcomes.
- Make every screening indicator explainable in the UI and report.

### Later Candidates

- Beneficial ownership module.
- PEP screening.
- Adverse media signals.
- Document verification.
- Dedicated production rate limiting service.
