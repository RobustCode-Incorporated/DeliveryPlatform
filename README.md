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