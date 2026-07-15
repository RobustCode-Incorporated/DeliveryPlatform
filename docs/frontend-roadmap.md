# Frontend Roadmap - ROBUST DELIVERY PLATFORM (RDP)

## 1. Project analysis summary

The project is a monorepo with:
- a backend in Java/Spring Boot handling authentication, users, restaurants, drivers, orders, and deliveries;
- a web frontend in React + Vite + TypeScript;
- a mobile app scope for delivery drivers.

The current frontend is still in a very early stage. The existing application already has:
- authentication flow with login;
- role-based routing for admin and restaurant users;
- basic dashboards for admin and restaurant roles.

Completed foundation slice:
- persisted auth state in the frontend store;
- reusable authenticated app shell;
- role-based redirect from the root route;
- dashboard refactor to use the shared shell.

Completed first admin slice:
- restaurant overview cards;
- driver overview cards;
- orders overview table.

Completed second admin slice:
- search input per admin section;
- status filters for restaurants, drivers, and orders;
- empty-state handling when filters return no results.

Completed third admin slice:
- detail drawer for restaurants;
- detail drawer for drivers;
- detail drawer for orders.

Completed fourth admin slice:
- API-backed loading for restaurants, drivers, and orders;
- backend driver list endpoint added to support the admin view;
- assign-driver action for orders.

Completed fifth admin slice:
- loading and fallback hardening for admin API failures;
- retry action for reloading admin data;
- Vitest coverage for the admin loading, error, and assign-driver flows.

What is still missing or immature:
- a strong frontend architecture for scale;
- domain modeling for business concepts such as orders, deliveries, drivers, restaurants, and workflow states;
- reusable UI components and design system;
- consistent API integration and error handling;
- automated testing at unit, integration, and end-to-end levels.

## 2. Recommended frontend architecture

Use a layered structure aligned with the backend domain:

```text
src/
  domain/             # business concepts and rules
    auth/
    orders/
    deliveries/
    restaurants/
    drivers/
  application/        # use cases / orchestration
    auth/
    orders/
    deliveries/
  infrastructure/     # API, storage, external services
    api/
    persistence/
    auth/
  presentation/       # pages, components, routes, hooks
    components/
    pages/
    routes/
    hooks/
  shared/             # UI primitives, utils, constants
  tests/
    unit/
    integration/
    e2e/
```

This structure helps keep the UI independent from business rules and makes the app easier to evolve.

## 3. Specification-Driven Development approach

The frontend should be built from explicit specifications before implementation.

### Principle
Every feature starts with a clear specification that defines:
- user goal;
- roles involved;
- expected behavior;
- inputs and outputs;
- validation rules;
- error scenarios;
- acceptance criteria.

### How to apply it in this project
For every feature, create a small spec file or markdown document such as:
- Feature: Admin dashboard overview
- Feature: Restaurant order list
- Feature: Driver delivery workflow

### Recommended template
```text
Feature name
- User story
- Actors
- Preconditions
- Main flow
- Alternative flows
- Validation rules
- Error cases
- Acceptance criteria
```

### Priority features to specify first
1. Authentication and session persistence
2. Admin dashboard and restaurant dashboard
3. Order management list and detail view
4. Delivery status workflow
5. Error and loading states

## 4. Test-Driven Development approach

TDD should be used for every significant frontend feature.

### Testing pyramid for this project
- Unit tests: reducers, helpers, validators, domain logic, state transitions
- Component tests: forms, dialogs, cards, table behavior, role-based rendering
- Integration tests: page + API + store + routing
- E2E tests: login, admin flow, restaurant flow, order status update

### Suggested testing stack
- Vitest for unit and component tests
- React Testing Library for UI behavior
- MSW for API mocking
- Playwright for end-to-end tests

### TDD workflow
For each feature:
1. Write the failing test
2. Implement the minimum code to pass
3. Refactor safely
4. Verify behavior with the test suite

### First tests to add
- Login form validation and redirect logic
- Protected route behavior based on role
- Dashboard rendering for admin and restaurant roles
- Order workflow state transitions
- API error handling in forms

## 5. Domain-Driven Development approach

The web frontend should reflect the real business domain, not only technical screens.

### Core domain concepts to model
- User
- Restaurant
- Driver
- Order
- Delivery
- DeliveryStatus
- Assignment
- WorkflowEvent

### Domain model example
```ts
type DeliveryStatus = 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'DELIVERED' | 'FAILED';

interface Order {
  id: string;
  restaurantId: string;
  customerName: string;
  status: DeliveryStatus;
  totalAmount: number;
  createdAt: string;
}
```

### DDD rules for the frontend
- Keep business rules in the domain layer
- Avoid putting business logic directly inside components
- Represent workflows as state machines or domain services
- Use use cases to orchestrate interactions between UI and API

### Recommended domain services
- AuthService
- OrderService
- DeliveryWorkflowService
- RestaurantService
- DriverService

## 6. Recommended roadmap by phase

### Phase 1 - Foundation and architecture (Week 1)
Goals:
- establish frontend folder structure
- define design system and styling conventions
- define API client structure
- prepare test tooling

Deliverables:
- base folders: domain, application, infrastructure, presentation
- reusable layout components
- axios wrapper with interceptors
- environment config
- Vitest + RTL + Playwright setup

Specification deliverables:
- authentication flow spec
- dashboard layout spec

TDD deliverables:
- tests for protected routes
- tests for login form logic

DDD deliverables:
- auth domain model
- role-based access model

### Phase 2 - Authentication and role-based experience (Week 2)
Goals:
- stabilize login and session handling
- improve routing and access control
- show role-specific app shells

Deliverables:
- persistent auth state
- token handling and refresh strategy
- admin and restaurant layout shell
- loading and error states

Specification deliverables:
- login success/failure behavior
- access rules by role

TDD deliverables:
- tests for auth store
- tests for unauthorized access

DDD deliverables:
- user role and session domain model

### Phase 3 - Admin management screens (Weeks 3-4)
Goals:
- build the admin experience around business operations

Current status:
- first overview slice implemented with mocked restaurant, driver, and order data.

Features:
- restaurant overview
- drivers overview
- orders overview
- statistics cards
- filters and search

Deliverables:
- table/list components
- stat cards
- detail drawer/modal
- API integration layer for admin endpoints

Current status:
- overview cards and table are implemented;
- filtering and search are implemented;
- detail drawer/modal interactions are implemented;
- API integration for admin endpoints and actions is implemented;
- loading/error hardening and automated tests are implemented;
- next step is broader admin actions and more API-driven coverage.

Specification deliverables:
- admin dashboard feature spec
- restaurant management spec
- orders management spec

TDD deliverables:
- tests for filter/search behavior
- tests for empty/loading/error states

DDD deliverables:
- admin use cases for restaurant and order management

### Phase 4 - Restaurant operational workflow (Weeks 4-5)
Goals:
- support restaurant users in managing daily operations

Features:
- pending orders list
- accept/order preparation flow
- order status updates
- notification-friendly UI states

Deliverables:
- order cards and list views
- workflow buttons
- status badges and timeline UI

Specification deliverables:
- restaurant order workflow spec
- status transition rules spec

TDD deliverables:
- tests for status transitions
- tests for action availability by status

DDD deliverables:
- order lifecycle domain model
- delivery workflow state machine

Current status:
- pending-order workflow page is implemented;
- order list loading, search, and status filtering are implemented;
- workflow actions for accept, start preparation, and mark ready are implemented;
- delivery handoff summary and status history timeline are implemented;
- detail drawer and demo fallback/error states are implemented;
- Vitest coverage for the restaurant workflow slice is implemented;
- next step is the broader delivery lifecycle and assignment flows.

### Phase 5 - Delivery and tracking experience (Weeks 5-6)
Goals:
- represent the delivery lifecycle clearly in the UI

Features:
- delivery assignment view
- tracking timeline
- status change history
- failure reason handling

Deliverables:
- delivery timeline component
- status update forms
- analytics and summary cards

Specification deliverables:
- delivery lifecycle spec
- failure handling spec

TDD deliverables:
- tests for workflow rules
- tests for timeline rendering

DDD deliverables:
- delivery state domain model

Current status:
- driver delivery dashboard is implemented;
- driver-specific delivery loading via backend contract is implemented;
- pickup, start transit, and complete actions are implemented;
- delivery timeline and handoff drawer details are implemented;
- failure reason handling is implemented with a driver fail action and backend fail endpoint;
- Vitest coverage for the driver workflow slice is implemented;
- next step is Phase 6 quality and release hardening.

### Phase 6 - Quality, UX, and release readiness (Weeks 6-8)
Goals:
- harden the app for production

Features:
- accessibility improvements
- responsive design refinement
- error boundaries
- global loading and toast system
- CI pipeline and deployment checks

Deliverables:
- polished design system
- test coverage report
- linting/formatting pipeline
- deployment checklist

Specification deliverables:
- UI quality standards spec
- release acceptance criteria

TDD deliverables:
- component accessibility tests
- end-to-end test suite for critical flows

DDD deliverables:
- final domain alignment review with backend contracts

Current status:
- global toast provider is implemented and integrated in critical workflows;
- standardized async error boundary wiring is implemented;
- drawer accessibility pass is implemented with dialog semantics and keyboard focus trap behavior;
- broader restaurant-to-driver lifecycle workflow coverage is implemented in frontend tests;
- next step is release hardening and CI/deployment readiness.

## 7. Suggested implementation order

1. Stabilize authentication and routing
2. Define shared UI system and layout shell
3. Implement admin dashboard and CRUD-style management views
4. Implement restaurant workflow screens
5. Add delivery lifecycle views for drivers
6. Add test coverage and hardening

## 8. Practical recommendations for this repository

Because this project already follows backend-oriented DDD and hexagonal architecture, the frontend should mirror that spirit without becoming over-engineered.

Recommended approach:
- keep the frontend simple and pragmatic;
- model business concepts clearly;
- use specs before coding;
- test the behavior users actually care about;
- avoid putting business rules directly inside components.

## 9. Immediate next steps

The best next steps for this frontend are:
1. add CI pipeline checks for lint, test, and production build gates;
2. define a release checklist with smoke-test scenarios by role;
3. add final responsive polish and accessibility regression checks;
4. align remaining frontend domain modules with backend delivery contracts.
