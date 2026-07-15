# Driver Mobile App Specification v1

## 1. Document metadata
- Product: ROBUST DELIVERY PLATFORM (RDP) - Driver mobile app
- Version: v1.0
- Date: 2026-07-15
- Status: Approved v1 (Frozen)
- Authoring basis: current backend contracts and implemented web workflow

## 1.1 Approval and freeze policy
- Approval state: APPROVED_V1
- Freeze date: 2026-07-15
- Change control:
  - Any modification to non-negotiable requirements requires a version bump to v1.1 or higher.
  - Minor editorial clarifications may be made without changing behavior.
  - Scope additions are deferred to post-v1 backlog unless explicitly re-approved.

## 2. Purpose
This specification defines the first full mobile scope for drivers so they can:
- authenticate with their driver account;
- view assigned deliveries;
- execute delivery state transitions;
- report delivery failure reasons;
- continue working with unstable network conditions.

## 3. Actors and roles
- Primary actor: DRIVER (mobile app user)
- Supporting actor: ADMIN or DISPATCHER (assigns delivery outside mobile app)
- Supporting actor: RESTAURANT (prepares orders before pickup)

Note:
The mobile app in this phase is DRIVER-only. Admin and restaurant operations are out of scope for app UI.

## 4. In-scope and out-of-scope
### In-scope (v1)
- Login with email/password
- JWT session persistence on device
- Assigned delivery list for authenticated driver
- Delivery detail view
- Delivery transitions:
  - ASSIGNED -> PICKED_UP
  - PICKED_UP -> IN_TRANSIT
  - IN_TRANSIT -> DELIVERED
- Failure workflow from ASSIGNED, PICKED_UP, or IN_TRANSIT -> CANCELLED
- Failure reason capture and submission
- Basic status timeline rendering from delivery timestamps and status
- Pull-to-refresh and manual retry
- Offline cache of last successful delivery list
- Deferred action queue for offline transition attempts
- Error feedback and success notifications

### Out-of-scope (v1)
- Route optimization and turn-by-turn navigation engine
- Real-time GPS streaming to backend
- In-app chat with customer or restaurant
- Payments and proof-of-delivery media upload
- Multi-stop batch route optimization

## 5. Backend contract baseline (current)
### Auth
- POST /api/auth/login
  - Request: LoginRequest
  - Response: LoginResponse { token, email, role }
  - Required mobile behavior: enforce role DRIVER for access

### Deliveries
- GET /api/deliveries/me
  - Returns deliveries assigned to authenticated driver
- PUT /api/deliveries/{id}/pickup
  - Allowed when delivery status is ASSIGNED and driver is assignee
- PUT /api/deliveries/{id}/start
  - Allowed when status is PICKED_UP and driver is assignee
- PUT /api/deliveries/{id}/complete
  - Allowed when status is IN_TRANSIT and driver is assignee
- PUT /api/deliveries/{id}/fail
  - Body: { reason }
  - Reason validation: required, max 180 chars
  - Allowed statuses: ASSIGNED, PICKED_UP, IN_TRANSIT

### Related order history (optional detail enhancement)
- GET /api/orders/{id}/history
  - Accessible by DRIVER role
  - Can be used when mobile app includes order-level timeline details

## 6. Domain model for mobile app
### Delivery status enum
- PENDING
- ASSIGNED
- PICKED_UP
- IN_TRANSIT
- DELIVERED
- CANCELLED

### Driver availability implications
- Backend sets driver BUSY when assigned
- Backend sets driver AVAILABLE on complete or fail
- Mobile app should not assume local availability state as source of truth

### Core mobile entities
- AuthSession
  - token: string
  - email: string
  - role: string
  - issuedAt: timestamp
- DeliveryItem
  - id: number
  - status: DeliveryStatus
  - pickupAddress: string
  - deliveryAddress: string
  - description?: string
  - createdAt: ISO datetime
  - updatedAt?: ISO datetime
  - restaurant?: { id, name, address }
  - customer?: { id, firstName, lastName, email }
- PendingAction
  - actionId: uuid
  - deliveryId: number
  - actionType: PICKUP | START | COMPLETE | FAIL
  - payload?: { reason?: string }
  - queuedAt: timestamp
  - retryCount: number
  - lastError?: string

## 7. User stories
### Authentication and session
- US-DM-001
  - As a driver, I want to log in securely so I can access my assigned deliveries.
- US-DM-002
  - As a driver, I want my session restored on app restart so I do not log in repeatedly.
- US-DM-003
  - As a driver, I want explicit feedback when my token is invalid so I can re-authenticate.

### Delivery list and details
- US-DM-010
  - As a driver, I want to see only my assigned deliveries so I can focus on my workload.
- US-DM-011
  - As a driver, I want key pickup and destination details so I can execute delivery quickly.
- US-DM-012
  - As a driver, I want to refresh the list manually so I can get current statuses.

### Workflow transitions
- US-DM-020
  - As a driver, I want to mark ASSIGNED delivery as PICKED_UP when I collect it.
- US-DM-021
  - As a driver, I want to mark PICKED_UP delivery as IN_TRANSIT when I begin travel.
- US-DM-022
  - As a driver, I want to mark IN_TRANSIT delivery as DELIVERED when handoff is complete.

### Failure handling
- US-DM-030
  - As a driver, I want to report failed delivery with a reason so operations can follow up.
- US-DM-031
  - As a driver, I want reason validation in-app so invalid submissions are prevented.

### Offline and sync
- US-DM-040
  - As a driver, I want to keep seeing cached deliveries when network is unavailable.
- US-DM-041
  - As a driver, I want my transition actions queued offline so work is not lost.
- US-DM-042
  - As a driver, I want queued actions retried automatically when network returns.

## 8. Role-based app flow
### Driver flow (happy path)
1. Driver logs in.
2. App validates role DRIVER.
3. App loads GET /api/deliveries/me.
4. Driver opens one ASSIGNED delivery.
5. Driver taps Mark picked up -> PUT /pickup.
6. Driver taps Start delivery -> PUT /start.
7. Driver taps Mark delivered -> PUT /complete.
8. App refreshes list and confirms completion.

### Driver flow (failure path)
1. Driver opens ASSIGNED, PICKED_UP, or IN_TRANSIT delivery.
2. Driver taps Report issue.
3. Driver selects or writes reason (1..180 chars).
4. App sends PUT /fail.
5. App refreshes list and shows CANCELLED state.

### Unauthorized role flow
1. User logs in with non-DRIVER role.
2. App blocks driver workspace and shows role-not-allowed state.
3. User can sign out and retry with correct account.

## 9. Screen-level requirements
### Screen A: Login
- Inputs: email, password
- Actions: sign in
- States: idle, submitting, error
- Validation:
  - email required and valid format
  - password required
- Output:
  - on success with DRIVER role -> navigate to Delivery List
  - on success with non-DRIVER role -> role mismatch message + logout option

### Screen B: Delivery List
- Data source: GET /api/deliveries/me
- Required fields per card:
  - delivery id
  - status badge
  - pickup address
  - destination address
  - last update time
- Actions:
  - pull-to-refresh
  - open details
- States:
  - loading skeleton
  - empty state
  - error with retry
  - offline cached mode indicator

### Screen C: Delivery Detail
- Sections:
  - status + id
  - pickup and destination
  - customer and restaurant summary
  - notes/description
  - timeline summary (created/updated + current status)
- Primary actions by status:
  - ASSIGNED: Mark picked up, Report issue
  - PICKED_UP: Start delivery, Report issue
  - IN_TRANSIT: Mark delivered, Report issue
  - DELIVERED: no transition action
  - CANCELLED: no transition action
- Guardrails:
  - disable action buttons while submitting
  - prevent double taps

### Screen D: Failure Report modal/sheet
- Fields:
  - reason text area
  - optional quick reason chips
- Validation:
  - non-empty trimmed text
  - <= 180 characters
- Actions:
  - submit
  - cancel

## 10. Offline behavior specification
### Local cache policy
- Cache the most recent successful response for GET /api/deliveries/me.
- Keep a local timestamp of last successful sync.
- TTL for cache display: 24h (still show stale indicator after TTL).

### Offline read behavior
- If network unavailable, show cached list and badge: Offline data.
- If no cache exists, show explicit offline-empty message.

### Offline write behavior (action queue)
- If transition API fails due to connectivity timeout or no network:
  - enqueue PendingAction;
  - show local pending badge on the delivery;
  - show message: action queued and will retry.

### Queue replay rules
- Replay order per delivery must be FIFO.
- Replay trigger:
  - app foreground and network available;
  - manual Retry pending sync action.
- Max retries per action: 5 with exponential backoff.
- After max retries:
  - keep action in failed queue;
  - require manual user retry or discard.

### Conflict resolution rules
- If backend rejects replay due to invalid current status:
  - fetch latest delivery state;
  - mark pending action as conflicted;
  - show prompt to discard outdated local action.
- Server state is source of truth.

## 11. Sync strategy
### Sync moments
- On login success
- On app resume (foreground)
- On pull-to-refresh
- After any successful transition action
- After queue replay completion

### Data merge strategy
- Merge by delivery id.
- Replace local entity with server payload on successful response.
- Remove local pending marker when server confirms action.

### Telemetry events (minimum)
- login_success
- login_failure
- delivery_list_loaded
- delivery_transition_requested
- delivery_transition_succeeded
- delivery_transition_failed
- offline_action_queued
- queued_action_replayed
- queued_action_conflict

## 12. Failure handling specification
### Error categories
- Auth errors
  - 401/403 or invalid token -> clear session and redirect to login
- Permission errors
  - driver not assigned -> show delivery no longer assigned message and refresh list
- Validation errors
  - fail reason invalid -> inline form error
- Business rule errors
  - invalid state transition -> show rule message and refresh current delivery
- Network errors
  - timeout/offline -> queue action when safe, otherwise retry CTA
- Server errors
  - 5xx -> show transient error with retry

### UX requirements for failures
- Every failed operation must return actionable feedback.
- No silent failures.
- Error copy should include what happened and what user can do next.

## 13. Non-functional requirements
- Security
  - Store token in secure storage (Keychain/Keystore abstraction)
  - Do not log tokens or sensitive payloads
- Performance
  - Delivery list first render under 2s on mid-range device with cached data
- Reliability
  - Queue persistence must survive app restart
- Accessibility
  - All controls must be keyboard/screen-reader labeled
  - Touch targets minimum 44x44 dp
- Localization readiness
  - User-facing strings externalized for i18n

## 13.1 Non-negotiable requirements (must ship in v1)
1. Authentication and role gate:
  - App must allow access only to DRIVER role after login.
  - Non-DRIVER login must be blocked from driver workspace.
2. Delivery scope:
  - App must use GET /api/deliveries/me as the source for driver delivery list.
3. Transition safety:
  - App must enforce transition actions exactly by server state:
    - ASSIGNED -> PICKED_UP
    - PICKED_UP -> IN_TRANSIT
    - IN_TRANSIT -> DELIVERED
4. Failure flow:
  - App must support fail action from ASSIGNED, PICKED_UP, or IN_TRANSIT.
  - Reason must be required and max 180 characters.
5. Offline continuity:
  - App must display cached deliveries when offline (if cache exists).
  - App must queue offline transition actions and replay when network returns.
6. Queue correctness:
  - Replay must preserve FIFO order per delivery.
  - Max retries must be bounded and failed actions must remain visible for manual retry.
7. Conflict handling:
  - On server rejection during replay, app must fetch latest state and mark local action conflicted.
  - Server state must remain authoritative.
8. Failure UX:
  - No silent failures.
  - Every failed operation must provide user-visible, actionable feedback.
9. Session security:
  - Token must be stored in secure device storage.
  - Sensitive auth data must never be written to logs.
10. Quality gate:
  - v1 release is blocked unless AC-DM-001..042 test scenarios pass.

## 14. Acceptance criteria
### Authentication
- AC-DM-001
  - Given valid DRIVER credentials
  - When user submits login
  - Then app stores session and opens Delivery List.
- AC-DM-002
  - Given valid non-DRIVER credentials
  - When login succeeds
  - Then app blocks driver area and provides sign-out option.

### Delivery loading
- AC-DM-010
  - Given authenticated driver with assignments
  - When Delivery List opens
  - Then only assigned deliveries are displayed.
- AC-DM-011
  - Given API temporary failure
  - When Delivery List load fails
  - Then app shows retry action and does not crash.

### Workflow transitions
- AC-DM-020
  - Given delivery in ASSIGNED
  - When driver marks picked up
  - Then status becomes PICKED_UP after successful sync.
- AC-DM-021
  - Given delivery in PICKED_UP
  - When driver starts delivery
  - Then status becomes IN_TRANSIT.
- AC-DM-022
  - Given delivery in IN_TRANSIT
  - When driver marks delivered
  - Then status becomes DELIVERED and is reflected in refreshed list.

### Failure reporting
- AC-DM-030
  - Given delivery in ASSIGNED, PICKED_UP, or IN_TRANSIT
  - When driver submits a valid reason
  - Then status becomes CANCELLED and reason is sent.
- AC-DM-031
  - Given empty reason or >180 chars
  - When driver tries to submit
  - Then submission is blocked with inline validation error.

### Offline and queue
- AC-DM-040
  - Given no network and cached data exists
  - When opening Delivery List
  - Then cached deliveries are shown with offline indicator.
- AC-DM-041
  - Given no network during transition request
  - When driver performs action
  - Then action is queued and visible as pending.
- AC-DM-042
  - Given queued actions and network restored
  - When sync runs
  - Then actions replay in FIFO order and update UI with final server state.

## 15. Test strategy aligned with this spec
- Unit tests
  - transition action eligibility by status
  - queue replay policy and retry backoff
  - fail reason validator
- Integration tests
  - login -> delivery list -> transition flow
  - offline queue creation and replay
  - conflict resolution after stale queued action
- End-to-end tests
  - happy path: ASSIGNED -> PICKED_UP -> IN_TRANSIT -> DELIVERED
  - failure path: IN_TRANSIT -> CANCELLED with reason
  - auth expiry path: forced 401 -> relogin

## 16. Delivery plan proposal for implementation
- Sprint M1
  - auth/session, delivery list, detail view, online transitions
- Sprint M2
  - offline cache + queue + replay + conflict UX
- Sprint M3
  - hardening, telemetry, accessibility pass, e2e stabilization

## 17. Post-v1 decisions (do not block approved v1)
- Should order history be shown in mobile v1 detail via /api/orders/{id}/history?
- Should quick reason chips be fixed taxonomy from operations team?
- Should queued fail actions require explicit user confirmation before replay?
- Is push notification for new assignment included in v1 or deferred to v1.1?
