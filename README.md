# API Guard 🛡️

> **A Production-Ready API Gateway, Key Management & Real-Time Analytics Platform**

API Guard is a full-stack, enterprise-grade platform that helps engineering teams **monitor, secure, and analyze** their APIs in real time. It handles high-volume API traffic through an asynchronous message queue, gives administrators full control over clients and API keys, and delivers rich analytics through a stunning modern dashboard.

---

## 🔐 Demo Login Credentials

Try the platform instantly — no setup required.

> **Live Demo:** _[Add your deployed URL here]_

| Role | Email | Password |
| :--- | :--- | :--- |
| 🔴 Super Admin | `recruiter@example.com` | `Recruiter@123` |
| 🟢 Client Admin | `user@example.com` | `User@123` |

> **Super Admin** can manage all clients, approve onboarding requests, and view system-wide analytics.
> **Client Admin** can manage their own organization's API keys, users, and analytics.

---

## 📖 Overview

### For Non-Technical Users

Think of API Guard as a **control center for APIs**. APIs are the connectors that allow different software systems to talk to each other. API Guard sits in front of your APIs and:

- 📊 **Tracks every API call** — who called it, how fast it responded, and whether it failed
- 🔑 **Controls who can access your APIs** using secure API keys
- 🚨 **Alerts you to problems** by tracking error rates, slow responses, and unusual activity
- 👥 **Manages organizations** — you can onboard new companies, approve their requests, and give them their own isolated API key management environment

### The Problem It Solves

Engineering teams often have no visibility into how their APIs are performing in production. They don't know which endpoints are slow, which clients are hitting rate limits, or how many requests are failing. API Guard solves this with a centralized, real-time observability and management platform.

---

## ✨ Key Features

### For Administrators (Super Admin)
- **Client Onboarding Workflow** — External teams submit access requests from a public landing page. Admins review and approve with one click, triggering automatic account creation and email delivery of credentials.
- **Multi-Tenant Organization Management** — Manage multiple client organizations, each with their own isolated users, API keys, and analytics.
- **Access Request Management** — Full review, approval, and rejection workflow for new client sign-ups with automatic email notifications.
- **System-Wide Analytics** — View aggregated API metrics across all client organizations.

### For Client Organizations (Client Admin)
- **API Key Management** — Generate, rotate, and revoke API keys with full audit history.
- **Team User Management** — Create and manage user accounts within your organization with role-based permissions (Admin, Viewer).
- **Real-Time Analytics Dashboard** — View endpoint performance, request volume, error rates, latency distributions, and more.
- **API Integration Playground** — Test your API key integration with live code snippets in `cURL`, `JavaScript`, `Python`, and `Go`.

### Technical & Infrastructure Features
- **High-Throughput Async Ingestion** — API hit events are published to a RabbitMQ queue, fully decoupled from the API server response path.
- **Circuit Breaker Pattern** — Prevents cascading failures by opening the circuit after 5 consecutive downstream failures and auto-recovering.
- **Exponential Backoff with Jitter** — Failed message processing is retried with intelligent delay to reduce thundering herd effects.
- **Dead Letter Queue (DLQ)** — Permanently failed messages are routed to `api_hits.dlq` for inspection, preventing silent data loss.
- **Idempotency Guard** — An in-memory cache of the last 100,000 message IDs prevents duplicate event processing on re-delivery.
- **Role-Based Access Control (RBAC)** — Three distinct roles (`super_admin`, `client_admin`, `client_viewer`) with granular permission sets enforced at both route and service layers.
- **Rate Limiting** — Configurable per-window rate limiting on the ingestion endpoint using `express-rate-limit`.
- **Secure Authentication** — JWT-based stateless auth with HTTP-only cookie sessions, bcrypt password hashing, and production-safe CORS configuration.
- **Dual-Database Architecture** — MongoDB for flexible document storage, PostgreSQL for high-speed relational analytics aggregation.
- **Transactional Rollback** — If any step in the approval workflow fails (e.g., email delivery), all created records are automatically rolled back to maintain data consistency.

---

## ⚙️ How It Works

### For Users (Simple Explanation)

1. **A company signs up** on the public landing page by submitting their details.
2. **An admin reviews the request** in the dashboard and clicks "Approve".
3. **An account is automatically created** for the company, and they receive login credentials by email.
4. **The company logs in**, generates an API key, and starts sending API events.
5. **Every API call** their system makes is tracked, measured, and visualized in real time.
6. **The company's engineers** can view performance charts, error breakdowns, and endpoint-level analytics on their dashboard.

### System Data Flow (Technical)

```mermaid
graph TD
    A[External Client App] -->|POST /api/hit + API Key| B[API Guard Express Server]
    C[Dashboard UI] -->|Admin / Analytics APIs| B

    subgraph Backend Processing
        B -->|Validate Key + Auth| D[(MongoDB)]
        B -->|Publish Message| E[[RabbitMQ Queue: api_hits]]
        E -->|Consume Event| F[Processor Consumer Worker]
        F -->|Save Raw Hit Log| D
        F -->|Upsert Aggregated Metrics| G[(PostgreSQL)]
        B -->|Read Analytics| G
    end
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
| :--- | :--- |
| React 18 + Vite | UI framework and build tooling |
| Tailwind CSS v4 | Utility-first styling |
| Framer Motion | Page and component animations |
| Lenis | Smooth scroll behavior |
| Recharts | Analytics charting library |
| React Router v6 | Client-side routing |
| Lucide React | Icon library |

### Backend
| Technology | Purpose |
| :--- | :--- |
| Node.js + Express 5 | REST API server |
| Nodemailer | SMTP email delivery |
| JSON Web Token (JWT) | Stateless authentication |
| bcryptjs | Password hashing |
| Helmet | HTTP security headers |
| express-rate-limit | API rate limiting |
| Zod | Request schema validation |
| Winston | Structured logging |
| UUID | Message ID generation |

### Databases & Infrastructure
| Technology | Purpose |
| :--- | :--- |
| MongoDB + Mongoose | Document storage (users, keys, logs) |
| PostgreSQL + pg | Relational time-bucketed metrics |
| RabbitMQ + amqplib | Message queue and async event processing |
| Docker + Docker Compose | Container orchestration |

---

## 📸 Screenshots

### Landing Page
![Landing Page Screenshot]( )
> *Public-facing marketing page with feature highlights, testimonials, and an onboarding CTA.*

### Login Page
![Login Page Screenshot]( )
> *Clean authentication screen with form validation and role-based redirect logic.*

### Onboarding / Access Request
![Onboarding Screenshot]( )
> *Public sign-up form for new companies to request platform access.*

### Main Dashboard
![Dashboard Screenshot]( )
> *Overview panel with key metric cards showing total requests, active keys, error rate, and avg. latency.*

### Analytics Page
![Analytics Screenshot]( )
> *Interactive line charts and pie charts for time-bucketed request volume, error distribution, and top endpoints.*

### API Key Management
![API Keys Screenshot]( )
> *Interface to generate, rotate, and revoke API keys with copy-to-clipboard functionality.*

### Client Organizations (Super Admin)
![Clients Screenshot]( )
> *Super Admin panel listing all registered client organizations with creation dates and status.*

### Client Detail (Super Admin)
![Client Detail Screenshot]( )
> *Deep-dive view into a single client's users, keys, and configuration.*

### Access Requests (Super Admin)
![Access Requests Screenshot]( )
> *Pending onboarding request queue with approve and reject actions.*

### API Integration Playground
![Playground Screenshot]( )
> *Live code snippet generator with cURL, JavaScript, Python, and Go examples using selected API keys.*

### User Management
![User Management Screenshot]( )
> *Table view of all users within an organization with role management capabilities.*

### Profile Page
![Profile Screenshot]( )
> *User profile editor for updating account details and changing passwords.*

---

## 👔 Recruiter Highlights

### System Design
- **Event-Driven Decoupled Architecture**: The API ingestion path is completely decoupled from processing using RabbitMQ. The API server responds instantly to clients while processing happens asynchronously in the background, enabling horizontal scalability.
- **Multi-Tenant Data Isolation**: Each client organization has its own scoped users, API keys, and analytics, enforced at the database query level.
- **Dual-Database Strategy**: Raw, schema-flexible documents (users, API keys) go to MongoDB. High-speed aggregation queries for the analytics dashboard are served from PostgreSQL using time-bucketed `endpoint_metrics` tables with indexes.

### Fault Tolerance & Resilience
- **Circuit Breaker**: Implemented from scratch without external libraries. Tracks failure counts and automatically stops processing if downstream databases fail, preventing queue flooding and data corruption.
- **Dead Letter Queue (DLQ)**: Messages that fail after max retries (default: 3) are safely parked in `api_hits.dlq` for administrator review, eliminating silent data loss.
- **Transactional Rollback**: The client approval flow (create client → create user → send email) implements a manual rollback mechanism. If email delivery fails, the database records are cleaned up and the request status is reverted, maintaining consistency without distributed transactions.
- **Idempotency Cache**: An in-memory cache prevents the same API hit from being double-counted on RabbitMQ re-delivery.

### Security
- **JWT with HTTP-Only Cookies**: Tokens stored in HTTP-only cookies protect against XSS-based token theft.
- **Bcrypt Password Hashing**: All passwords are hashed with bcrypt (industry standard).
- **Helmet.js**: Adds a comprehensive set of HTTP security headers to all API responses.
- **RBAC at Service Layer**: Permissions are enforced at the service class level, not just routes, preventing bypasses.
- **API Key Validation Middleware**: All ingestion requests are authenticated via an API key lookup against the active keys database.

### Code Quality & Architecture
- **Dependency Injection Pattern**: `ClientService`, `AuthService`, and other services are composed via a DI container in `dependencies.js`, making the code highly testable and loosely coupled.
- **Repository Pattern**: Data access is abstracted behind repository interfaces (`BaseRepository`, `MongoClientRepository`), enabling easy database swapping.
- **Centralized Configuration**: All environment variables are loaded through a single `config/index.js` file with type-parsed defaults, avoiding raw `process.env` scattered throughout the codebase.
- **Structured Winston Logging**: Production logs are written to `combined.log` and `error.log` with consistent JSON structure, timestamps, and console transport for cloud dashboards (Render, etc.).
- **Domain-Driven Folder Structure**: Services are organized by feature domain (`auth/`, `client/`, `ingest/`, `analytics/`, `processor/`), each with its own routes, controller, service, and repository layers.

---

## 🚀 Installation & Setup

### Option 1: Docker Compose (Recommended — 1 Command Start)

This spins up **all infrastructure** automatically: PostgreSQL, MongoDB, RabbitMQ, pgAdmin, the API server, and the consumer worker.

```bash
# 1. Clone the repository
git clone https://github.com/pratham9634/api-guard.git
cd api-guard

# 2. Create the server environment file
cd server
cp .env.example .env     # Then fill in your JWT_SECRET and SMTP credentials

# 3. Start all services
docker compose up --build
```

**Services running after startup:**

| Service | URL |
| :--- | :--- |
| Express API | `http://localhost:5000` |
| Frontend Dashboard | `http://localhost:5173` (run separately) |
| RabbitMQ Management | `http://localhost:15672` (user: `api_guard` / pass: `api_guard_secret`) |
| pgAdmin | `http://localhost:8080` (email: `admin@example.com` / pass: `admin`) |

---

### Option 2: Manual Local Setup

**Prerequisites:** Node.js v18+, MongoDB, PostgreSQL, RabbitMQ

#### Step 1 — Initialize the PostgreSQL Schema
```bash
psql -U postgres -d api_guard -f server/scripts/init-postgress.sql
```

#### Step 2 — Configure Environment Variables
Create `server/.env` with the following:
```env
NODE_ENV=development
PORT=5000

MONGO_URI=mongodb://localhost:27017/api_guard
MONGO_DB_NAME=api_guard

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=api_guard
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password

RABBITMQ_URL=amqp://api_guard:api_guard_secret@localhost:5672/api_guard_vhost
RABBITMQ_QUEUE=api_hits

JWT_SECRET=your_super_secure_secret
JWT_EXPIRES_IN=24h

RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Gmail SMTP (requires an App Password, not your regular password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_char_app_password
```

#### Step 3 — Start the Backend
```bash
cd server
npm install
npm run dev          # Starts the API server on port 5000
```

#### Step 4 — Start the Background Consumer Worker
Open a separate terminal:
```bash
cd server
npm run processor    # Starts the RabbitMQ consumer worker
```

#### Step 5 — Start the Frontend
Open a separate terminal:
```bash
cd client
npm install
npm run dev          # Starts the Vite dev server on port 5173
```

---

## 📡 API Ingestion Reference

Send API hit logs from your external systems using the ingestion endpoint:

**`POST /api/hit`**

| Header | Value | Required |
| :--- | :--- | :--- |
| `Content-Type` | `application/json` | Yes |
| `x-api-key` | Your API Guard API key | Yes |

**Request Body:**
```json
{
  "serviceName": "payment-service",
  "endpoint": "/payments/charge",
  "method": "POST",
  "statusCode": 200,
  "latencyMs": 142.5,
  "timestamp": "2026-06-29T10:00:00Z",
  "clientIp": "192.168.1.55",
  "userAgent": "MyApp/1.0"
}
```

**Response:**
```json
{
  "success": true,
  "message": "API hit ingested successfully",
  "data": { "messageId": "1a2b3c4d-5e6f-7a8b-9c0d-e1f2a3b4c5d6" }
}
```

---

## 🗂️ Repository Structure

```
api-guard/
├── client/                        # React + Vite Frontend
│   └── src/
│       ├── api/                   # Centralized Axios API client
│       ├── components/            # Reusable UI components & route guards
│       │   ├── Layout/            # AppLayout, Sidebar, Header
│       │   ├── ProtectedRoute.jsx # JWT auth-gated route wrapper
│       │   └── RoleGuard.jsx      # Role-based route access control
│       ├── context/               # AuthContext (global auth state)
│       ├── pages/                 # Full page components
│       │   ├── Dashboard.jsx      # Overview metric cards
│       │   ├── Analytics.jsx      # Charts and time-series views
│       │   ├── ApiKeys.jsx        # Key generation and management
│       │   ├── Playground.jsx     # Live code snippet generator
│       │   ├── Clients.jsx        # Multi-tenant client listing
│       │   ├── AccessRequests.jsx # Onboarding request approvals
│       │   └── Users.jsx          # Team user management
│       └── utils/                 # Constants, formatters, helpers
│
└── server/                        # Express API & Consumer Worker
    └── src/
        ├── services/
        │   ├── auth/              # JWT auth, login, registration
        │   ├── client/            # Client & API key management
        │   ├── ingest/            # High-speed hit ingestion endpoint
        │   ├── analytics/         # Dashboard metric query controllers
        │   ├── processor/         # RabbitMQ consumer microservice
        │   └── public/            # Public onboarding access requests
        └── shared/
            ├── config/            # DB connections, logger, central config
            ├── middlewares/       # Auth, API key validation
            ├── models/            # Mongoose schemas
            ├── services/          # Email service (Nodemailer)
            └── utils/             # AppError, SecurityUtils, formatters
```

---

## 🔮 Future Improvements

- [ ] **Webhook Alerts** — Notify teams via webhooks when error rate exceeds a configurable threshold
- [ ] **API Explorer** — Auto-generate OpenAPI/Swagger docs for all registered endpoints
- [ ] **Billing & Usage Limits** — Enforce per-client monthly API call quotas with automated billing events
- [ ] **Multi-Region Support** — Deploy consumer workers regionally to reduce ingestion latency
- [ ] **Grafana Integration** — Export PostgreSQL metrics to Grafana dashboards for power users
- [ ] **CLI Tool** — A command-line tool to manage API keys and view analytics without the dashboard
- [ ] **Two-Factor Authentication (2FA)** — Add TOTP-based 2FA for admin account security
- [ ] **Audit Log** — Persist all admin actions (approve, revoke, delete) to an immutable audit trail

---

## 📄 License

This project is licensed under the **ISC License**.

---

<div align="center">

Built with ❤️ by [Pratham](https://github.com/pratham9634)

⭐ If you find this project useful, give it a star on GitHub!

</div>
