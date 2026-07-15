# Mobile Development Roadmap

## Purpose

This roadmap translates the approved driver mobile specification in [docs/mobile-driver-spec-v1.md](docs/mobile-driver-spec-v1.md) into an implementation-tracking document for the current Expo app in [RDP-mobile/driver-app](RDP-mobile/driver-app).

Status legend:
- DONE: implemented and validated in the current codebase
- IN PROGRESS: partially implemented, but still missing release-grade behavior or evidence
- TODO: not implemented yet

## Current Snapshot

### Implemented now
- DONE: login against `POST /api/auth/login`
- DONE: DRIVER-only role gate
- DONE: secure session persistence and restore
- DONE: delivery list from `GET /api/deliveries/me`
- DONE: delivery detail screen
- DONE: pickup, start, complete, and fail actions
- DONE: failure reason validation and quick reason chips
- DONE: offline cache for the latest successful delivery payload
- DONE: persisted offline action queue
- DONE: replay attempts on refresh and app resume
- DONE: blocked queue visibility with retry and discard controls
- DONE: pull-to-refresh
- DONE: focused unit and screen tests for queue logic and failure UX

### Partially complete
- DONE: queue retry strategy is bounded and now uses exponential backoff scheduling
- DONE: conflict handling now exposes per-delivery recovery guidance with refresh, retry, and discard actions
- IN PROGRESS: failure and offline UX exists, but acceptance-criteria evidence is incomplete
- IN PROGRESS: accessibility has baseline control semantics, but no formal audit or checklist evidence yet

### Not implemented yet
- TODO: telemetry events from the approved spec
- TODO: localization-ready externalized strings
- TODO: integration tests for login, list load, transitions, and offline replay
- TODO: end-to-end happy-path and failure-path mobile validation
- TODO: optional order history enhancement via `GET /api/orders/{id}/history`

## Spec-to-Implementation Matrix

### Phase M1: Core Driver Workflow
Status: DONE

Scope:
- auth and role gate
- session restore
- delivery list
- delivery detail
- online delivery transitions

Evidence in code:
- [RDP-mobile/driver-app/src/api/auth.ts](RDP-mobile/driver-app/src/api/auth.ts)
- [RDP-mobile/driver-app/src/api/driver.ts](RDP-mobile/driver-app/src/api/driver.ts)
- [RDP-mobile/driver-app/src/app/useDriverApp.ts](RDP-mobile/driver-app/src/app/useDriverApp.ts)
- [RDP-mobile/driver-app/src/screens/LoginScreen.tsx](RDP-mobile/driver-app/src/screens/LoginScreen.tsx)
- [RDP-mobile/driver-app/src/screens/DeliveryListScreen.tsx](RDP-mobile/driver-app/src/screens/DeliveryListScreen.tsx)
- [RDP-mobile/driver-app/src/screens/DeliveryDetailScreen.tsx](RDP-mobile/driver-app/src/screens/DeliveryDetailScreen.tsx)

### Phase M2: Offline Continuity and Queue Safety
Status: IN PROGRESS

Completed in this phase:
- cached list persistence
- pending action persistence
- replay on refresh and app resume
- blocked action warning state
- manual retry and discard
- stale cache messaging

Remaining in this phase:
- richer state merge evidence per acceptance criteria

Evidence in code:
- [RDP-mobile/driver-app/src/app/useDriverApp.ts](RDP-mobile/driver-app/src/app/useDriverApp.ts)
- [RDP-mobile/driver-app/src/app/offlineQueue.ts](RDP-mobile/driver-app/src/app/offlineQueue.ts)
- [RDP-mobile/driver-app/src/app/syncStatus.ts](RDP-mobile/driver-app/src/app/syncStatus.ts)
- [RDP-mobile/driver-app/src/lib/session.ts](RDP-mobile/driver-app/src/lib/session.ts)

### Phase M3: Hardening and Release Evidence
Status: TODO

Scope:
- telemetry
- integration coverage
- end-to-end flow coverage
- release-gate evidence for AC-DM-001..042
- accessibility review
- localization readiness

## Acceptance-Criteria Tracking

### Authentication
- AC-DM-001: DONE
- AC-DM-002: IN PROGRESS
  - Role blocking exists, but the dedicated role-mismatch experience is still basic.

### Delivery Loading
- AC-DM-010: DONE
- AC-DM-011: DONE

### Workflow Transitions
- AC-DM-020: DONE
- AC-DM-021: DONE
- AC-DM-022: DONE

### Failure Reporting
- AC-DM-030: DONE
- AC-DM-031: DONE

### Offline and Queue
- AC-DM-040: DONE
- AC-DM-041: DONE
- AC-DM-042: IN PROGRESS
  - FIFO replay and exponential backoff now exist, but full release-grade evidence is still incomplete.

## Test Coverage Snapshot

Current passing tests:
- [RDP-mobile/driver-app/src/app/offlineQueue.test.ts](RDP-mobile/driver-app/src/app/offlineQueue.test.ts)
- [RDP-mobile/driver-app/src/app/syncStatus.test.ts](RDP-mobile/driver-app/src/app/syncStatus.test.ts)
- [RDP-mobile/driver-app/src/screens/DeliveryDetailScreen.test.tsx](RDP-mobile/driver-app/src/screens/DeliveryDetailScreen.test.tsx)
- [RDP-mobile/driver-app/src/app/useDriverApp.integration.test.tsx](RDP-mobile/driver-app/src/app/useDriverApp.integration.test.tsx)

QA evidence tracker:
- [docs/mobile-driver-qa-evidence-v1.md](docs/mobile-driver-qa-evidence-v1.md)

Recommended next tests:
- integration coverage for replay conflict branches and manual retry/discard outcomes
- end-to-end smoke flow on Android using the seeded driver account

## Recommended Next Iterations

### Iteration 1
- DONE: add seeded deliveries and orders in Neon for driver workflow testing
- DONE: add a repeatable workflow reset helper in [scripts/reset-mobile-driver-workflow.sh](scripts/reset-mobile-driver-workflow.sh)
- DONE: verify the full happy path manually on Android for pickup/start/complete/fail transitions
- DONE: capture QA evidence against AC-DM-001, AC-DM-010, AC-DM-020, AC-DM-021, AC-DM-022, and AC-DM-030

### Iteration 2
- DONE: implement queue replay backoff
- DONE: improve conflict UX with explicit recovery guidance
- DONE: add integration coverage around replay and unauthorized reset in [RDP-mobile/driver-app/src/app/useDriverApp.integration.test.tsx](RDP-mobile/driver-app/src/app/useDriverApp.integration.test.tsx)

### Iteration 3
- add telemetry hooks
- externalize user-facing strings
- perform accessibility and release-gate review

## Exit Criteria for Mobile v1

Mobile v1 should be considered release-ready only when all of the following are true:
- all non-negotiable requirements in [docs/mobile-driver-spec-v1.md](docs/mobile-driver-spec-v1.md) are satisfied;
- AC-DM-001 through AC-DM-042 have explicit evidence;
- offline replay behavior is bounded, conflict-safe, and user-visible;
- seeded backend data allows repeatable manual validation, now supported by [scripts/reset-mobile-driver-workflow.sh](scripts/reset-mobile-driver-workflow.sh);
- the app passes TypeScript checks and mobile test suite validation.

## Live Progress Notes

- 2026-07-15: PostgreSQL migration V3 seeded realistic mobile workflow data in Neon.
- 2026-07-15: Live backend verification returned three deliveries for `driver@test.com` in `ASSIGNED`, `PICKED_UP`, and `IN_TRANSIT` states.
- 2026-07-15: Android build/install completed successfully on the `Pixel_10_Pro_XL` emulator against the live backend.
- 2026-07-15: Offline queue replay now uses exponential backoff scheduling and passing Jest coverage.
- 2026-07-15: Blocked queued actions now expose per-delivery recovery guidance and actions in the mobile UI.
- 2026-07-15: QA evidence tracking started in [docs/mobile-driver-qa-evidence-v1.md](docs/mobile-driver-qa-evidence-v1.md) using the live Neon dataset.
- 2026-07-15: Added [scripts/reset-mobile-driver-workflow.sh](scripts/reset-mobile-driver-workflow.sh) plus [scripts/reset-mobile-driver-workflow.sql](scripts/reset-mobile-driver-workflow.sql) to restore the mixed-state QA dataset on demand.
- 2026-07-15: Live backend verification again returned `ASSIGNED`, `PICKED_UP`, and `IN_TRANSIT` deliveries for `driver@test.com` after running the reset helper.
- 2026-07-15: Clean Android walkthrough captured transition evidence for pickup (`#1`), start+complete (`#2`), and fail (`#3`) with artifacts under [docs/qa](docs/qa).
- 2026-07-15: Added [RDP-mobile/driver-app/src/app/useDriverApp.integration.test.tsx](RDP-mobile/driver-app/src/app/useDriverApp.integration.test.tsx) covering unauthorized session reset and queued replay cleanup.
