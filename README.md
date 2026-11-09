# Pokédex 2026

[![Tests](https://github.com/gianceliberti/pokedex-2026/actions/workflows/tests.yml/badge.svg)](https://github.com/gianceliberti/pokedex-2026/actions/workflows/tests.yml)

A Pokédex web app plus a small trainers REST API backed by PostgreSQL, with 32 automated
tests across the API and the frontend. The Pokédex is deployed as a static site on Cloudflare Workers.

**Live demo:** [pokedex-2026.gctest.workers.dev](https://pokedex-2026.gctest.workers.dev/)

Built by **Gianfranco Celiberti**, QA Engineer · [LinkedIn](https://www.linkedin.com/in/gianfrancoceliberti/)

## What's in the repo

| Folder | What it is | Stack |
|--------|------------|-------|
| [`pokedex/`](pokedex/) | Pokédex frontend: search, gallery, evolutions, stat comparison, competitive sets | Vanilla JS, Bootstrap, [PokeAPI](https://pokeapi.co) |
| [`api/`](api/) | Trainers REST API with full CRUD and input validation | Node.js, Express, PostgreSQL (Docker) |
| [`trainers_app/`](trainers_app/) | Frontend that manages trainers through the API | HTML, Bootstrap, JS |

## Pokédex features

- Search with a custom autocomplete, plus previous/next navigation
- Pokémon card with base stats, evolution chain, cry sound and shiny toggle
- Browse gallery with numbered pagination
- Stat comparison against another Pokémon
- Competitive sets for singles and doubles (Smogon data via [data.pkmn.cc](https://data.pkmn.cc))
- Light and dark mode; the panel takes the colour of the Pokémon's type

## Trainers API

| Method | Endpoint | Result |
|--------|----------|--------|
| `GET` | `/api/trainers` | List all trainers |
| `GET` | `/api/trainers/:id` | One trainer |
| `POST` | `/api/trainers` | Create a trainer · `400` if `name` is missing |
| `PUT` | `/api/trainers/:id` | Update a trainer · `404` if it doesn't exist |
| `DELETE` | `/api/trainers/:id` | Delete a trainer · `404` if it doesn't exist |

PostgreSQL runs in Docker; the table is created and seeded on first start (`api/db/init.sql`).

## Testing

32 tests with [Jest](https://jestjs.io/), all runnable without a database or network:

- **API, HTTP layer (8):** [Supertest](https://github.com/ladjs/supertest) against the Express app with the database mocked. Covers status codes, payloads, validation (`400`) and not-found cases (`404`) for every endpoint.
- **API, service layer (8):** each service function against a mocked `pg` pool, including validation that rejects bad input before touching the database.
- **Frontend helpers (16):** pure functions tested in jsdom: pagination with ellipses, evolution chains (linear and branched), stat totals, URL parsing.

```bash
cd api && npm install && npm test
cd pokedex && npm install && npm test
```

## Running locally

**Pokédex** → http://localhost:3000

```bash
cd pokedex
npm install
npm start
```

**Trainers API** → http://localhost:3001/api/trainers

```bash
cd api
docker compose up -d     # PostgreSQL on port 5432
npm install
npm start
```

Default database settings match `docker-compose.yml`; copy `.env.example` to `.env` to override them.

**Trainers frontend** → http://localhost:4000 (needs the API running)

```bash
cd trainers_app
npm install
node app.js
```

## Deployment

`wrangler.jsonc` serves `pokedex/public` as static assets on Cloudflare Workers. The frontend calls
PokeAPI directly from the browser, so no server is needed in production.
