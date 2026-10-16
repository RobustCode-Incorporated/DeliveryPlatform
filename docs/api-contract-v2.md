# Robust Delivery Platform - API contract v2

Status: **implemented** on backend branch `session-2/unified-flow` (RDP-Backend).
Audience: web (RDP-Frontend) and mobile (RDP-Mobile/driver-app) engineers.
This document is meant to be sufficient to implement a client without reading
backend code. Every example below was captured from a real run of the backend
against PostgreSQL 16 with all migrations (V1-V6) applied.

v2 replaces the v1 split between `/api/orders` and `/api/deliveries`.
There is now **one** core entity, the **Delivery**, and one lifecycle.
`/api/orders/**` no longer exists (any call returns `403`).

---

## 1. Conventions

| Topic | Rule |
|---|---|
| Base URL | Local: `http://localhost:8080`. Hosted: the Render backend URL configured in each client. All paths below start with `/api`. |
| Format | JSON in and out. Send `Content-Type: application/json` on every request with a body. |
| Auth | `Authorization: Bearer <token>` on every endpoint except `POST /api/auth/login`, `POST /api/auth/register`, `GET /actuator/health`. |
| Ids | 64-bit integers (`number` in TS). |
| Timestamps | ISO-8601 UTC instants with `Z` and up to 6 fractional digits, e.g. `"2026-10-16T11:31:29.349609Z"`. Parse with `new Date(...)` / `Date.parse`. Display in the user's zone (pilot: `Europe/Brussels`). |
| Money | JSON numbers in **EUR**, always 2 decimals when set (`31.50`). Never FCFA. Format client side (`Intl.NumberFormat('fr-BE', {style:'currency', currency:'EUR'})`). |
| Coordinates | JSON numbers, WGS84 decimal degrees, returned with 7 decimals (`50.8503000`). Latitude -90..90, longitude -180..180. |
| Nulls | Response objects always contain every documented field; absent values are `null` (not omitted). Exception: `fieldErrors` in error bodies is omitted when empty. |
| Enums | UPPER_SNAKE_CASE strings. Unknown enum value in a body -> `400 "Malformed or invalid request body"`; in a query param -> `400 "Invalid value for parameter '<name>'"`. Clients should tolerate unknown enum values in responses (show raw value). |
| Lists | Plain JSON arrays (no pagination envelope). Delivery lists are sorted **newest first** (`createdAt` desc, then `id` desc). |
| Unknown fields | Ignored in request bodies. |
| CORS (web) | Allowed headers: `Authorization`, `Content-Type`, `Accept`. Allowed methods: GET, POST, PUT, PATCH, DELETE, OPTIONS. Origins come from backend env `APP_CORS_ALLOWED_ORIGINS` (comma separated). |
| Realtime | None. Clients poll (see section 9). |

### 1.1 Error body (every non-2xx response)

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "timestamp": "2026-10-16T11:31:29.320594Z",
  "path": "/api/deliveries",
  "fieldErrors": {
    "customerName": "Customer name is required",
    "customerPhone": "Customer phone must be a valid phone number (8-15 digits, e.g. +32 470 12 34 56 or 0470 12 34 56)"
  }
}
```

| Field | Type | Notes |
|---|---|---|
| `status` | number | HTTP status code |
| `error` | string | HTTP reason phrase |
| `message` | string | Human readable, English, safe to show. Never contains stack traces. |
| `timestamp` | string | ISO instant |
| `path` | string | Request path |
| `fieldErrors` | object, optional | `{ fieldName: message }`. Present only when `message == "Validation failed"`. Keys are the request field names (or query param names for filters) - map them onto form fields. One message per field. |

### 1.2 Status codes

| Code | Meaning | Client action |
|---|---|---|
| 200 | OK | |
| 201 | Created (`POST /api/deliveries`, `/api/auth/register`, `/api/auth/register-restaurant`, `/api/users`, `/api/drivers`, `/api/restaurants`). Note: `POST /api/vehicles` returns 200. | |
| 400 | Validation or business rule failed. With `fieldErrors` -> show under fields; without -> show `message` as a banner. | Fix input |
| 401 | Missing, invalid or expired token (`"Authentication required"`), or bad login (`"Invalid email or password"`) | Drop session, go to login |
| 403 | Role not allowed (`"Access denied"`), not your resource (`"You do not have access to this delivery"`, `"Driver not assigned to this delivery"`), disabled account at login, or unknown path | Show message; do not retry |
| 404 | Resource not found (`"Delivery not found"`, `"Driver not found"`, `"Restaurant not found"`) | |
| 409 | State conflict: illegal status transition, driver not available, duplicate email/plate, concurrent modification | Reload the resource, then let the user decide |
| 500 | `"An unexpected error occurred"` | Generic error, retry later |

Note: unknown paths return **403** (not 404) because the security layer denies
everything that is not explicitly mapped.

---

## 2. Roles and authentication

Roles: `ADMIN`, `DISPATCHER`, `RESTAURANT`, `DRIVER`, `CUSTOMER`.
`CUSTOMER` can log in but has no delivery endpoints in v2 (customers are
captured as `customerName`/`customerPhone` on the delivery).

### 2.1 `POST /api/auth/login` (public)

Request:
```json
{ "email": "resto@smoke.test", "password": "RestoPass123" }
```
| Field | Rules |
|---|---|
| `email` | required, valid email |
| `password` | required |

200:
```json
{ "token": "<jwt>", "email": "resto@smoke.test", "role": "RESTAURANT" }
```
Errors: `400` validation, `401 "Invalid email or password"`,
`403 "Account is disabled or pending administrator approval"` (driver awaiting approval, or disabled by admin).

Token: JWT (HS256), `sub` = email, claim `role` = role name, lifetime 24 h by
default (`JWT_EXPIRATION_MS`). There is **no refresh endpoint**: store the token
(web: memory/localStorage; mobile: SecureStore), decode `exp` to drop expired
sessions on startup, and log out on any `401`.

### 2.2 `POST /api/auth/register` (public) - driver / customer signup

Request (driver):
```json
{
  "email": "drv@smoke.test",
  "password": "DriverPass1",
  "firstName": "Dan",
  "lastName": "Driver",
  "phoneNumber": "+32470111222",
  "vehicleType": "BIKE",
  "vehiclePlate": "1-ABC-123",
  "role": "DRIVER"
}
```
| Field | Rules |
|---|---|
| `email` | required, valid email, unique (`409 "Email already exists"`) |
| `password` | required, min 8 chars |
| `firstName`, `lastName` | required |
| `role` | required, `DRIVER` or `CUSTOMER` only (other roles -> `400 "Public registration is only allowed for roles DRIVER and CUSTOMER"`) |
| `phoneNumber`, `vehicleType`, `vehiclePlate` | required when `role=DRIVER` (`400 "Phone number, vehicle type and vehicle plate are required for DRIVER registration"`); plate unique (`409 "Vehicle plate already exists"`) |

201 -> `User` (section 7.1). A `DRIVER` is created with `enabled: false` and
`availabilityStatus: OFFLINE`; login returns 403 until an admin enables it
(`PATCH /api/admin/users/{id}/enable`). Show "pending approval" after signup.

### 2.3 `POST /api/auth/register-restaurant` (ADMIN)

Creates a restaurant **and** its `RESTAURANT` login in one call.
```json
{
  "restaurantName": "Chez Smoke",
  "description": null,
  "phoneNumber": "+32 2 123 45 67",
  "restaurantEmail": "r@smoke.test",
  "address": "Rue Neuve 1",
  "city": "Bruxelles",
  "country": "BE",
  "adminEmail": "resto@smoke.test",
  "adminPassword": "RestoPass123",
  "adminFirstName": "Rita",
  "adminLastName": "Resto"
}
```
Required: `restaurantName`, `phoneNumber`, `restaurantEmail` (email), `address`,
`adminEmail` (email), `adminPassword`, `adminFirstName`, `adminLastName`.
Errors: `409 "Admin email already exists"`, `409 "Restaurant email already exists"`.
201 -> `User` of the new restaurant account. Coordinates are not set here: follow
up with `PATCH /api/restaurants/{id}` (section 6.4) so pickups get map pins.

---

## 3. The Delivery

### 3.1 Lifecycle

```
CREATED ──assign──▶ ASSIGNED ──pickup──▶ PICKED_UP ──start──▶ IN_TRANSIT ──complete──▶ DELIVERED
   │                 │  ▲ reassign             │                    │
   │                 └──┘ (before pickup)      │                    │
   │ cancel          │ cancel / fail           │ fail               │ fail
   ▼                 ▼                         ▼                    ▼
CANCELLED     CANCELLED / FAILED            FAILED               FAILED
```

| Status | Meaning | Terminal |
|---|---|---|
| `CREATED` | Created by restaurant/dispatcher, no driver yet | no |
| `ASSIGNED` | Driver assigned, not yet collected | no |
| `PICKED_UP` | Driver has the food | no |
| `IN_TRANSIT` | Driver is on the way to the customer | no |
| `DELIVERED` | Handed over (cash collected if COD) | yes |
| `FAILED` | Driver could not deliver; `failureReason` set | yes |
| `CANCELLED` | Cancelled by restaurant/admin before pickup; `cancellationReason` may be set | yes |

Allowed transitions (anything else -> `409 "Cannot change delivery status from X to Y"`):

| From | To | Endpoint | Who |
|---|---|---|---|
| CREATED | ASSIGNED | `PUT /{id}/assign` | ADMIN, DISPATCHER |
| ASSIGNED | ASSIGNED (other driver) | `PUT /{id}/assign` | ADMIN, DISPATCHER |
| CREATED, ASSIGNED | CANCELLED | `PATCH /{id}/cancel` | ADMIN, owning RESTAURANT |
| ASSIGNED | PICKED_UP | `PUT /{id}/pickup` | assigned DRIVER |
| PICKED_UP | IN_TRANSIT | `PUT /{id}/start` | assigned DRIVER |
| IN_TRANSIT | DELIVERED | `PUT /{id}/complete` | assigned DRIVER |
| ASSIGNED, PICKED_UP, IN_TRANSIT | FAILED | `PUT /{id}/fail` | assigned DRIVER |

"Food ready" is **not a status**: `PATCH /{id}/ready` sets `readyAt` while the
delivery is `CREATED` or `ASSIGNED`. Show it as a badge ("Ready for pickup").

UI label suggestions (FR / EN): CREATED "Créée / Created", ASSIGNED "Assignée /
Assigned", PICKED_UP "Récupérée / Picked up", IN_TRANSIT "En route / On the way",
DELIVERED "Livrée / Delivered", FAILED "Échec / Failed", CANCELLED "Annulée / Cancelled".

### 3.2 Driver availability side effects

`Driver.availabilityStatus` is `AVAILABLE | BUSY | OFFLINE` and is maintained by
the server - clients never set it directly:

- assign -> new driver becomes `BUSY`; on reassignment the previous driver goes back to `AVAILABLE` (if no other active delivery).
- complete / fail / cancel -> driver becomes `AVAILABLE` when they have no other `ASSIGNED|PICKED_UP|IN_TRANSIT` delivery.
- `GET /api/deliveries/me` (driver) puts the driver online: `AVAILABLE` if no active delivery, else `BUSY`. Newly approved drivers stay `OFFLINE` until they open the app once.
- Only `AVAILABLE` + enabled drivers can be assigned (`GET /api/drivers/available`).

### 3.3 `Delivery` object (all delivery endpoints return this)

```json
{
  "id": 12,
  "status": "DELIVERED",
  "version": 5,
  "restaurant": {
    "id": 3,
    "name": "Chez Smoke",
    "address": "Rue Neuve 1",
    "phone": "+32 2 123 45 67",
    "latitude": 50.8503000,
    "longitude": 4.3517000
  },
  "driver": {
    "id": 4,
    "firstName": "Dan",
    "lastName": "Driver",
    "phone": "+32470111222",
    "vehicleType": "BIKE",
    "latitude": 50.8400000,
    "longitude": 4.3600000,
    "lastLocationAt": "2026-10-16T11:31:29.636543Z"
  },
  "customerName": "Claire Client",
  "customerPhone": "+32 470 12 34 56",
  "pickupAddress": "Rue Neuve 1, Bruxelles",
  "pickupLatitude": 50.8503000,
  "pickupLongitude": 4.3517000,
  "deliveryAddress": "Avenue Louise 100, 1050 Ixelles",
  "deliveryLatitude": 50.8270000,
  "deliveryLongitude": 4.3640000,
  "description": "2 pizzas",
  "notes": "Sonner 2x",
  "orderReference": "CMD-1001",
  "orderAmount": 31.50,
  "paymentMode": "CASH_ON_DELIVERY",
  "cashToCollect": 34.00,
  "deliveryFee": 2.50,
  "failureReason": null,
  "cancellationReason": null,
  "createdAt": "2026-10-16T11:31:29.349609Z",
  "updatedAt": "2026-10-16T11:31:29.717530Z",
  "readyAt": "2026-10-16T11:31:29.584444Z",
  "assignedAt": "2026-10-16T11:31:29.614382Z",
  "pickedUpAt": "2026-10-16T11:31:29.676785Z",
  "deliveredAt": "2026-10-16T11:31:29.717297Z",
  "failedAt": null,
  "cancelledAt": null
}
```

| Field | Type | Nullable | Notes |
|---|---|---|---|
| `id` | number | no | |
| `status` | DeliveryStatus | no | section 3.1 |
| `version` | number | no | Incremented on every change. Use it to detect that a cached copy is stale (compare before/after). Not sent back by clients in v2. |
| `restaurant` | object | no | `id`, `name`, `address` non-null; `phone`, `latitude`, `longitude` nullable |
| `driver` | object | **yes** | `null` while `CREATED` (and on deliveries cancelled before assignment). `firstName`, `lastName`, `phone`, `vehicleType`, `latitude`, `longitude`, `lastLocationAt` each nullable. Lat/lng is the driver's **last reported** position (any delivery). |
| `customerName` | string | yes* | *Always set for v2 deliveries. Migrated v1 rows use the v1 customer user's name. |
| `customerPhone` | string | yes* | *Always set for v2 deliveries; `null` on migrated v1 rows. Render as `tel:` link. |
| `pickupAddress` | string | no | Defaults to `restaurant.address + ", " + restaurant.city` when not given |
| `pickupLatitude`, `pickupLongitude` | number | yes | Default to restaurant coordinates. Both null or both set. |
| `deliveryAddress` | string | no | |
| `deliveryLatitude`, `deliveryLongitude` | number | yes | Both null or both set. If null, do not draw a pin (or geocode client side). |
| `description` | string | yes | What is delivered |
| `notes` | string | yes | Instructions for the driver (door code, floor...) |
| `orderReference` | string | yes | Restaurant's own order number |
| `orderAmount` | number | yes | Order value, EUR, informational |
| `paymentMode` | `PREPAID` \| `CASH_ON_DELIVERY` | no | Migrated v1 rows are `PREPAID` |
| `cashToCollect` | number | yes | Set (> 0) iff `CASH_ON_DELIVERY`. Driver app must show it prominently before `complete`. |
| `deliveryFee` | number | yes | EUR. v1 `price` was migrated here. |
| `failureReason` | string | yes | Set iff `FAILED` |
| `cancellationReason` | string | yes | Optional, only when `CANCELLED` |
| `createdAt` | instant | no | |
| `updatedAt` | instant | yes | Last modification |
| `readyAt` | instant | yes | Food marked ready |
| `assignedAt` | instant | yes | Last (re)assignment |
| `pickedUpAt`, `deliveredAt`, `failedAt`, `cancelledAt` | instant | yes | Lifecycle timestamps |

There is **no** `IN_TRANSIT` timestamp field; use history (section 4.4) if needed.

### 3.4 `DeliveryHistory` entry

```json
{
  "id": 7,
  "event": "ASSIGNED",
  "oldStatus": "CREATED",
  "newStatus": "ASSIGNED",
  "changedBy": "admin@validate.test",
  "note": "Assigned to driver #4",
  "createdAt": "2026-10-16T11:31:29.617489Z"
}
```
| Field | Notes |
|---|---|
| `event` | `CREATED`, `ASSIGNED`, `REASSIGNED`, `READY`, `PICKED_UP`, `IN_TRANSIT`, `DELIVERED`, `FAILED`, `CANCELLED`, `MIGRATED` |
| `oldStatus` | null for `CREATED` and `MIGRATED`. For `READY`, `oldStatus == newStatus` (no status change). |
| `newStatus` | never null |
| `changedBy` | email of the actor, or `system:migration-v6` |
| `note` | `ASSIGNED`: "Assigned to driver #<id>"; `REASSIGNED`: "Reassigned from driver #<a> to driver #<b>"; `READY`: "Food ready for pickup"; `FAILED`: the failure reason; `CANCELLED`: the reason or null; `MIGRATED`: "State imported from v1 data" |

Ordered oldest first.

---

## 4. Delivery endpoints

All under `/api/deliveries`. "Visible" means: ADMIN/DISPATCHER see all;
RESTAURANT sees its restaurant's deliveries; DRIVER sees deliveries currently
assigned to them. Accessing a delivery that exists but is not visible ->
`403 "You do not have access to this delivery"`; unknown id -> `404 "Delivery not found"`.

### 4.1 `GET /api/deliveries` - search (ADMIN, DISPATCHER, RESTAURANT, DRIVER)

Returns `Delivery[]` visible to the caller, newest first. A RESTAURANT user
without a linked restaurant, or a DRIVER without a driver profile, gets `[]`.

Query params (all optional, combinable):

| Param | Format | Meaning |
|---|---|---|
| `status` | DeliveryStatus, repeatable | `?status=CREATED&status=ASSIGNED` = any of them |
| `from` | `YYYY-MM-DD` or ISO date-time with offset | `createdAt >= from`. A plain date means 00:00 Europe/Brussels. |
| `to` | `YYYY-MM-DD` or ISO date-time with offset | `createdAt < to`. A plain date **includes that whole day** (Brussels). |

Errors: `400 "Invalid value for parameter 'status'"`;
`400` with `fieldErrors.from` / `fieldErrors.to` = "Must be a date (2026-10-15) or an ISO-8601 date-time with offset (2026-10-15T08:00:00Z)";
`400` with `fieldErrors.to` = "'to' must be after 'from'".

Example: today's active board for a dispatcher:
`GET /api/deliveries?status=CREATED&status=ASSIGNED&status=PICKED_UP&status=IN_TRANSIT&from=2026-10-16&to=2026-10-16`

### 4.2 `GET /api/deliveries/me` - driver's deliveries (DRIVER)

Returns every delivery ever assigned to the calling driver (all statuses),
newest first. Side effect: puts the driver online (section 3.2).
Error: `400 "No driver profile assigned to user"`.

### 4.3 `GET /api/deliveries/{id}` (ADMIN, DISPATCHER, RESTAURANT, DRIVER)

Returns one `Delivery` if visible.

### 4.4 `GET /api/deliveries/{id}/history` (ADMIN, DISPATCHER, RESTAURANT, DRIVER)

Returns `DeliveryHistory[]` (oldest first) if the delivery is visible.

### 4.5 `POST /api/deliveries` - create (ADMIN, DISPATCHER, RESTAURANT)

Request:
```json
{
  "restaurantId": 3,
  "customerName": "Claire Client",
  "customerPhone": "+32 470 12 34 56",
  "deliveryAddress": "Avenue Louise 100, 1050 Ixelles",
  "deliveryLatitude": 50.8270,
  "deliveryLongitude": 4.3640,
  "pickupAddress": null,
  "pickupLatitude": null,
  "pickupLongitude": null,
  "description": "2 pizzas",
  "notes": "Sonner 2x",
  "orderReference": "CMD-1001",
  "orderAmount": 31.50,
  "paymentMode": "CASH_ON_DELIVERY",
  "cashToCollect": 34.00,
  "deliveryFee": 2.50
}
```

| Field | Required | Rules (error message in `fieldErrors[field]`) |
|---|---|---|
| `restaurantId` | ADMIN/DISPATCHER: yes. RESTAURANT: **ignored** (own restaurant always used) | "Restaurant id is required for admin and dispatcher"; unknown id -> `404 "Restaurant not found"` |
| `customerName` | yes | not blank, max 150 |
| `customerPhone` | yes | 8-15 digits, optional leading `+`, separators space `.` `/` `-` `(` `)` allowed. Examples OK: `+32 470 12 34 56`, `0470 12 34 56`, `02/123.45.67`, `0032470123456` |
| `deliveryAddress` | yes | not blank, max 255 |
| `deliveryLatitude` / `deliveryLongitude` | no | -90..90 / -180..180; **both or neither** ("deliveryLatitude and deliveryLongitude must be provided together", reported on `deliveryLatitude`) |
| `pickupAddress` | no | max 255; default restaurant address + city |
| `pickupLatitude` / `pickupLongitude` | no | same ranges; both or neither (reported on `pickupLatitude`); default restaurant coordinates |
| `description` | no | max 500 |
| `notes` | no | max 500 |
| `orderReference` | no | max 100 |
| `orderAmount` | no | >= 0, max 2 decimals |
| `paymentMode` | yes | `PREPAID` or `CASH_ON_DELIVERY` ("Payment mode is required (PREPAID or CASH_ON_DELIVERY)") |
| `cashToCollect` | iff COD | COD: required and > 0 ("Cash to collect is required and must be greater than 0 for CASH_ON_DELIVERY"). PREPAID: must be null or 0 ("Cash to collect must be empty for PREPAID deliveries"); stored as null. Max 2 decimals. |
| `deliveryFee` | no | >= 0, max 2 decimals |

Strings are trimmed; blank optional strings are stored as `null`.

Responses: `201` -> `Delivery` with `status: "CREATED"`, `version: 0`, `driver: null`.
Errors: `400` validation; `400 "Restaurant is inactive"`; `403 "No restaurant is linked to your account"`.

Validation happens in two passes: per-field rules first, then cross-field rules
(COD cash, coordinate pairs). A request failing per-field rules will not yet
report cross-field errors - validate both client side to avoid two round trips.

### 4.6 `PUT /api/deliveries/{id}/assign` (ADMIN, DISPATCHER)

```json
{ "driverId": 4 }
```
- `CREATED` -> `ASSIGNED`, or `ASSIGNED` -> `ASSIGNED` with another driver (reassignment, allowed only before pickup).
- Same driver again on an `ASSIGNED` delivery: no-op, `200` with unchanged delivery.

Errors: `400 fieldErrors.driverId "Driver id is required"`;
`404 "Driver not found"`; `400 "Driver account is disabled"`;
`409 "Driver is not available. Current availability: BUSY"` (or `OFFLINE`);
`409 "A driver can only be assigned while the delivery is CREATED or ASSIGNED (before pickup). Current status: <S>"`.
200 -> `Delivery`.

Pick drivers from `GET /api/drivers/available`; refresh that list after a 409.

### 4.7 `PATCH /api/deliveries/{id}/ready` (ADMIN, owning RESTAURANT)

No body. Sets `readyAt` (status unchanged). Idempotent: calling again returns
`200` with the same `readyAt`.
Errors: `409 "Food can only be marked ready before pickup. Current status: <S>"`, `403`.

### 4.8 `PATCH /api/deliveries/{id}/cancel` (ADMIN, owning RESTAURANT)

Body optional:
```json
{ "reason": "Client a annulé" }
```
`reason`: optional, max 500. `CREATED|ASSIGNED` -> `CANCELLED`, sets
`cancelledAt`, frees the driver.
Errors: `409 "Cannot change delivery status from <S> to CANCELLED"` (after pickup a
delivery cannot be cancelled; the driver must `fail` it), `403`.
DISPATCHER cannot cancel (`403 "Access denied"`).

### 4.9 Driver actions (DRIVER assigned to the delivery)

These keep the v1 mobile paths and verbs.

| Endpoint | Transition | Body | Sets |
|---|---|---|---|
| `PUT /api/deliveries/{id}/pickup` | ASSIGNED -> PICKED_UP | none | `pickedUpAt` |
| `PUT /api/deliveries/{id}/start` | PICKED_UP -> IN_TRANSIT | none | |
| `PUT /api/deliveries/{id}/complete` | IN_TRANSIT -> DELIVERED | none | `deliveredAt` |
| `PUT /api/deliveries/{id}/fail` | ASSIGNED/PICKED_UP/IN_TRANSIT -> FAILED | `{ "reason": "Client absent" }` | `failedAt`, `failureReason` |

`fail.reason`: required, not blank, max 180 (`400 fieldErrors.reason`).

Errors (all four): `403 "Driver not assigned to this delivery"` (includes after
reassignment to someone else), `409 "Cannot change delivery status from X to Y"`,
`404`, `400 "No driver profile assigned to user"`.
200 -> updated `Delivery`.

These actions are **not idempotent**: repeating `pickup` on a `PICKED_UP`
delivery returns `409`. For offline replay see section 9.2.

---

## 5. Drivers

`Driver` object:
```json
{
  "id": 4,
  "userId": 12,
  "firstName": "Dan",
  "lastName": "Driver",
  "email": "drv@smoke.test",
  "phoneNumber": "+32470111222",
  "vehicleType": "BIKE",
  "vehiclePlate": "1-ABC-123",
  "availabilityStatus": "AVAILABLE",
  "currentLatitude": 50.8400000,
  "currentLongitude": 4.3600000,
  "lastLocationAt": "2026-10-16T11:31:29.636543Z"
}
```
Note: `Driver.id` (driver profile) is **not** `userId`. `assign` takes `Driver.id`.
`currentLatitude`, `currentLongitude`, `lastLocationAt` are null until the first location update.

| Endpoint | Roles | Notes |
|---|---|---|
| `GET /api/drivers` | ADMIN, DISPATCHER | All drivers -> `Driver[]` |
| `GET /api/drivers/available` | ADMIN, DISPATCHER | Enabled drivers with `availabilityStatus = AVAILABLE` -> `Driver[]` |
| `GET /api/drivers/me` | DRIVER | Own profile -> `Driver`; `400 "No driver profile assigned to user"` |
| `PATCH /api/drivers/me/location` | DRIVER | Body `{ "latitude": 50.84, "longitude": 4.36 }` (both required, ranges as above). Sets position + `lastLocationAt`, returns `Driver`. Does not change availability. |
| `POST /api/drivers` | ADMIN | Attach a driver profile to an existing user: `{ "userId": 12, "phoneNumber": "..." (8-20 chars), "vehicleType": "..." (max 50), "vehiclePlate": "..." (max 30) }` -> `201 Driver` (`OFFLINE`). `404 "User not found"`, `400 "User must have DRIVER role"`, `409 "Driver profile already exists"`, `409 "Vehicle plate already exists"`. |

Consider a position stale when `lastLocationAt` is older than ~5 minutes (grey pin).

## 6. Restaurants

`Restaurant` object:
```json
{
  "id": 3,
  "name": "Chez Smoke",
  "description": null,
  "phoneNumber": "+32 2 123 45 67",
  "email": "r@smoke.test",
  "address": "Rue Neuve 1",
  "city": "Bruxelles",
  "country": "BE",
  "latitude": 50.8503000,
  "longitude": 4.3517000,
  "status": "ACTIVE"
}
```
`status`: `ACTIVE | INACTIVE`. An `INACTIVE` restaurant cannot create deliveries.
(The embedded `delivery.restaurant` summary names the phone `phone`; the full object names it `phoneNumber`.)

| # | Endpoint | Roles | Notes |
|---|---|---|---|
| 6.1 | `GET /api/restaurants` | ADMIN | `Restaurant[]` |
| 6.2 | `GET /api/restaurants/me` | RESTAURANT | Own restaurant; `400 "No restaurant assigned to user"` |
| 6.3 | `GET /api/restaurants/{id}` | ADMIN, RESTAURANT (own only) | `403 "You do not have access to this restaurant"` |
| 6.4 | `PATCH /api/restaurants/{id}` | ADMIN | Partial update; omitted/null fields unchanged. Fields: `name` (1-150), `description` (<=500), `phoneNumber` (<=30), `email` (email, unique -> 409), `address` (1-255), `city` (<=100), `country` (<=100), `latitude`+`longitude` (together, ranges as above), `status`. Coordinates become the default pickup point of **new** deliveries. |
| 6.5 | `POST /api/restaurants` | ADMIN | Restaurant without a login: `{ name*, description, phoneNumber, email, address*, city, country }` -> `201 Restaurant`. Prefer `/api/auth/register-restaurant`. |
| 6.6 | `GET /api/restaurants/{restaurantId}/deliveries?status=...` | ADMIN, RESTAURANT (own) | `Delivery[]`, newest first; `status` optional and repeatable. Equivalent to `GET /api/deliveries` for a restaurant user. |
| 6.7 | `GET /api/restaurants/{restaurantId}/deliveries/status?status=X` | ADMIN, RESTAURANT (own) | Legacy, `status` required (single). Prefer 6.6. |

## 7. Users and vehicles (admin)

### 7.1 `User` object
```json
{ "id": 12, "email": "drv@smoke.test", "firstName": "Dan", "lastName": "Driver", "role": "DRIVER", "enabled": true }
```

| Endpoint | Roles | Notes |
|---|---|---|
| `GET /api/admin/users?enabled=false&role=DRIVER` | ADMIN | Both params optional. Use `enabled=false&role=DRIVER` for the approval queue. |
| `PATCH /api/admin/users/{id}/enable` | ADMIN | -> `User` |
| `PATCH /api/admin/users/{id}/disable` | ADMIN | -> `User`; `400 "You cannot disable your own account"` |
| `POST /api/users` | ADMIN | `{ email*, password* (>=8), firstName*, lastName*, role* }` -> `201 User`. Use for `DISPATCHER`/`ADMIN` accounts. |
| `GET /api/vehicles` | ADMIN, DISPATCHER | `[{ "id", "vehicleType", "plateNumber", "status": "AVAILABLE|ASSIGNED|MAINTENANCE" }]` |
| `POST /api/vehicles` | ADMIN | `{ vehicleType* (<=50), plateNumber* (<=50) }` -> `200` (not 201) |

### 7.2 Health
`GET /actuator/health` (public) -> `{"status":"UP"}`. Use for wake-up pings on
the hosted backend (cold starts can take 30-60 s).

---

## 8. Role matrix (deliveries)

| Action | ADMIN | DISPATCHER | RESTAURANT | DRIVER |
|---|---|---|---|---|
| List / search | all | all | own restaurant | assigned to me |
| Get / history | all | all | own restaurant | assigned to me |
| Create | yes (`restaurantId` required) | yes (`restaurantId` required) | yes (own restaurant) | no |
| Assign / reassign | yes | yes | no | no |
| Mark ready | yes | no | own | no |
| Cancel | yes | no | own | no |
| Pickup / start / complete / fail | no | no | no | assigned to me |
| `GET /deliveries/me` | no | no | no | yes |

Role denials return `403 "Access denied"`; ownership denials return `403` with a specific message.

## 9. Client guidance

### 9.1 Polling
- Web dispatcher / admin board: `GET /api/deliveries?status=...` every 10-15 s while visible; `GET /api/drivers` every 15-30 s for the live map.
- Restaurant dashboard: `GET /api/deliveries` every 15-30 s.
- Driver app: `GET /api/deliveries/me` on foreground and every 30 s; `PATCH /api/drivers/me/location` every 15-30 s while a delivery is `ASSIGNED|PICKED_UP|IN_TRANSIT` (and on significant movement).
- After any command, replace the cached delivery with the returned object (do not patch locally).

### 9.2 Mobile offline queue
When replaying a queued `pickup/start/complete/fail`:
- `200` -> success, replace local copy.
- `409` -> `GET /api/deliveries/{id}`; if its `status` already equals the action's target status, treat the action as done; otherwise mark the action conflicted and show the server state.
- `403 "Driver not assigned to this delivery"` -> delivery was reassigned; drop the action and remove the delivery from the active list after the next `/me` refresh.
- `401` -> keep the queue, require re-login, then replay.
- Network error / `5xx` -> retry with backoff.
- The optimistic local state for `fail` must be `status: "FAILED"` with `failureReason`, **not** `CANCELLED` + `"ECHEC:"` in `description` (v1 hack, removed).

### 9.3 Forms
Mirror the rules in 4.5 client side (phone regex
`^\+?(?:[\s./()-]*\d){8,15}[\s./()-]*$`, COD cash > 0, PREPAID cash empty,
coordinates in pairs) and still render `fieldErrors` from the server.

## 10. Migration from v1

### 10.1 Breaking changes

| v1 | v2 |
|---|---|
| `/api/orders`, `/api/orders/my-orders`, `/api/orders/restaurant`, `/api/orders/{id}/accept|prepare|ready|pickup|deliver|history`, `/api/orders/{id}/assign-driver/{driverId}` | Removed. Use `/api/deliveries` (create, list, `/{id}/ready`, `/{id}/assign` with body, `/{id}/history`). There is no accept/prepare step. |
| Status `PENDING` | `CREATED` |
| Failure stored as `CANCELLED` + `"ECHEC: <reason>"` appended to `description` | Status `FAILED` + `failureReason` |
| `price` | `deliveryFee` (plus new `orderAmount`, `cashToCollect`) |
| `customerId` / nested `customer` user | `customerName`, `customerPhone` (strings) |
| Flat `restaurantId` / `restaurantName` | Nested `restaurant` summary |
| `driver: { id }` | Nested `driver` summary with name, phone, vehicle, last position |
| `GET /api/deliveries` returned raw entities | Returns `Delivery` (section 3.3), role-scoped |
| Create body `{ customerId, restaurantId, pickupAddress, deliveryAddress, description }` | Section 4.5 (`customerName`, `customerPhone`, `paymentMode` required) |

Unchanged for mobile: `POST /api/auth/login`, `GET /api/deliveries/me`,
`PUT /api/deliveries/{id}/pickup|start|complete|fail` (paths, verbs, `fail` body).

### 10.2 Data migration (DB V6, already applied by the backend on startup)
- `PENDING` rows -> `CREATED`.
- `CANCELLED` rows whose description contained `ECHEC:` -> `FAILED`; the text after `ECHEC:` becomes `failureReason` (or `"Unknown (migrated)"` if empty) and is removed from `description`.
- `price` -> `deliveryFee`; `paymentMode` = `PREPAID`; `customerName` from the v1 customer user; `customerPhone` = null.
- Each existing delivery gets one history entry `event: "MIGRATED"`, `changedBy: "system:migration-v6"`.

### 10.3 Client TypeScript types

```ts
export type Role = 'ADMIN' | 'DISPATCHER' | 'RESTAURANT' | 'DRIVER' | 'CUSTOMER';
export type DeliveryStatus =
  | 'CREATED' | 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT'
  | 'DELIVERED' | 'FAILED' | 'CANCELLED';
export type PaymentMode = 'PREPAID' | 'CASH_ON_DELIVERY';
export type AvailabilityStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE';
export type HistoryEvent =
  | 'CREATED' | 'ASSIGNED' | 'REASSIGNED' | 'READY' | 'PICKED_UP'
  | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED' | 'CANCELLED' | 'MIGRATED';

export interface ApiError {
  status: number;
  error: string;
  message: string;
  timestamp: string;
  path: string;
  fieldErrors?: Record<string, string>;
}

export interface LoginResponse { token: string; email: string; role: Role; }

export interface User {
  id: number; email: string; firstName: string; lastName: string;
  role: Role; enabled: boolean;
}

export interface DeliveryRestaurant {
  id: number; name: string; address: string;
  phone: string | null; latitude: number | null; longitude: number | null;
}

export interface DeliveryDriver {
  id: number;
  firstName: string | null; lastName: string | null;
  phone: string | null; vehicleType: string | null;
  latitude: number | null; longitude: number | null;
  lastLocationAt: string | null;
}

export interface Delivery {
  id: number;
  status: DeliveryStatus;
  version: number;
  restaurant: DeliveryRestaurant;
  driver: DeliveryDriver | null;
  customerName: string | null;
  customerPhone: string | null;
  pickupAddress: string;
  pickupLatitude: number | null;
  pickupLongitude: number | null;
  deliveryAddress: string;
  deliveryLatitude: number | null;
  deliveryLongitude: number | null;
  description: string | null;
  notes: string | null;
  orderReference: string | null;
  orderAmount: number | null;
  paymentMode: PaymentMode;
  cashToCollect: number | null;
  deliveryFee: number | null;
  failureReason: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string | null;
  readyAt: string | null;
  assignedAt: string | null;
  pickedUpAt: string | null;
  deliveredAt: string | null;
  failedAt: string | null;
  cancelledAt: string | null;
}

export interface DeliveryHistory {
  id: number;
  event: HistoryEvent;
  oldStatus: DeliveryStatus | null;
  newStatus: DeliveryStatus;
  changedBy: string;
  note: string | null;
  createdAt: string;
}

export interface CreateDeliveryRequest {
  restaurantId?: number;            // required for ADMIN/DISPATCHER, ignored for RESTAURANT
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryLatitude?: number | null;
  deliveryLongitude?: number | null;
  pickupAddress?: string | null;
  pickupLatitude?: number | null;
  pickupLongitude?: number | null;
  description?: string | null;
  notes?: string | null;
  orderReference?: string | null;
  orderAmount?: number | null;
  paymentMode: PaymentMode;
  cashToCollect?: number | null;    // > 0 iff CASH_ON_DELIVERY
  deliveryFee?: number | null;
}

export interface Driver {
  id: number; userId: number;
  firstName: string; lastName: string; email: string;
  phoneNumber: string; vehicleType: string | null; vehiclePlate: string | null;
  availabilityStatus: AvailabilityStatus;
  currentLatitude: number | null; currentLongitude: number | null;
  lastLocationAt: string | null;
}

export interface Restaurant {
  id: number; name: string; description: string | null;
  phoneNumber: string | null; email: string | null;
  address: string; city: string | null; country: string | null;
  latitude: number | null; longitude: number | null;
  status: 'ACTIVE' | 'INACTIVE';
}
```
