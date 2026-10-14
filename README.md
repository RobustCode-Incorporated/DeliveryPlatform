# ROBUST DELIVERY PLATFORM (RDP)

ROBUST DELIVERY PLATFORM (RDP) is a multi-surface logistics product with a Spring Boot backend, a React web frontend, and a native Expo driver application.

> **Note:** the code for each surface now lives in its own dedicated repository ([RDP-Backend](https://github.com/RobustCode-Incorporated/RDP-Backend), [RDP-Frontend](https://github.com/RobustCode-Incorporated/RDP-Frontend), [RDP-Mobile](https://github.com/RobustCode-Incorporated/RDP-Mobile)). This repository is kept as the shared hub for cross-cutting docs, specs, local infrastructure (`docker/`), and operational scripts — it no longer carries a copy of the application source.

The current implementation is focused on three tracks:
- backend contracts and workflow rules for orders, deliveries, restaurants, and drivers;
- web workflows for admin, restaurant, and driver operations;
- a DRIVER-only mobile app aligned with the approved driver specification in [docs/mobile-driver-spec-v1.md](docs/mobile-driver-spec-v1.md).

## Workspace Structure

Each surface lives in its own dedicated repository; this repository holds cross-cutting documentation and local infrastructure only:

- [RDP-Backend](https://github.com/RobustCode-Incorporated/RDP-Backend): Spring Boot API, security, Flyway migrations, and delivery domain logic
- [RDP-Frontend](https://github.com/RobustCode-Incorporated/RDP-Frontend): Vite + React web application for admin, restaurant, and driver dashboards
- [RDP-Mobile](https://github.com/RobustCode-Incorporated/RDP-Mobile) (`driver-app/`): Expo React Native driver mobile app
- [docs](docs): roadmap, specification, and review artifacts
- [docker/docker-compose.yml](docker/docker-compose.yml): local infrastructure bootstrap
- [scripts](scripts): operational helper scripts (Render smoke check, mobile workflow reset)

## Tech Stack

### Backend
- Java 21
- Spring Boot 3.5
- Spring Security + JWT
- Spring Data JPA + Hibernate
- Flyway
- MySQL baseline support plus Neon PostgreSQL runtime profile

### Web Frontend
- React
- TypeScript
- Vite
- Vitest + Testing Library

### Mobile
- Expo SDK 57
- React Native 0.86
- Axios
- Expo SecureStore
- Jest + React Native Testing Library

## Current Status

### Backend
- JWT authentication is active for web and mobile clients.
- Driver delivery endpoints are live:
  - `GET /api/deliveries/me`
  - `PUT /api/deliveries/{id}/pickup`
  - `PUT /api/deliveries/{id}/start`
  - `PUT /api/deliveries/{id}/complete`
  - `PUT /api/deliveries/{id}/fail`
- PostgreSQL support for Neon is configured in [RDP-Backend/src/main/resources/application-neon.yaml](https://github.com/RobustCode-Incorporated/RDP-Backend/blob/main/src/main/resources/application-neon.yaml).
- Schema bootstrap and QA seed data are managed in [RDP-Backend/src/main/resources/db/migration-postgresql/V1__init_schema.sql](https://github.com/RobustCode-Incorporated/RDP-Backend/blob/main/src/main/resources/db/migration-postgresql/V1__init_schema.sql), [RDP-Backend/src/main/resources/db/migration-postgresql/V2__seed_test_accounts.sql](https://github.com/RobustCode-Incorporated/RDP-Backend/blob/main/src/main/resources/db/migration-postgresql/V2__seed_test_accounts.sql), and [RDP-Backend/src/main/resources/db/migration-postgresql/V3__seed_mobile_driver_workflow_data.sql](https://github.com/RobustCode-Incorporated/RDP-Backend/blob/main/src/main/resources/db/migration-postgresql/V3__seed_mobile_driver_workflow_data.sql).

### Web Frontend
- Admin, restaurant, and driver workflows are implemented.
- Shared authenticated shell, role-based redirects, async error boundary, and toast feedback are in place.
- Restaurant-to-driver lifecycle coverage exists in the web test suite.

### Mobile Driver App
- Spec baseline: [docs/mobile-driver-spec-v1.md](docs/mobile-driver-spec-v1.md)
- Review checklist: [docs/mobile-driver-spec-review-checklist-v1.md](docs/mobile-driver-spec-review-checklist-v1.md)
- Roadmap: [docs/mobile-development-roadmap.md](docs/mobile-development-roadmap.md)

Implemented today in the mobile app:
- driver login against the real backend auth API;
- role gate that allows only DRIVER sessions into the app workspace;
- secure session persistence with restore on app restart;
- assigned delivery list from `GET /api/deliveries/me`;
- delivery detail screen with pickup, start, complete, and fail actions;
- failure reason capture with quick reason chips and max-length guardrails;
- offline cache of the last successful list response;
- queued offline transition actions with replay on refresh and app resume;
- blocked action visibility plus manual retry and discard actions;
- per-delivery blocked action recovery guidance with refresh, retry, and discard actions in the detail flow;
- pull-to-refresh and cache freshness messaging;
- focused Jest coverage for queue logic, sync freshness, and failure-detail behavior;
- live seeded workflow data in Neon for `driver@test.com` with mobile-visible deliveries in `ASSIGNED`, `PICKED_UP`, and `IN_TRANSIT` states;
- repeatable workflow reset helper at [scripts/reset-mobile-driver-workflow.sh](scripts/reset-mobile-driver-workflow.sh) for manual QA preparation.

Still pending on the mobile track:
- telemetry events from the approved spec;
- full QA evidence for AC-DM-001 through AC-DM-042;
- integration and end-to-end workflow automation;
- localization extraction for all user-facing strings;
- optional order-history enhancement.

## Mobile Spec Audit Summary

The current app matches these major areas of the approved driver spec:
- authentication and DRIVER-only role gate;
- delivery list and detail navigation;
- workflow transitions and fail flow;
- offline cache and persisted pending queue;
- retry and blocked-action handling;
- secure token storage.

The current app partially covers or still lacks these spec areas:
- telemetry events are not yet emitted;
- accessibility and localization are not yet fully formalized as release evidence;
- full integration and end-to-end acceptance coverage is still pending.

## Validation Snapshot

Recent successful checks include:
- `mvn -q -DskipTests compile` in [RDP-Backend](https://github.com/RobustCode-Incorporated/RDP-Backend)
- `npm run build` and `npm run test` in [RDP-Frontend](https://github.com/RobustCode-Incorporated/RDP-Frontend)
- `npx tsc --noEmit` in [RDP-Mobile](https://github.com/RobustCode-Incorporated/RDP-Mobile)'s `driver-app/`
- `npm test -- --runInBand` in [RDP-Mobile](https://github.com/RobustCode-Incorporated/RDP-Mobile)'s `driver-app/`
- live login verification for seeded admin, restaurant, and driver accounts against the backend auth API

## Documents

- [docs/frontend-roadmap.md](docs/frontend-roadmap.md)
- [docs/mobile-driver-spec-v1.md](docs/mobile-driver-spec-v1.md)
- [docs/mobile-driver-spec-review-checklist-v1.md](docs/mobile-driver-spec-review-checklist-v1.md)
- [docs/mobile-development-roadmap.md](docs/mobile-development-roadmap.md)
- [docs/mobile-driver-qa-evidence-v1.md](docs/mobile-driver-qa-evidence-v1.md)

## Getting Started

### Backend
Clone [RDP-Backend](https://github.com/RobustCode-Incorporated/RDP-Backend), then from its root:

```bash
mvn -q -DskipTests compile
```

### Web Frontend
Clone [RDP-Frontend](https://github.com/RobustCode-Incorporated/RDP-Frontend), then from its root:

```bash
npm install
npm run dev
```

### Mobile Driver App
Clone [RDP-Mobile](https://github.com/RobustCode-Incorporated/RDP-Mobile), then from `driver-app/`:

```bash
npm install
npm start
```

For native builds:

```bash
npm run android
npm run ios
```

## Render Deployment

Backend and frontend deploy independently, each straight from its own repository, which already includes its own `render.yaml`:
- [RDP-Backend/render.yaml](https://github.com/RobustCode-Incorporated/RDP-Backend/blob/main/render.yaml) (Java web service, Spring profile `neon`)
- [RDP-Frontend/render.yaml](https://github.com/RobustCode-Incorporated/RDP-Frontend/blob/main/render.yaml) (static site for the Vite build output)

### Deploy with Blueprint

For each repository:

1. In Render, choose New + and select Blueprint.
2. Connect the repository and confirm its `render.yaml`.
3. Add backend secrets in Render:
   - `NEON_JDBC_URL`
   - `NEON_DB_USERNAME`
   - `NEON_DB_PASSWORD`
   - `APP_CORS_ALLOWED_ORIGINS` (set to the frontend's Render URL)
4. Set the frontend's `VITE_API_BASE_URL` to the backend's Render URL.
5. Trigger deploy.

### Environment Variables

Backend relies on:
- `PORT` (provided by Render)
- `APP_CORS_ALLOWED_ORIGINS`
- `NEON_JDBC_URL`
- `NEON_DB_USERNAME`
- `NEON_DB_PASSWORD`

Frontend relies on:
- `VITE_API_BASE_URL`

Reference templates:
- [RDP-Backend/.env.render.example](https://github.com/RobustCode-Incorporated/RDP-Backend/blob/main/.env.render.example)
- [RDP-Frontend/.env.example](https://github.com/RobustCode-Incorporated/RDP-Frontend/blob/main/.env.example)

### Manual Render Setup (Without Blueprint)

If you prefer manual service creation per repository:

- Backend service (from RDP-Backend):
  - Build command: `./mvnw clean package -DskipTests`
  - Start command: `java -Dspring.profiles.active=neon -jar target/robust-delivery-platform-0.0.1-SNAPSHOT.jar`
  - Add env vars listed above

- Frontend service (from RDP-Frontend):
  - Environment: Static Site
  - Build command: `npm install && npm run build`
  - Publish directory: `dist`
  - Set `VITE_API_BASE_URL` to backend public URL

### Post-Deploy Smoke Check

Run the built-in verification script after both Render services are live:

```bash
./scripts/render-smoke-check.sh <BACKEND_URL> <FRONTEND_URL>
```

Example:

```bash
./scripts/render-smoke-check.sh https://robust-delivery-platform-backend.onrender.com https://robust-delivery-platform-frontend.onrender.com
```

## Next Focus

The mobile work is now in hardening mode. The highest-value next items are:
- implement telemetry and acceptance-evidence coverage from the approved spec;
- capture the remaining manual QA evidence on iOS and Android with the resettable live seeded workflow data;
- add integration coverage around replay and unauthorized reset, then complete the remaining release-gate validation.
