# Mobile Development Roadmap

## Purpose

This roadmap translates the approved driver mobile specification in [docs/mobile-driver-spec-v1.md](docs/mobile-driver-spec-v1.md) into an implementation-tracking document for the current Expo app in [mobile/driver-app](mobile/driver-app).

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
- IN PROGRESS: queue retry strategy is bounded, but exponential backoff is not yet implemented
- IN PROGRESS: conflict handling marks actions as conflicted, but the recovery UX can be clearer
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
- [mobile/driver-app/src/api/auth.ts](mobile/driver-app/src/api/auth.ts)
- [mobile/driver-app/src/api/driver.ts](mobile/driver-app/src/api/driver.ts)
- [mobile/driver-app/src/app/useDriverApp.ts](mobile/driver-app/src/app/useDriverApp.ts)
- [mobile/driver-app/src/screens/LoginScreen.tsx](mobile/driver-app/src/screens/LoginScreen.tsx)
- [mobile/driver-app/src/screens/DeliveryListScreen.tsx](mobile/driver-app/src/screens/DeliveryListScreen.tsx)
- [mobile/driver-app/src/screens/DeliveryDetailScreen.tsx](mobile/driver-app/src/screens/DeliveryDetailScreen.tsx)

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
- exponential backoff policy
- stronger conflict-recovery UX copy and flows
- richer state merge evidence per acceptance criteria

Evidence in code:
- [mobile/driver-app/src/app/useDriverApp.ts](mobile/driver-app/src/app/useDriverApp.ts)
- [mobile/driver-app/src/app/offlineQueue.ts](mobile/driver-app/src/app/offlineQueue.ts)
- [mobile/driver-app/src/app/syncStatus.ts](mobile/driver-app/src/app/syncStatus.ts)
- [mobile/driver-app/src/lib/session.ts](mobile/driver-app/src/lib/session.ts)

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
  - FIFO replay exists, but full release-grade evidence and backoff behavior are still incomplete.

## Test Coverage Snapshot

Current passing tests:
- [mobile/driver-app/src/app/offlineQueue.test.ts](mobile/driver-app/src/app/offlineQueue.test.ts)
- [mobile/driver-app/src/app/syncStatus.test.ts](mobile/driver-app/src/app/syncStatus.test.ts)
- [mobile/driver-app/src/screens/DeliveryDetailScreen.test.tsx](mobile/driver-app/src/screens/DeliveryDetailScreen.test.tsx)

Recommended next tests:
- integration coverage for login to list load
- integration coverage for offline queue creation and replay
- integration coverage for unauthorized-session reset on 401
- end-to-end smoke flow on Android using the seeded driver account

## Recommended Next Iterations

### Iteration 1
- add seeded deliveries and orders in Neon for driver workflow testing
- verify the full happy path manually on Android and iOS
- capture QA evidence against AC-DM-001, AC-DM-010, AC-DM-020, AC-DM-021, AC-DM-022, and AC-DM-030

### Iteration 2
- implement queue replay backoff
- improve conflict UX with explicit recovery guidance
- add integration coverage around replay and unauthorized reset

### Iteration 3
- add telemetry hooks
- externalize user-facing strings
- perform accessibility and release-gate review

## Exit Criteria for Mobile v1

Mobile v1 should be considered release-ready only when all of the following are true:
- all non-negotiable requirements in [docs/mobile-driver-spec-v1.md](docs/mobile-driver-spec-v1.md) are satisfied;
- AC-DM-001 through AC-DM-042 have explicit evidence;
- offline replay behavior is bounded, conflict-safe, and user-visible;
- seeded backend data allows repeatable manual validation;
- the app passes TypeScript checks and mobile test suite validation.
