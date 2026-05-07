# Dentstock Backend

Fastify + TypeScript backend that loads supplier catalogue CSVs, enriches products with cross-supplier matches, and exposes the result via a REST endpoint. The implementation prioritises clarity and explainability over complexity. More advanced architectural patterns (e.g. CQRS, event-driven ingestion, or modular frameworks such as NestJS) were considered but intentionally not introduced at this stage due to the scope of the problem.

## What this service does

- Loads product rows from `../data/novadent_catalogue.csv` and `../data/primecare_catalogue.csv`
- Normalises fields (for example `vat_rate` to numeric `vatRate`)
- Computes product matches:
  - `identical` when manufacturer code matches exactly
  - `similar` using token-based name similarity plus brand/pack-size boosts
  - transitive similar matching through identical cross-supplier pivot products
- Serves the enriched catalogue through `GET /catalogue`
- Exposes Swagger UI at `/documentation`

## Tech stack

- Node.js (ESM)
- TypeScript
- Fastify
- Swagger (`@fastify/swagger`, `@fastify/swagger-ui`)
- CSV parsing (`csv-parse`)
- Vitest (unit and integration testing)

## Architecture decisions

- **Fastify + TypeScript**: Chosen for strong typing, performance, and schema-driven validation. This keeps the API contract explicit and self-documented via Swagger.
- **Layered structure (routes → controllers → services)**: Separates HTTP concerns from business logic and data access, making the system easier to test and evolve.
- **CSV loader abstraction**: Data ingestion is isolated from matching logic, allowing the data source to be replaced later (e.g. database or external API) without impacting the rest of the system.
- **Single `/catalogue` endpoint**: Returns enriched data optimised for frontend consumption. In a production system, this would likely be split and paginated.
- **Testable design**: Services and loaders are structured to allow unit testing with minimal mocking, enabling validation of parsing, matching, and API behaviour in isolation.

## Matching strategy

Matching is designed to be deterministic where possible and explainable where not.

### Identical matches

Products are treated as identical when their manufacturer codes match exactly after normalisation. This is considered the strongest available identifier in the supplied data and returns a confidence score of `1`.

### Similar matches

Where no identical match is found, the service calculates a similarity score using:

- token-based name similarity using Jaccard similarity
- brand match boost
- pack-size match boost
- a minimum confidence threshold to reduce noisy matches

Each match includes a `confidence` score and a human-readable `reason`.

### Transitive matching

The service also supports transitive similar matching through identical cross-supplier pivot products.

For example, if:

- product A is identical to product B via manufacturer code
- product B is similar to product C

Then product C can be returned as a lower-confidence match for product A, with the confidence slightly discounted and the reason marked as coming via an identical pivot.

## Trade-offs and limitations

- Matching is heuristic-based and may produce false positives or miss valid matches
- Token similarity does not account for semantic meaning (e.g. synonyms)
- No persistence layer – data is loaded from CSV on startup
- The `/catalogue` endpoint returns all data in one response, which would not scale for large datasets
- Transitive matching can uncover useful indirect relationships, but it may also introduce weaker matches, so transitive confidence is discounted and the reason is made explicit.

## Testing

The project includes unit and integration tests using Vitest.

### Coverage

- **CSV ingestion**
  - Parses rows correctly
  - Normalises numeric fields (e.g. VAT and price)
  - Ignores empty lines

- **Matching logic**
  - Identical matching via manufacturer code
  - Similar matching using token similarity and boosts
  - Transitive matching via identical pivot products
  - Threshold filtering to prevent weak matches

- **API layer**
  - `GET /catalogue` returns enriched data
  - Service layer is mocked to isolate route behaviour
  - Swagger UI endpoint is accessible

## Future improvements

- Persist data in Postgres with normalised supplier/product models
- Introduce background ingestion jobs for external supplier feeds
- Replace heuristic matching with:
  - fuzzy matching (Levenshtein)
  - semantic matching (embeddings)
- Add pagination and filtering to `/catalogue`
- Add caching (e.g. Redis) for frequently accessed comparisons

## Prerequisites

- Node.js 20+
- npm

## Setup

From `backend/`:

```bash
npm install
```

Create/update `.env`:

```dotenv
PORT=3000
NODE_ENV=development
```

## Run

```bash
npm run dev
```

Build and run compiled output:

```bash
npm run build
npm run start
```

## Scripts

- `npm run dev` - run in watch mode with `tsx`
- `npm run build` - compile TypeScript to `dist/` and rewrite path aliases
- `npm run start` - start compiled server from `dist/server.js`
- `npm run lint` - run ESLint on `src/**/*.ts`
- `npm run prettier` - format source files with Prettier

### Testing

- `npm run test` - run all tests once using Vitest
- `npm run test:watch` - run tests in watch mode
- `npm run test:coverage` - run tests with coverage report


## API

### `GET /catalogue`

Returns an array of catalogue items:

- `supplier`
- `supplierRef`
- `name`
- `brand`
- `manufacturerCode`
- `packSize`
- `unitPriceGbp`
- `vatRate`
- `matches` (array of matched products)

Each `matches` item includes:

- `supplier`
- `supplierRef`
- `name`
- `brand`
- `manufacturerCode`
- `packSize`
- `unitPriceGbp`
- `vatRate`
- `matchType` (`identical` or `similar`)
- `confidence`
- `priceDifferenceGbp`
- `reason`

Example request:

```bash
curl http://localhost:3000/catalogue
```

Swagger docs:

- `http://localhost:3000/documentation`

## Project structure

```text
backend/
  src/
    app.ts
    server.ts
    config/
    controllers/
    models/
    routes/
    services/
  eslint.config.mjs
  tsconfig.json
  package.json
../data/
  novadent_catalogue.csv
  primecare_catalogue.csv
```

## Notes

- CSV data files are expected in `../data` relative to the `backend` folder.
- The server binds to `0.0.0.0` and uses `PORT` from environment config.
