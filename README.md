# my-miro

Production-grade collaborative whiteboard app (Miro-like) built for web.

## Product Scope (v1)

- Infinite canvas
- Shapes, connectors, text, sticky-note-like elements, images
- Real-time multi-user editing
- Presence (live cursors, selection/awareness)
- Permissions (workspace/board roles)
- Board version history
- Email auth + SSO (Google, Microsoft, GitHub)
- GDPR baseline compliance

## Confirmed Tech Stack

- Frontend: `Next.js` + `TypeScript` + `React` + `Tailwind`
- Canvas/editor: `tldraw`
- Realtime collaboration: `Yjs` + `Hocuspocus` (WebSocket)
- Backend API: `NestJS`
- Database: `PostgreSQL` + `Prisma`
- Cache/pubsub: `Redis`
- Auth: `Auth.js` (email + OAuth providers)
- File storage: `Google Cloud Storage`
- Hosting: `GCP` (`Cloud Run`, `Cloud SQL`, `Memorystore`, `GCS`)
- Observability: `Sentry` + OpenTelemetry + GCP Logging/Monitoring
- Testing: `Vitest`, `Playwright`, integration tests

## High-Level Architecture

1. `apps/web` (Next.js)
- UI, auth flows, board shell, editor integration (`tldraw`)
- Connects to API for metadata/permissions/history
- Connects to realtime service for CRDT sync + presence

2. `apps/api` (NestJS)
- Workspaces, boards, permissions, membership, history endpoints
- Auth/session validation and role enforcement
- Issues signed URLs for image upload/download to GCS

3. `apps/realtime` (Hocuspocus + Yjs)
- WebSocket room per board
- Presence awareness channel (cursor, selection, user status)
- CRDT document sync and conflict-free merges
- Persist Yjs state snapshots + incremental updates

4. `apps/worker` (NestJS worker or lightweight Node worker)
- Version snapshot compaction
- Async jobs (cleanup, exports later, audit/event processing)

5. Shared packages
- `packages/contracts` (API/realtime DTOs and shared types)
- `packages/auth` (provider config/session helpers)
- `packages/config` (env/config schema)

## Core Data Model (Initial)

- `users`: id, email, profile, created_at
- `workspaces`: id, name, owner_id, created_at
- `workspace_members`: workspace_id, user_id, role
- `boards`: id, workspace_id, title, created_by, created_at, updated_at
- `board_members`: board_id, user_id, role (owner/editor/commenter/viewer)
- `board_assets`: id, board_id, storage_path, mime, size, uploaded_by
- `board_versions`: id, board_id, version_no, snapshot_ref, created_by, created_at
- `board_events` (optional early): append-only activity/audit trail

## Realtime + Versioning Strategy

- Single Yjs doc per board room.
- Hocuspocus handles client sync and awareness.
- Persist Yjs updates to durable storage with periodic full snapshots.
- Create board version checkpoints:
  - Manual version save (user action)
  - Automatic interval/checkpoint on meaningful changes
- Restore flow:
  - Load nearest snapshot + replay updates to target version.

## Security and GDPR Baseline

- EU region resources on GCP for primary data residency.
- Encrypted transport (HTTPS/WSS) and managed at-rest encryption.
- Role-based access checks on every board/workspace action.
- Data subject support:
  - account deletion
  - personal data export
  - board ownership transfer edge case handling
- Auditability for permission and membership changes.

## Performance Targets

- Up to ~12 concurrent active users on a board.
- Up to ~10,000 overall users.
- Initial SLO goals:
  - p95 board load: < 2.5s on typical network
  - p95 realtime update fanout: < 250ms in-region

## Phased Build Plan (Agent-Friendly)

### Phase 0: Foundation

- Monorepo setup and app/package boundaries
- Shared linting, formatting, type checks, CI
- Local Docker stack (Postgres + Redis)
- GCP project/environment baseline

### Phase 1: Identity + Workspace + Board Shell

- Auth.js email + OAuth (Google/Microsoft/GitHub)
- User/workspace/board CRUD
- Role model and access middleware
- Basic board listing and board creation UI

### Phase 2: Realtime Board MVP

- `tldraw` board integration
- Yjs/Hocuspocus syncing
- Presence (cursor + user presence chips)
- Initial persistence of board doc state

### Phase 3: Permissions + Assets + Version History

- Board-level permissions and sharing flows
- GCS uploads for images
- Version snapshoting and restore APIs/UI

### Phase 4: Hardening for Production

- Observability and alerting
- Load/perf validation
- Security checks and GDPR workflows
- Backups, migration discipline, runbooks

## Immediate Next Sprint (Start Here)

1. Bootstrap monorepo structure (`apps/*`, `packages/*`).
2. Implement auth + user/workspace/board schema with Prisma.
3. Build API endpoints for board CRUD + role enforcement.
4. Create web shell: login, workspace switcher, board list, open board page.
5. Stand up realtime service skeleton and connect a board room.

## Current implementation status (April 14, 2026)

- Monorepo scaffolding complete with:
  - `apps/web` (Next.js app router shell)
  - `apps/api` (NestJS API baseline)
  - `apps/realtime` (Hocuspocus + Yjs server skeleton)
  - `apps/worker` (background worker skeleton)
  - `packages/contracts`, `packages/auth`, `packages/config`
- Prisma schema created for:
  - `users`, `workspaces`, `workspace_members`
  - `boards`, `board_members`, `board_assets`, `board_versions`
- API endpoints implemented:
  - `GET /health`
  - `POST /auth/register`
  - `POST /auth/login`
  - `GET /auth/me`
  - `GET /workspaces`
  - `POST /workspaces`
  - `GET /workspaces/:workspaceId/boards`
  - `POST /workspaces/:workspaceId/boards`
  - `GET /boards/:boardId`
- Web shell implemented:
  - Workspace list + create flow on `/`
  - Board list + create flow on `/workspaces/:workspaceId`
  - Board page shell on `/workspaces/:workspaceId/boards/:boardId`
- Realtime implemented:
  - Hocuspocus server with one Yjs document per board room
  - In-memory persistence abstraction (`apps/realtime/src/persistence.ts`) ready to swap with durable storage

## Authentication and Authorization (Current)

- Auth method: email/password with JWT access token.
- Session handling in web: HTTP-only cookie set by `/api/auth/login` and `/api/auth/register`.
- Protected API routes require `Authorization: Bearer <token>`.
- Workspace/board authorization:
  - workspace listing and board listing require workspace membership
  - board creation requires workspace role `OWNER` or `ADMIN`

## Local setup

1. Install dependencies:
   - `npm install`
2. Copy env file and adjust values:
   - `cp .env.example .env`
3. Start local infrastructure and app services in Docker:
   - `npm run docker:up`
4. Run Prisma generate and migrations:
   - `npm run prisma:generate`
   - `npm run prisma:migrate -- --name init`
5. If you prefer running app services on host instead of Docker, start them in separate terminals:
   - API: `npm run dev:api`
   - Realtime: `npm run dev:realtime`
   - Web: `npm run dev:web`
   - Worker (optional now): `npm run dev:worker`
6. Open web app and create account:
   - `http://localhost:3003`

## Local Docker commands

- Start full stack (Postgres + Redis + web + api + realtime + worker):
  - `npm run docker:up`
- Install/update container dependencies only:
  - `npm run docker:deps`
- Run Prisma schema sync against Docker Postgres:
  - `npm run docker:migrate`
- Start only infrastructure (Postgres + Redis):
  - `npm run docker:up:infra`
- Start only app services (expects infra running):
  - `npm run docker:up:app`
- Stream all container logs:
  - `npm run docker:logs`
- Stream infra logs only:
  - `npm run docker:logs:infra`
- Stream app logs only:
  - `npm run docker:logs:app`
- Stop containers:
  - `npm run docker:down`
- Stop and remove volumes (full local reset):
  - `npm run docker:down:volumes`

### Port conflicts

- Web container host port defaults to `3003` to avoid common local Next.js conflicts on `3000`.
- If `3003` is also in use, set another host port for web:
  - `WEB_PORT=3010 npm run docker:up`
- Then open:
  - `http://localhost:3010`
- Backend API host port is configurable via `API_PORT` (default `3002`).
- Docker startup runs Prisma schema sync automatically before app services start.

## Verification

- Type checks pass across all workspaces:
  - `npm run typecheck`

## Codex skills workflow

- Use the repo-local guide: [docs/CODEX_SKILLS.md](/Users/nursultanakhmetzhanov/Documents/personal_projects/my-miro/docs/CODEX_SKILLS.md)
- Recommended sequence for feature work:
  - `$plan` -> `$build` -> `$tests` -> `$review` -> `$docs`
