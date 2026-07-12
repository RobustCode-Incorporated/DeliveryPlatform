# DELIVERY PLATFORM
# Au Bois d'Ébène odoo ERM integraation - into Robust Delivery Management Platform

A professional-grade delivery management platform engineered to optimize logistics for the "Au Bois d'Ébène" restaurant. The system facilitates seamless synchronization between Odoo ERP and a dedicated mobile application for delivery drivers, ensuring real-time order tracking and operational efficiency.

---

##  Project Vision
Built using a **Specification-Driven Development** approach and a **Clean Hexagonal Architecture**, this project is designed for long-term maintainability, high testability, and robust integration. Our focus is on delivering a scalable solution that bridges the gap between business processes and technical execution.

##  Tech Stack

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
*   <img width="1470" height="956" alt="image" src="https://github.com/user-attachments/assets/dff53509-ee63-4b16-9cda-ff3ae81d5c9a" />


---

##  Architectural Overview

The system employs a layered structure to ensure technological independence:

1.  **Domain:** Pure business logic, free from framework dependencies.
2.  **Application:** Orchestration of use cases.
3.  **Infrastructure:** Technical implementation (Persistence, Security, Odoo Integration).
4.  **Presentation:** Secure REST API entry points.

---

##  Security & Auth
The system utilizes **JSON Web Tokens (JWT)** with a robust refresh token mechanism, balancing a seamless mobile user experience with high-security standards (Role-Based Access Control - RBAC).

### Prerequisites
*   Java 21
*   Docker & Docker Compose
*   Maven 3.x
---
<img width="1470" height="956" alt="Screenshot 2026-07-12 at 8 23 28 PM" src="https://github.com/user-attachments/assets/2a95da56-7979-42a5-b89c-4936cb3f706b" />


---
PS next part of this project have a frontend part build with ReactTypescript web and mobil app 10% done actually for the web app 
<img width="1470" height="956" alt="Screenshot 2026-07-12 at 8 37 50 PM" src="https://github.com/user-attachments/assets/03fbc91d-f9ec-4e95-9f30-61111e8f3664" />

<img width="1470" height="956" alt="Screenshot 2026-07-13 at 12 07 36 AM" src="https://github.com/user-attachments/assets/af52b109-04ad-4aca-a887-031c5b79c91e" />

<img width="1470" height="956" alt="Screenshot 2026-07-13 at 12 07 27 AM" src="https://github.com/user-attachments/assets/3884b5dc-5469-46e7-b84c-69e4b8699759" />



