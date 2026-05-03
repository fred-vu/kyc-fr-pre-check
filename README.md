# French Company KYC Pre-Check Tool

Demo-first MVP for first-level French company KYC pre-checks.

The application validates SIREN/SIRET identifiers, resolves a company profile, applies transparent risk indicators, screens against public warning data when enabled, and generates a structured report for human review.

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
npm run build
npm run refresh:dg-tresor
```

## Compliance Disclaimer

This application is a portfolio project and an operational pre-check prototype. It does not provide legal, regulatory, AML, sanctions, or compliance advice. It does not replace official KYC procedures or human compliance review.

Cette application est un projet portfolio et un prototype de pre-verification operationnelle. Elle ne fournit pas de conseil juridique, reglementaire, AML, sanctions ou conformite. Elle ne remplace pas les procedures KYC officielles ni la revue humaine d'un analyste conformite.

## Future Improvements

- Batch company checks.
- Authentication and audit trail.
- Beneficial ownership module.
- Full PDF generation.
- Dedicated rate limiting service for production deployments.
