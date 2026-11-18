# OpenPath API

OpenPath is the API behind the AllWays career gateway. It stores accounts, employer job posts, and learner applications in PostgreSQL.

## Prerequisites

- Node.js 22 (`nvm use` reads `.nvmrc`)
- npm 10
- Docker with Compose v2

## Local setup

```bash
cp .env.example .env
docker compose up -d
npm install
npm run start:dev
```

`npm install` generates the Prisma Client. The local database password in `.env.example` and `docker-compose.yml` is for Docker on your machine. `.env` is gitignored.

PostgreSQL 16 listens on `localhost:5432`. The API listens on port `3001` so the AllWays frontend can keep Vite on port `3000`.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/v1/health` | Process liveness and `SELECT 1` against PostgreSQL. Database failure returns HTTP 503. |
| POST | `/api/v1/accounts` | Create an account. Body: `name`, `email`, `password`. Duplicate email returns 409. |
| POST | `/api/v1/sessions` | Sign in with an account saved by Register. An unknown email returns 401 and asks the person to register. A wrong password returns 401. |
| GET | `/api/v1/jobs` | Learner job board. Employer posts come first, then the starter jobs. |
| POST | `/api/v1/jobs` | Employer job post. Body: `title`, `organization`, `location`, `summary`, `supports`, optional `otherSupport`. |
| GET | `/api/v1/jobs/:id` | One job. |
| POST | `/api/v1/jobs/:id/applications` | Career gateway application. Body: `name`, `phone`, `experience`. |
| GET | `/api/v1/jobs/:id/applications` | Applications saved for that job. |
| POST | `/api/v1/applications` | Full application assistant submission. Returns a reference such as `OP-JOB-4821`. |
| POST | `/api/v1/amharic/reply` | Understand a message and answer in spoken Addis Ababa Amharic. Body: `message`. |
| GET | `/api/docs` | Swagger UI |
| GET | `/api/docs-json` | OpenAPI document |

`supports` values are `screen`, `step`, `flexible`, `written`, and `sign`. Passwords are stored with scrypt and are not returned. The four starter jobs are inserted the first time the API reaches PostgreSQL.

The AllWays frontend proxies `/api/v1` to this process. Speech routes `/api/tts` and `/api/stt` stay on the frontend dev server. Send recognized speech text to `/api/v1/amharic/reply`.

Amharic replies use the spoken Addis Ababa dialect. Career answers (jobs, applications, accounts, accessibility) are written in that everyday register. Other questions are answered from the Leyu Addis Ababa transcripts when the wording matches: [gheero-Leyu/leyu-amharic-addis-ababa-dialect](https://huggingface.co/datasets/gheero-Leyu/leyu-amharic-addis-ababa-dialect), CC BY 4.0. The API stores those transcripts only, not the audio. When a reply is taken from the corpus, `fromCorpus` is true and `source` names the dataset.

Healthy response:

```json
{ "status": "ok", "checks": { "database": "up" } }
```

Database failure:

```json
{ "status": "error", "checks": { "database": "down" } }
```

The process still boots when PostgreSQL is down, so the health route can return 503.

## Checks

```bash
npm test
npm run lint
npm run build
```

Unit tests mock Prisma. They do not need Docker.

Confirm a live database from a running API:

```bash
curl -sS http://localhost:3001/api/v1/health
```

Stop the database container with `docker compose down`. Add `-v` only when you intend to delete the local data volume.

## Layout

```text
src/main.ts                 bootstrap, global prefix, CORS, Swagger
src/config/env.schema.ts    Zod environment validation
src/prisma/                 Prisma client
src/health/                 GET /api/v1/health
src/accounts/               register and sign-in
src/jobs/                   job board and employer posts
src/applications/           career and full applications
src/amharic/                Addis Ababa Amharic understanding and replies
prisma/schema.prisma        accounts, jobs, applications
docker-compose.yml          PostgreSQL 16
```

Apply the schema after PostgreSQL is up:

```bash
npx prisma migrate dev
```
