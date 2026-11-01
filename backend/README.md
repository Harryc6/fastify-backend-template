# Backend Starter (Fastify + TypeScript)

Reusable starting point for new backend services. The skeleton is generic; the
`catalogue` domain (CSV loading + cross-supplier matching) is a worked example
showing the intended structure — delete or replace it when you start a new project.

## What's included

- **Fastify 5 + TypeScript (strict, ESM)** — layered structure: `routes → controllers → services`
- **Path aliases** (`@config`, `@controllers`, `@services`, `@models`, `@routes`, `@utils`) wired consistently in `tsconfig.json` + `tsc-alias` + `vitest.config.ts`
- **Swagger UI** at `/documentation`, schema-declared responses
- **`/health`** liveness endpoint
- **CORS** registered (open in dev, empty allowlist in production — tighten per project)
- **Vitest** (unit + integration via `app.inject`, service mocked at the route layer)
- **ESLint** (flat config, type-aware) + **Prettier**
- **Dockerfile** (multi-stage) and **GitHub Actions CI** (lint + typecheck + test)

## Prerequisites

- Node.js 22+
- npm

## Setup

From `backend/`:

```bash
npm install
cp .env.example .env
```

## Run

```bash
npm run dev      # watch mode (tsx)
npm run build    # compile to dist/ and rewrite path aliases
npm run start    # run compiled server
```

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | watch mode |
| `npm run build` / `start` | compile / run compiled output |
| `npm run lint` | ESLint over `src/**/*.ts` |
| `npm run prettier` | format sources |
| `npm run test` / `test:watch` / `test:coverage` | Vitest |

## Configuration

All runtime config flows through `src/config/config.ts` — one place, typed,
validated at boot. Add new settings there rather than reading `process.env`
scattered around.

| Var | Default | Notes |
|---|---|---|
| `PORT` | `3000` | validated integer |
| `NODE_ENV` | `development` | affects CORS |
| `APP_NAME` | `Backend API` | Swagger title |
| `DATA_DIR` | `../data` | resolved relative to `backend/`, not shell cwd |

## Starting a new project from this template

1. Use GitHub "Use this template" (or copy the repo).
2. Rename in `backend/package.json` (`name`, `description`) and set `APP_NAME` in `.env`.
3. Replace the demo domain: delete `src/{routes,controllers,services,models}/catalogue*`,
   the catalogue schemas in `routes`, the `src/services/catalogue/` directory and its tests —
   then add your own following the same layering.
4. Point `DATA_DIR` at your own files (or drop the loader example and use a DB).
5. In `app.ts`, tighten the CORS allowlist and Swagger info; drop `/catalogue` route registration.

## Notes

- `.env` is gitignored; keep `.env.example` current as the documented contract.
- The server binds `0.0.0.0` and takes `PORT` from config.
