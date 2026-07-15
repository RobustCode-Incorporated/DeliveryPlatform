# Mobile Driver QA Evidence v1

## Purpose

This document records the current QA evidence gathered against the approved driver mobile specification in [docs/mobile-driver-spec-v1.md](docs/mobile-driver-spec-v1.md).

It complements the implementation roadmap in [docs/mobile-development-roadmap.md](docs/mobile-development-roadmap.md).

## Evidence Date

- Date: 2026-07-15
- Environment: Neon PostgreSQL + backend `neon` profile + Android emulator `Pixel_10_Pro_XL`
- Driver account: `driver@test.com`

## Current Live Snapshot

Verified live on 2026-07-15:
- `POST /api/auth/login` succeeds for `driver@test.com`
- `GET /api/deliveries/me` returns 3 deliveries for the authenticated driver
- The Android app is installed and opens successfully on the emulator
- `./scripts/reset-mobile-driver-workflow.sh` successfully restored the seeded QA workflow state against Neon

Observed live delivery statuses at capture time:
- Delivery `#1`: `ASSIGNED`
- Delivery `#2`: `PICKED_UP`
- Delivery `#3`: `IN_TRANSIT`

Important note:
- The seeded mobile workflow dataset is mutable because live testing changes delivery states.
- The repository now includes a repeatable reset helper at [scripts/reset-mobile-driver-workflow.sh](scripts/reset-mobile-driver-workflow.sh).
- The helper restores the three canonical driver scenarios before each manual walkthrough.

## Reset Command

Use this before a fresh Android or iOS QA run:

```bash
NEON_JDBC_URL='jdbc:postgresql://<host>/<db>?sslmode=require&channelBinding=require' \
NEON_DB_USERNAME='<username>' \
NEON_DB_PASSWORD='<password>' \
./scripts/reset-mobile-driver-workflow.sh
```

The helper supports three execution paths:
- local `psql`, when installed;
- Docker `postgres:16`, when the Docker daemon is running;
- Maven + JDBC fallback through [RDP-backend/src/main/java/com/robustcode/delivery/tools/MobileWorkflowResetRunner.java](RDP-backend/src/main/java/com/robustcode/delivery/tools/MobileWorkflowResetRunner.java).

## Acceptance Criteria Evidence Matrix

### Authentication

- AC-DM-001
  - Status: VERIFIED
  - Evidence:
    - live backend login returned a JWT for `driver@test.com`
    - mobile app login flow is implemented and the Android build launches successfully

- AC-DM-002
  - Status: PARTIAL
  - Evidence:
    - code enforces `DRIVER` role gate in [RDP-mobile/driver-app/src/app/useDriverApp.ts](RDP-mobile/driver-app/src/app/useDriverApp.ts)
    - dedicated integration coverage for this branch is not yet stable in the current Expo/RNTL harness

### Delivery Loading

- AC-DM-010
  - Status: VERIFIED
  - Evidence:
    - live `GET /api/deliveries/me` returned 3 deliveries for the authenticated driver account

- AC-DM-011
  - Status: PARTIAL
  - Evidence:
    - retry and error UI paths exist in the app
    - manual QA capture for API failure mode is still pending

### Workflow Transitions

- AC-DM-020
  - Status: VERIFIED
  - Evidence:
    - Android walkthrough on 2026-07-15 transitioned delivery `#1` from `ASSIGNED` to `PICKED_UP`
    - UI evidence: [docs/qa/pickup-confirmed.png](docs/qa/pickup-confirmed.png)
    - backend evidence: `GET /api/deliveries/me` returned delivery `#1` in `PICKED_UP`

- AC-DM-021
  - Status: VERIFIED
  - Evidence:
    - Android walkthrough on 2026-07-15 transitioned delivery `#2` from `PICKED_UP` to `IN_TRANSIT`
    - UI evidence: [docs/qa/walk2-delivery2-after-start.png](docs/qa/walk2-delivery2-after-start.png)
    - backend evidence: `GET /api/deliveries/me` progressed delivery `#2` before completion

- AC-DM-022
  - Status: VERIFIED
  - Evidence:
    - Android walkthrough on 2026-07-15 transitioned delivery `#2` from `IN_TRANSIT` to `DELIVERED`
    - UI evidence: [docs/qa/walk2-delivery2-after-complete.png](docs/qa/walk2-delivery2-after-complete.png)
    - backend evidence: `GET /api/deliveries/me` returned delivery `#2` in `DELIVERED`

### Failure Reporting

- AC-DM-030
  - Status: VERIFIED
  - Evidence:
    - Android walkthrough on 2026-07-15 transitioned delivery `#3` from `IN_TRANSIT` to `CANCELLED`
    - quick reason chip `Client absent` was used
    - UI evidence: [docs/qa/walk4-delivery3-after-fail.png](docs/qa/walk4-delivery3-after-fail.png)
    - backend evidence: `GET /api/deliveries/me` returned delivery `#3` in `CANCELLED` with appended reason

- AC-DM-031
  - Status: VERIFIED
  - Evidence:
    - validation exists in [RDP-mobile/driver-app/src/screens/DeliveryDetailScreen.tsx](RDP-mobile/driver-app/src/screens/DeliveryDetailScreen.tsx)
    - automated coverage exists in [RDP-mobile/driver-app/src/screens/DeliveryDetailScreen.test.tsx](RDP-mobile/driver-app/src/screens/DeliveryDetailScreen.test.tsx)

### Offline and Queue

- AC-DM-040
  - Status: VERIFIED_BY_IMPLEMENTATION
  - Evidence:
    - cached delivery fallback exists in [RDP-mobile/driver-app/src/app/useDriverApp.ts](RDP-mobile/driver-app/src/app/useDriverApp.ts)
    - stale/fresh messaging exists in [RDP-mobile/driver-app/src/app/syncStatus.ts](RDP-mobile/driver-app/src/app/syncStatus.ts)

- AC-DM-041
  - Status: VERIFIED_BY_IMPLEMENTATION
  - Evidence:
    - offline queue creation and local optimistic patching exist in [RDP-mobile/driver-app/src/app/useDriverApp.ts](RDP-mobile/driver-app/src/app/useDriverApp.ts)

- AC-DM-042
  - Status: PARTIAL
  - Evidence:
    - FIFO replay exists
    - exponential backoff scheduling exists
    - blocked conflict and failed-action recovery UI exists
    - repeatable manual proof still needs a controlled offline/online test pass

## Automated Evidence Snapshot

Passing focused mobile tests:
- [RDP-mobile/driver-app/src/app/offlineQueue.test.ts](RDP-mobile/driver-app/src/app/offlineQueue.test.ts)
- [RDP-mobile/driver-app/src/app/syncStatus.test.ts](RDP-mobile/driver-app/src/app/syncStatus.test.ts)
- [RDP-mobile/driver-app/src/screens/DeliveryDetailScreen.test.tsx](RDP-mobile/driver-app/src/screens/DeliveryDetailScreen.test.tsx)
- [RDP-mobile/driver-app/src/app/useDriverApp.integration.test.tsx](RDP-mobile/driver-app/src/app/useDriverApp.integration.test.tsx)

Integration coverage added on 2026-07-15:
- unauthorized session reset path via `triggerUnauthorizedHandlerForTests`
- queued replay path validating `startDelivery` replay and queue cleanup

## Android Walkthrough Artifacts (2026-07-15)

- list before transitions: [docs/qa/walk2-list-initial.png](docs/qa/walk2-list-initial.png)
- start flow pre-state (`#2`): [docs/qa/walk2-delivery2-before-start.png](docs/qa/walk2-delivery2-before-start.png)
- start flow result (`#2`): [docs/qa/walk2-delivery2-after-start.png](docs/qa/walk2-delivery2-after-start.png)
- complete flow result (`#2`): [docs/qa/walk2-delivery2-after-complete.png](docs/qa/walk2-delivery2-after-complete.png)
- fail flow pre-state (`#3`): [docs/qa/walk4-delivery3-before-fail.png](docs/qa/walk4-delivery3-before-fail.png)
- fail flow result (`#3`): [docs/qa/walk4-delivery3-after-fail.png](docs/qa/walk4-delivery3-after-fail.png)

## Gaps Remaining

- capture a controlled offline replay scenario for AC-DM-042
- continue expanding integration coverage for replay conflict branches and role-mismatch UX

Update:
- the repeatable live dataset gap is addressed by the reset helper and transition walkthrough evidence is now captured.

## Recommended Next QA Move

The next best QA step is:
- run [scripts/reset-mobile-driver-workflow.sh](scripts/reset-mobile-driver-workflow.sh);
- execute a controlled offline/online replay scenario to close AC-DM-042 manual proof.