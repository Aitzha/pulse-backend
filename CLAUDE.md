# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run start:dev          # watch-mode dev server (preferred during development)
npm run start              # run once without watch
npm run start:prod         # run compiled output from dist/
npm run build              # nest build → dist/
npm run lint               # eslint --fix across src/, apps/, libs/, test/
npm run format             # prettier write on src/ and test/

npm test                   # jest, matches src/**/*.spec.ts
npm run test:watch
npm run test:cov
npm run test:e2e           # uses test/jest-e2e.json

# Run a single test file or match by name
npx jest src/auth/auth.service.spec.ts
npx jest -t "login returns accessToken"
```

Required env vars (see `.env.example`): `MONGODB_URI`, `JWT_SECRET`, `PORT` (defaults to 3001).

## Architecture

NestJS 11 + Mongoose (MongoDB) + Passport JWT. The app boots in `src/main.ts`, which sets a global `/api` prefix, a global `ValidationPipe({ whitelist: true, transform: true })` (so DTOs strip unknown fields and auto-coerce types), and CORS restricted to `http://localhost:3000`.

`AppModule` wires a global `ConfigModule` and a `MongooseModule.forRootAsync` that reads `MONGODB_URI` from config. Feature modules (`auth`, `users`, `finances`, `activities`) each follow the standard NestJS layout: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `schemas/*.schema.ts`, `dto/*.dto.ts`. Feature modules register their Mongoose models via `MongooseModule.forFeature([...])` in their own module file.

### Auth model — stateless, no sessions

Authentication is **JWT-only**. There is no session store, no cookies, no refresh token, and no logout endpoint. Do not add session middleware without discussing — the intent is a stateless API.

- `POST /api/auth/register` and `POST /api/auth/login` both return `{ accessToken }`. Tokens are signed with `JWT_SECRET` and expire in **7 days** (configured in `src/auth/auth.module.ts`).
- Passwords are hashed with `bcrypt` (10 rounds) in `AuthService`.
- `JwtStrategy` (`src/auth/strategies/jwt.strategy.ts`) extracts `Authorization: Bearer <token>` and its `validate()` returns `{ userId, username }`, which becomes `req.user` on guarded routes.
- Protected routes opt in with `@UseGuards(JwtAuthGuard)` (see `src/activities/activities.controller.ts`, `src/finances/finances.controller.ts`). The guard is typically applied at the controller level so every route below it requires a valid bearer token.
- `JwtStrategy` has a fallback secret (`'default-secret'`) if `JWT_SECRET` is unset — real deployments must set it.

### Module wiring gotchas

- `UsersModule` exports `UsersService` so `AuthModule` can inject it. Other modules that need user lookups should import `UsersModule`, not re-declare the model.
- The project is **ES modules / NodeNext** (`tsconfig.json` → `"module": "nodenext"`). Relative imports in `.ts` files must use the `.js` extension, e.g. `import { AppModule } from './app.module.js';`. This is intentional — don't "fix" the `.js` extensions.
- Jest uses `rootDir: src` and discovers `*.spec.ts`; coverage is written to `../coverage` (repo root).

### README

The `README.md` is the unmodified NestJS starter template — it does not describe this project. Rely on this file and the source instead.
