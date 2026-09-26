# LinkSnip

LinkSnip is a full-stack URL shortening and link management platform designed around a layered backend architecture, versioned REST APIs, relational data modeling, authentication, and maintainable application structure.

The project focuses on building a production-oriented backend rather than implementing URL shortening as a single CRUD operation. It provides a foundation for creating, managing, tracking, and organizing shortened links through a structured API and responsive web interface.

---

## Overview

LinkSnip allows users to create and manage shortened URLs through a centralized link-management platform.

The application is designed with a separation between presentation, API, business logic, and data-access responsibilities.

### Core capabilities

* Create shortened URLs
* Retrieve and manage existing links
* User authentication and authorization
* User-specific link management
* Relational data modeling with PostgreSQL
* RESTful API architecture
* API versioning
* Request validation
* Centralized error handling
* API documentation with Swagger/OpenAPI
* Responsive frontend interface
* Environment-based configuration
* Production-oriented project structure

---

## Architecture

LinkSnip follows a layered architecture to keep HTTP handling, business logic, and persistence concerns separated.

```text
                         Client
                           |
                           v
                    React Frontend
                           |
                           v
                    REST API / v1
                           |
                           v
                    Controllers
                           |
                           v
                     Services
                           |
                           v
                    Data Access
                           |
                           v
                    PostgreSQL
```

### Backend request flow

```text
HTTP Request
     |
     v
Route
     |
     v
Controller
     |
     v
Validation
     |
     v
Service Layer
     |
     v
Repository / Prisma
     |
     v
PostgreSQL
     |
     v
Response
```

The separation allows individual layers to evolve without tightly coupling HTTP concerns with business and persistence logic.

---

## Technology Stack

### Frontend

* React
* TypeScript
* Vite
* Responsive UI

### Backend

* Node.js
* Express
* TypeScript
* REST API
* Prisma ORM

### Database

* PostgreSQL

### API Documentation

* Swagger
* OpenAPI

### Development

* Git
* GitHub
* Environment variables
* REST API testing tools

---

## Project Structure

```text
LinkSnip/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── ...
│   └── ...
│
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── validators/
│   │   ├── repositories/
│   │   └── ...
│   │
│   ├── prisma/
│   │   └── schema.prisma
│   │
│   └── ...
│
├── README.md
└── ...
```

The exact directory structure may evolve as the application grows, but the primary architectural objective is to keep routing, request handling, business logic, validation, and persistence concerns separated.

---

# API Design

The backend exposes versioned REST endpoints under:

```text
/api/v1
```

Versioning the API provides a boundary for future API changes without immediately breaking existing clients.

Example resource structure:

```text
/api/v1/auth
/api/v1/users
/api/v1/links
```

The API follows HTTP semantics for resource creation, retrieval, modification, and deletion.

Typical response categories include:

```text
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
500 Internal Server Error
```

---

# Authentication and Authorization

LinkSnip separates authentication from application-level authorization.

Authenticated requests are associated with a user identity, allowing resources such as links to be managed in the context of their owner.

The authentication layer is responsible for establishing the identity of the caller, while authorization rules determine whether that caller can perform an operation on a particular resource.

This separation prevents controllers from becoming responsible for authentication logic and keeps access-control decisions within the appropriate application layer.

---

# Database Design

PostgreSQL is used as the primary relational database.

Prisma provides the application with a typed interface for interacting with the database while keeping the database schema explicitly represented in the project.

The data model is designed around relationships between users and the resources they own.

Conceptually:

```text
User
 |
 | 1:N
 |
 v
Link
```

This relationship allows a user to own multiple shortened links while each link remains associated with its owner.

Relational constraints are used where appropriate to maintain data integrity at the persistence layer.

---

# Why PostgreSQL?

A relational database was selected because LinkSnip contains entities with explicit relationships and ownership requirements.

PostgreSQL provides:

* Strong relational modeling
* Foreign-key constraints
* Transaction support
* Indexing
* Reliable persistence
* Mature querying capabilities
* Compatibility with Prisma

The choice also leaves room for extending the application with additional relational entities without introducing a separate persistence model.

---

# Prisma

Prisma is used as the ORM/data-access layer between the application and PostgreSQL.

It provides:

* Typed database access
* Schema-based data modeling
* Database migrations
* Explicit relationships
* Type-safe queries

Keeping database access behind the data-access layer prevents database-specific operations from being spread throughout controllers.

---

# Validation

Incoming API requests are validated before reaching business logic.

Validation is important because HTTP requests cannot be assumed to contain valid application data.

The validation layer is responsible for checking requirements such as:

* Required fields
* Input formats
* Invalid values
* Request structure
* Resource-specific constraints

This allows the service layer to operate on validated application data instead of repeatedly performing HTTP-level checks.

---

# Error Handling

LinkSnip uses centralized error-handling principles rather than implementing independent error responses inside every controller.

The backend distinguishes between:

```text
Client Errors
    |
    +-- Invalid request
    +-- Authentication failure
    +-- Authorization failure
    +-- Resource not found
    +-- Conflicting resource

Server Errors
    |
    +-- Unexpected application failure
    +-- Database failure
    +-- Unhandled exception
```

This provides a consistent API response structure and makes debugging easier as the application grows.

---

# API Documentation

The API is documented using Swagger/OpenAPI.

The documentation provides a machine-readable and human-readable description of the available endpoints, request structures, and responses.

This makes it possible to inspect and test the API independently of the frontend.

Example:

```text
Swagger UI
     |
     v
/api/v1/*
     |
     v
Backend REST API
```

---

# Frontend

The frontend is implemented using React and TypeScript.

The frontend communicates with the backend exclusively through the REST API rather than directly accessing the database.

This maintains a clear boundary:

```text
Frontend
   |
   | HTTP
   v
Backend API
   |
   v
Database
```

This separation also allows the API to be consumed by other clients in the future without requiring changes to the underlying persistence layer.

---

# Configuration

Environment-specific configuration is kept outside the source code.

Typical configuration includes:

```env
DATABASE_URL=
PORT=
JWT_SECRET=
```

Sensitive credentials and environment-specific values should not be committed to version control.

A local environment file can be created from the project's example configuration where provided.

---

# Local Development

## Prerequisites

Install the following before running the project:

* Node.js
* npm
* PostgreSQL
* Git

---

## Clone the repository

```bash
git clone <repository-url>

cd LinkSnip
```

---

## Backend setup

```bash
cd server

npm install
```

Create the required environment variables.

Example:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/linksnip"
PORT=5000
JWT_SECRET="your-secret"
```

Generate the Prisma client:

```bash
npx prisma generate
```

Apply the database migrations:

```bash
npx prisma migrate dev
```

Start the development server:

```bash
npm run dev
```

---

## Frontend setup

Open another terminal:

```bash
cd client

npm install

npm run dev
```

The frontend will then communicate with the backend API.

---

# Database Workflow

The development database workflow uses Prisma migrations.

Typical development flow:

```bash
# Modify schema.prisma

npx prisma migrate dev --name <migration-name>

# Regenerate Prisma Client if required
npx prisma generate
```

The migration history provides a reproducible way of evolving the database schema as application requirements change.

---

# Design Decisions

## Layered architecture

Business logic is separated from HTTP-specific concerns.

Instead of placing database queries directly inside route handlers:

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Data Access
  ↓
Database
```

This makes the codebase easier to test, maintain, and extend.

---

## API versioning

The API is exposed under:

```text
/api/v1
```

Versioning establishes an explicit contract between clients and the backend and provides a mechanism for introducing future breaking changes.

---

## Relational persistence

PostgreSQL was selected because users and their managed links naturally form relational data.

The database therefore enforces relationships rather than relying exclusively on application-level assumptions.

---

## TypeScript

TypeScript is used to catch a large class of errors during development and provide stronger contracts between different application layers.

This is particularly useful when working with request objects, service methods, database models, and API responses.

---

# Future Improvements

Potential extensions include:

* Custom aliases for shortened URLs
* Link expiration
* Click analytics
* Geographic analytics
* Device and browser analytics
* Rate limiting
* Redis-based caching
* Background processing for analytics
* Advanced link search and filtering
* Improved observability
* Automated testing and CI/CD
* Additional API clients

These features can be introduced incrementally without changing the fundamental layered architecture.

---

# Engineering Principles

The project follows several core principles:

### Separation of concerns

Each layer has a clearly defined responsibility.

### Explicit API contracts

Endpoints and request/response structures are documented and versioned.

### Database integrity

Relationships and constraints are represented at the database layer where appropriate.

### Centralized error handling

Errors are handled consistently instead of being duplicated throughout controllers.

### Configuration separation

Environment-specific and sensitive configuration is kept outside application source code.

### Maintainability

The codebase is structured so that new functionality can be added without unnecessarily coupling unrelated components.

---

# Project Status

LinkSnip is an actively developed project.

The current implementation focuses on the core URL-shortening and link-management workflow, backend architecture, relational persistence, authentication, API documentation, and frontend integration.

Additional capabilities may be introduced as the project evolves.

---

# Author

**Hephzibah Ranjan**

B.Tech Computer Science and Engineering

Software Engineering | Backend Development | Full-Stack Development

GitHub: `https://github.com/Hephzibah7`

---

# License

This project is intended for educational and portfolio purposes.


# Screenshots


### Swagger

![LinkSnip Swagger](./screenshots/pic7.png)


### Login

![LinkSnip Login](./screenshots/pic2.png)

### Analytics

![LinkSnip Analytics](./screenshots/pic5.png)

![LinkSnip Analytics](./screenshots/pic6.png)

### Create Link

![Create Link](./screenshots/pic4.png)

### Dashboard

![Dashboard](./screenshots/pic3.png)

