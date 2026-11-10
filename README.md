# LocalWorker — Local Services, Simplified.

<p align="center">
  <strong>A Full-Stack Service Booking Platform Connecting Customers with Local Professionals.</strong>
</p>

<p align="center">
  Find trusted local workers, request services, manage bookings, and connect with professionals — all through one platform.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=openjdk" alt="Java 21" />
  <img src="https://img.shields.io/badge/Spring_Boot-4.1.1-6DB33F?style=for-the-badge&logo=springboot" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
</p>

<p align="center">
  <a href="https://workermanagement.vercel.app/">Live Application</a> •
  <a href="https://localworker-backend.onrender.com">Backend</a> •
  <a href="https://github.com/harshal-269/Worker-Management.git">Source Code</a>
</p>

---

## Overview

**LocalWorker** is a full-stack local service booking platform designed to bridge the gap between customers who need everyday services and skilled professionals who provide them.

Finding reliable local service providers can be inconvenient. LocalWorker aims to simplify this experience by bringing customers and workers together through a centralized platform.

Customers can discover services, connect with workers, and manage service bookings. Workers can manage their profiles, showcase their services, and handle incoming booking requests.

The platform also incorporates authentication, role-based access control, booking management, and notifications to support the complete service-booking experience.

> **Project focus:** Building a practical, secure, and maintainable full-stack application using modern Java and React technologies.

## The Problem

Finding dependable local professionals often involves:

- Relying on word-of-mouth recommendations.
- Having difficulty comparing available service providers.
- Managing service requests through calls and messages.
- Lacking a centralized way to track booking status.
- Limited visibility into worker profiles and service information.

## The Solution

LocalWorker provides a centralized platform where:

- Customers can explore services and request bookings.
- Workers can manage their profiles and service offerings.
- Booking requests can be accepted or rejected with a reason.
- Users can track booking information through their dashboards.
- Role-based access ensures users interact with the features intended for them.

---

## Key Features

### Authentication & Security
- User registration and login.
- JWT-based authentication.
- Role-based authorization.
- Google OAuth 2.0 authentication.
- Protected API endpoints.
- Password encryption using Spring Security.

### Customer Features
- Customer dashboard.
- Browse available services and workers.
- Submit service booking requests.
- Track booking information and status.
- View booking rejection reasons.
- Manage customer-related interactions.

### Worker Features
- Dedicated worker dashboard.
- Worker profile management.
- Profile picture upload.
- Manage service offerings.
- Receive and manage booking requests.
- Accept or reject booking requests.
- Provide rejection reasons.

### Booking Management
- Customer-to-worker booking workflow.
- Booking status management.
- Booking request handling.
- Rejection reason management.
- Booking-related notifications.

### Backend Engineering
- RESTful API architecture.
- Layered application structure.
- DTO-based request and response handling.
- Input validation.
- Global exception handling.
- Spring Data JPA integration.
- MySQL persistence.

*Feature availability should be checked against the latest deployed application before publishing this section.*

---

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, TypeScript |
| Build Tool | Vite |
| Backend | Java 21, Spring Boot |
| API | Spring Web, REST |
| Security | Spring Security, JWT, OAuth 2.0 |
| ORM | Spring Data JPA, Hibernate |
| Database | MySQL 8 |
| Validation | Jakarta Bean Validation |
| Build | Maven, npm |
| Version Control | Git, GitHub |
| Deployment | Vercel, Render |

---

## Architecture

LocalWorker follows a **monolithic layered architecture**.

The frontend communicates with the Spring Boot backend through REST APIs. The backend separates responsibilities into controllers, services, repositories, models, DTOs, and exception-handling components.

```text
                 ┌─────────────────────────┐
                 │       React Client      │
                 │     React + TypeScript  │
                 └────────────┬────────────┘
                              │
                         REST API
                              │
                 ┌────────────▼────────────┐
                 │    Spring Boot Backend  │
                 │                         │
                 │  ┌───────────────────┐  │
                 │  │    Controllers   │  │
                 │  └─────────┬─────────┘  │
                 │            │            │
                 │  ┌─────────▼─────────┐  │
                 │  │     Services      │  │
                 │  └─────────┬─────────┘  │
                 │            │            │
                 │  ┌─────────▼─────────┐  │
                 │  │   Repositories    │  │
                 │  └─────────┬─────────┘  │
                 │            │            │
                 │  ┌─────────▼─────────┐  │
                 │  │    Spring Data    │  │
                 │  │       JPA         │  │
                 │  └─────────┬─────────┘  │
                 └────────────┼────────────┘
                              │
                 ┌────────────▼────────────┐
                 │       MySQL Database    │
                 └─────────────────────────┘
```

### Backend Layer Responsibilities

| Layer | Responsibility |
|---|---|
| Controller | Handles HTTP requests and responses |
| Service | Implements business logic |
| Repository | Handles database operations |
| Model | Represents application entities |
| DTO | Transfers structured request and response data |
| Exception | Centralizes application error handling |

---

## Project Structure

```text
LocalWorker/
│
├── backend/
│   ├── src/main/java/com/localworker/backend/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── model/
│   │   ├── dto/
│   │   ├── exception/
│   │   └── ...
│   │
│   ├── src/main/resources/
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   └── ...
│   │
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

---

## Getting Started

Follow these instructions to run LocalWorker locally.

### Prerequisites

Install the following:

- Java 21
- Maven (or use the included Maven Wrapper)
- Node.js and npm
- MySQL 8
- Git

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd Worker-Management
```

### 2. Configure the Database

Create a MySQL database:

```sql
CREATE DATABASE localworker_db;
```

Configure your database connection in the backend application configuration.

**Important:** Never commit actual database passwords, JWT secrets, OAuth client secrets, or other sensitive credentials.

### 3. Run the Backend

```bash
cd backend
mvnw.cmd spring-boot:run
```

On Linux/macOS:

```bash
./mvnw spring-boot:run
```

Backend default address:

```text
http://localhost:8080
```

### 4. Run the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend development address:

```text
http://localhost:5174
```

The actual port depends on the Vite configuration.

---

## API Overview

The backend exposes REST endpoints for authentication, users, workers, services, bookings, and related application operations.

Some known authentication endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Authenticate a user |

Other API groups:

| API Group | Responsibility |
|---|---|
| `/api/users` | User-related operations |
| `/api/workers` | Worker profiles and operations |
| `/api/images` | Image upload and retrieval |
| Booking APIs | Booking lifecycle management |
| Service APIs | Service-related operations |

*Refer to the backend controllers for the complete and current endpoint list.*

---

## Application Screenshots

Screenshots help reviewers understand the actual application without needing to run it.

Add screenshots here after capturing the latest deployed UI.

| Customer Dashboard | Worker Dashboard |
|---|---|
| Add customer dashboard screenshot | Add worker dashboard screenshot |

| Authentication | Worker Profile |
|---|---|
| Add login/register screenshot | Add worker profile screenshot |

---

## Security Considerations

Security is an important part of LocalWorker's backend implementation.

The application incorporates:

- Spring Security for endpoint protection.
- JWT-based authentication.
- Role-based authorization.
- Password hashing.
- Request validation.
- Centralized exception handling.
- Environment-based configuration for sensitive credentials.

Production deployment must use secure secrets, HTTPS, and correctly configured OAuth redirect URLs.

---

## Deployment

The application is deployed using separate frontend and backend hosting services.

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | Configure the production MySQL-compatible database |

**Live Application:** YOUR_LIVE_FRONTEND_URL

**Backend:** YOUR_BACKEND_URL

Deployment availability may depend on the hosting plan and service configuration.

---

## Engineering Highlights

LocalWorker is being developed with an emphasis on practical backend engineering and full-stack development.

Key engineering concepts applied include:

- Layered monolithic architecture.
- REST API design.
- DTO-based data transfer.
- Separation of business logic from controllers.
- JWT authentication and role-based authorization.
- ORM-based database persistence.
- Validation and centralized exception handling.
- React component-based frontend development.
- Integration between independently developed frontend and backend layers.

---

## Future Enhancements

Planned improvements include:

- Complete administrator dashboard and management workflows.
- Advanced worker discovery and filtering.
- Improved reviews and ratings experience.
- Real-time booking updates and notifications.
- More comprehensive automated testing.
- Production-grade persistent file storage.
- Further performance and security improvements.

---

## Contributing

This project is currently maintained as an actively developed software engineering project.

Suggestions, bug reports, and improvement ideas are welcome.

If you find an issue, please open a GitHub issue with the relevant details.

---

## Author

**Harshal Darandale**

Engineering Student | AI & Data Science | Full-Stack Java Developer

- GitHub: https://github.com/harshal-269
- LinkedIn: https://www.linkedin.com/in/harshal-darandale-65a5132b5/
- Portfolio: https://harshal-269.vercel.app

---

<p align="center">
  <strong>LocalWorker — Connecting People. Empowering Local Professionals.</strong>
</p>

<p align="center">
  Built with Java, Spring Boot, React, TypeScript and MySQL.
</p>
