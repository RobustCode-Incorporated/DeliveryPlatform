# DELIVERY PLATFORM
# 📦 Au Bois d'Ébène - Delivery Management Platform

A professional-grade delivery management platform engineered to optimize logistics for the "Au Bois d'Ébène" restaurant. The system facilitates seamless synchronization between Odoo ERP and a dedicated mobile application for delivery drivers, ensuring real-time order tracking and operational efficiency.

---

## 🚀 Project Vision
Built using a **Specification-Driven Development** approach and a **Clean Hexagonal Architecture**, this project is designed for long-term maintainability, high testability, and robust integration. Our focus is on delivering a scalable solution that bridges the gap between business processes and technical execution.

## 🛠️ Tech Stack

### Backend
*   **Java 21** & **Spring Boot 3**
*   **Spring Security** & **JWT** (Stateless Authentication)
*   **Spring Data JPA** (Hibernate)
*   **MySQL** with **Flyway** for automated database versioning
*   **Lombok** & **Jakarta Validation**
*   **Swagger/OpenAPI** (Interactive API Documentation)

### Architecture & Methodology
*   **Hexagonal Architecture (Ports & Adapters):** Strict isolation of the core business domain from external frameworks.
*   **Domain-Driven Design (DDD):** Modeling focused on real-world business constraints.
*   **TDD (Test-Driven Development):** Rigorous testing cycles using JUnit 5, Mockito, and MockMvc.
*   **SOLID Principles:** Ensuring a codebase that is clean, maintainable, and modular.

---

## 🏗️ Architectural Overview

The system employs a layered structure to ensure technological independence:

1.  **Domain:** Pure business logic, free from framework dependencies.
2.  **Application:** Orchestration of use cases.
3.  **Infrastructure:** Technical implementation (Persistence, Security, Odoo Integration).
4.  **Presentation:** Secure REST API entry points.

---

## 🔐 Security & Auth
The system utilizes **JSON Web Tokens (JWT)** with a robust refresh token mechanism, balancing a seamless mobile user experience with high-security standards (Role-Based Access Control - RBAC).

## 🖥️ Frontend Progress
The web frontend has started to move from a prototype into a structured application.

Completed so far:
- a reusable authenticated app shell for admin and restaurant users;
- persisted authentication state in `localStorage`;
- role-based redirects after login and from the root route;
- refactored admin and restaurant dashboards to use the shared shell.
- first admin overview slice with restaurant, driver, and order summaries.
- admin search and status filters for restaurants, drivers, and orders.
- admin detail drawer layer for restaurants, drivers, and orders.
- API-backed admin data loading for restaurants, drivers, and orders, plus driver assignment for orders.
- loading/error hardening for admin API failures with retry support.
- Vitest coverage for admin loading, fallback error handling, and assign-driver flow.
- restaurant workflow page with pending orders, workflow actions, drawer details, fallback data, and Vitest coverage.
- restaurant delivery handoff view with status history timeline and backend history endpoint.
- driver delivery dashboard with pickup, transit, and completion actions backed by the delivery contract.
- driver failure-handling flow with reason capture and backend fail-transition endpoint integration.
- global toast notifications and a standardized async error boundary wired across restaurant and driver workflows.
- accessibility hardening for detail drawers with dialog semantics, keyboard escape handling, and focus trap behavior.
- broader restaurant-to-driver lifecycle coverage in frontend workflow tests.

Next frontend step:
- move into release hardening tasks: CI pipeline checks, deployment checklist, and final UX polish.

## 📱 Mobile Progress
The driver mobile application is now initialized as a native Expo project and connected to the backend delivery workflow.

Completed so far:
- Expo driver app scaffold with native iOS and Android projects;
- successful native iOS simulator and Android emulator builds;
- backend login integration with secure session persistence;
- real driver delivery loading and transition actions for pickup, start, complete, and fail flows;
- automatic session-expiry handling on unauthorized API responses;
- first mobile screen split aligned to the approved v1 spec: login, delivery list, and delivery detail;
- offline continuity slice with cached deliveries, persisted pending action queue, replay on refresh/resume, visible pending/offline indicators, and manual retry/discard handling for blocked queue items.

Next mobile step:
- stabilize automated mobile tests and then complete offline conflict and retry UX hardening from the approved spec.

---

## 📊 Roadmap
*   **Sprint 1:** Authentication & Security (JWT).
*   **Sprint 2:** Delivery Management (Mission retrieval).
*   **Sprint 3:** Order Details & Mapping.
*   **Sprint 4:** Delivery Workflows (Accept, En Route, Delivered, Failed).
*   **Sprint 5:** Bidirectional Synchronization with **Odoo ERP**.

---

## 🚀 Getting Started

### Prerequisites
*   Java 21
*   Docker & Docker Compose
*   Maven 3.x

### Setup
1. Clone the repository:
   ```bash
   git clone [YOUR_REPO_URL]

   # 📦 Au Bois d'Ébène - Delivery Management Platform

A professional-grade delivery management platform engineered to optimize logistics for the "Au Bois d'Ébène" restaurant. The system facilitates seamless synchronization between Odoo ERP and a dedicated mobile application for delivery drivers, ensuring real-time order tracking and operational efficiency.

---

## 🚀 Project Vision
Built using a **Specification-Driven Development** approach and a **Clean Hexagonal Architecture**, this project is designed for long-term maintainability, high testability, and robust integration. Our focus is on delivering a scalable solution that bridges the gap between business processes and technical execution.

## 🛠️ Tech Stack

### Backend
*   **Java 21** & **Spring Boot 3**
*   **Spring Security** & **JWT** (Stateless Authentication)
*   **Spring Data JPA** (Hibernate)
*   **MySQL** with **Flyway** for automated database versioning
*   **Lombok** & **Jakarta Validation**
*   **Swagger/OpenAPI** (Interactive API Documentation)

### Architecture & Methodology
*   **Hexagonal Architecture (Ports & Adapters):** Strict isolation of the core business domain from external frameworks.
*   **Domain-Driven Design (DDD):** Modeling focused on real-world business constraints.
*   **TDD (Test-Driven Development):** Rigorous testing cycles using JUnit 5, Mockito, and MockMvc.
*   **SOLID Principles:** Ensuring a codebase that is clean, maintainable, and modular.

---

## 🏗️ Architectural Overview

The system employs a layered structure to ensure technological independence:

1.  **Domain:** Pure business logic, free from framework dependencies.
2.  **Application:** Orchestration of use cases.
3.  **Infrastructure:** Technical implementation (Persistence, Security, Odoo Integration).
4.  **Presentation:** Secure REST API entry points.

---

## 🔐 Security & Auth
The system utilizes **JSON Web Tokens (JWT)** with a robust refresh token mechanism, balancing a seamless mobile user experience with high-security standards (Role-Based Access Control - RBAC).

---

## 📊 Roadmap
*   **Sprint 1:** Authentication & Security (JWT).
*   **Sprint 2:** Delivery Management (Mission retrieval).
*   **Sprint 3:** Order Details & Mapping.
*   **Sprint 4:** Delivery Workflows (Accept, En Route, Delivered, Failed).
*   **Sprint 5:** Bidirectional Synchronization with **Odoo ERP**.

---

## 🚀 Getting Started

### Prerequisites
*   Java 21
*   Docker & Docker Compose
*   Maven 3.x

### Setup
1. Clone the repository:
   ```bash
   git clone [YOUR_REPO_URL]