# API Guard

API Guard is a high-performance, production-ready API gateway security, key management, rate limiting, and analytics aggregation suite. It is designed to ingest high-throughput API hit events asynchronously via RabbitMQ, persist raw events in MongoDB, and store aggregated, time-bucketed analytics in PostgreSQL. The system comes with a modern React dashboard to monitor service performance, manage client organizations, control API keys, and approve/reject onboarding requests.

---

## Table of Contents
1. [Key Features](#key-features)
2. [Architecture Overview](#architecture-overview)
3. [Repository Structure](#repository-structure)
4. [Quick Start (Docker Compose)](#quick-start-docker-compose)
5. [Local Setup Guide (Manual)](#local-setup-guide-manual)
   - [Prerequisites](#prerequisites)
   - [Step 1: Set Up Databases & Message Broker](#step-1-set-up-databases--message-broker)
   - [Step 2: Backend Configuration (.env)](#step-2-backend-configuration-env)
   - [Step 3: Run Backend Server & Consumer Worker](#step-3-run-backend-server--consumer-worker)
   - [Step 4: Run Frontend Dashboard](#step-4-run-frontend-dashboard)
6. [API Integration & Ingestion Reference](#api-integration--ingestion-reference)
7. [System Resilience & Fault Tolerance](#system-resilience--fault-tolerance)
8. [License](#license)

---

## Key Features

- **Asynchronous Ingestion**: Built with RabbitMQ to handle high-throughput incoming API logs without blocking client response times.
- **Dual-Database Persistence**:
  - **MongoDB**: Used for highly flexible document storage (users, client organizations, API keys, raw hit logs, and onboarding requests).
  - **PostgreSQL**: Used for relational time-bucketed aggregation queries (`endpoint_metrics`) for high-speed dashboard analytics.
- **Robust Client & API Key Management**: Built-in support for onboarding new clients, generating keys, rotating/revoking keys, and requesting access.
- **Resilience & Fault Tolerance**:
  - Circuit Breakers in consumer to prevent database flooding if downstream databases are down.
  - Automatic retries with exponential backoff and jitter.
  - DLQ (Dead Letter Queue) routing for persistent failures.
- **Modern Dashboard**: Visually rich dashboard built with React, Vite, Tailwind CSS v4, Framer Motion, Lenis, and Recharts.

---

## Architecture Overview

The system runs in a decoupled architecture where the API Ingestion component publishes hits to a queue, and a background Worker Consumer pulls and processes them.

```mermaid
graph TD
    ClientApp[Client UI Dashboard] -->|Admin APIs| API_Server[API Guard Express Server]
    API_Key_Consumer[External Service Client] -->|POST /api/hit/ with API Key| API_Server
    
    subgraph Storage & Middleware
        API_Server -->|Write/Read Auth, Keys| MongoDB[(MongoDB)]
        API_Server -->|Publish Hit| RabbitMQ[[RabbitMQ Queue: api_hits]]
        
        RabbitMQ -->|Consume Message| Worker[Processor Consumer Worker]
        
        Worker -->|Save Raw Hit log| MongoDB
        Worker -->|Upsert Aggregated Metrics| Postgres[(PostgreSQL)]
        
        API_Server -->|Read Aggregated Metrics| Postgres
    end
```

---

## Repository Structure

```
api_pro/
├── client/                 # React Frontend Dashboard Application
│   ├── src/
│   │   ├── api/            # API communication services (client.js)
│   │   ├── components/     # Reusable layout, routing guards, and UI components
│   │   ├── pages/          # Onboarding, Dashboard, Analytics, API Keys, etc.
│   │   └── utils/          # Constants, formatting helpers
│   ├── package.json        # Frontend scripts and dependencies
│   └── vite.config.js      # Vite build configuration
│
└── server/                 # Express Backend API & Processor Microservice
    ├── src/
    │   ├── services/       # Feature domains
    │   │   ├── auth/       # Authentication, users, registration logic
    │   │   ├── client/     # Client and API key management routes & controllers
    │   │   ├── ingest/     # High-speed ingestion API controllers
    │   │   ├── analytics/  # Dashboard and reporting statistics endpoints
    │   │   └── processor/  # RabbitMQ microservice consumer and processing layer
    │   └── shared/         # DB config, middlewares, events contracts, and loggers
    ├── scripts/            # SQL setup scripts for postgres DB schema
    ├── Dockerfile          # Dockerfile for Express API Server
    ├── Dockerfile.consumer # Dockerfile for Processor Worker Service
    └── docker-compose.yaml # Local development Docker environment orchestrator
```

---

## Quick Start (Docker Compose)

The easiest way to spin up the entire system (including PostgreSQL, MongoDB, RabbitMQ, pgAdmin, the Backend API, and the Consumer Worker) is using Docker Compose.

1. Clone the repository and navigate to the project directory.
2. In the `server` directory, create a `.env` file (or let Docker compose inject defaults, but setting your JWT secret is recommended):
   ```env
   JWT_SECRET=YOUR_SECRET
   ```
3. Run the following command in the `server` directory:
   ```bash
   cd server
   docker compose up --build
   ```
4. This will spin up the following containers:
   - **PostgreSQL**: `localhost:5432` (Auto-initializes table schema using `scripts/init-postgress.sql`)
   - **MongoDB**: `localhost:27017`
   - **RabbitMQ**: Broker at `localhost:5672`, Management Console at `http://localhost:15672` (Username: `api_guard`, Password: `api_guard_secret`)
   - **pgAdmin**: Database management GUI at `http://localhost:8080` (Email: `admin@example.com`, Password: `admin`)
   - **Express API**: Listening on `http://localhost:5000`
   - **Processor Worker**: Actively listening to queue messages
5. Run the frontend client dashboard locally (see [Frontend Setup](#step-4-run-frontend-dashboard)).

---

## Local Setup Guide (Manual)

If you prefer to run the databases, broker, server, and worker manually without Docker:

### Prerequisites
- **Node.js**: `v18.x` or higher installed
- **MongoDB**: Active instance running on `localhost:27017`
- **PostgreSQL**: Active instance running on `localhost:5432`
- **RabbitMQ**: Running broker on `localhost:5672` with a Virtual Host named `api_guard_vhost`

---

### Step 1: Set Up Databases & Message Broker

#### PostgreSQL Schema Initialization
Connect to your PostgreSQL database (default name: `api_guard`) and run the setup script located at `server/scripts/init-postgress.sql`. This creates the `endpoint_metrics` table, indexes, and automatic timestamp triggers:
```bash
psql -U postgres -d api_guard -f server/scripts/init-postgress.sql
```

#### RabbitMQ Configuration
Ensure a Virtual Host named `api_guard_vhost` exists. You can create it using the RabbitMQ CLI:
```bash
rabbitmqctl add_vhost api_guard_vhost
rabbitmqctl set_permissions -p api_guard_vhost guest ".*" ".*" ".*"
```

---

### Step 2: Backend Configuration (.env)

Navigate to the `server/` directory and create a `.env` file containing the environment variables below:

```env
# Application Settings
NODE_ENV=development
PORT=5000

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/api_guard
MONGO_DB_NAME=api_guard

# PostgreSQL Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=api_guard
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_postgres_password

# RabbitMQ Configuration
RABBITMQ_URL=amqp://api_guard:api_guard_secret@localhost:5672/api_guard_vhost
RABBITMQ_QUEUE=api_hits

# Security
JWT_SECRET=YOUR_SUPER_SECURE_JWT_SECRET
JWT_EXPIRES_IN=24h

# Global API Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Gmail SMTP Configuration (For access approvals & onboarding requests)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

---

### Step 3: Run Backend Server & Consumer Worker

1. Navigate to the server folder and install dependencies:
   ```bash
   cd server
   npm install
   ```
2. **Start the API Server**:
   ```bash
   npm run dev
   ```
   *The Express server will start on `http://localhost:5000`.*
3. **Start the Background Message Processor Worker**:
   Open a separate terminal window and run:
   ```bash
   cd server
   npm run processor
   ```
   *The worker will initialize connections, bind to the queue, and await incoming API hit logs.*

---

### Step 4: Run Frontend Dashboard

1. Navigate to the client folder and install dependencies:
   ```bash
   cd client
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *By default, the Vite dev server runs at `http://localhost:5173`.*

---

## API Integration & Ingestion Reference

To log and aggregate API hits from external client systems, send a `POST` request to the ingestion endpoint.

### Request Ingestion Endpoint
`POST http://localhost:5000/api/hit`

#### Headers
| Header | Description | Required |
| :--- | :--- | :--- |
| `Content-Type` | `application/json` | Yes |
| `x-api-key` | Valid client API Key issued by API Guard dashboard | Yes |

#### Request Payload
```json
{
  "serviceName": "PaymentGateway",
  "endpoint": "/payments/charge",
  "method": "POST",
  "statusCode": 200,
  "latencyMs": 142.50,
  "timestamp": "2026-06-28T22:19:36Z",
  "clientIp": "192.168.1.55",
  "userAgent": "Mozilla/5.0..."
}
```

#### Response
```json
{
  "success": true,
  "message": "API hit ingested successfully",
  "data": {
    "messageId": "1a2b3c4d-5e6f-7a8b-9c0d-e1f2a3b4c5d6"
  }
}
```

---

## System Resilience & Fault Tolerance

API Guard is architected to survive infrastructure bottlenecks:

1. **Circuit Breakers**: A circuit breaker intercepts consumer processing. If connection to PostgreSQL or MongoDB fails repeatedly (5 failures threshold), the consumer stops executing writes and requeues messages. It cools down for 30 seconds before attempting a half-open state retry.
2. **Exponential Backoff**: If message processing fails due to temporary connection glitches, the consumer schedules retries utilizing a backoff factor `(delay = baseDelay * (2^retryCount) + jitter)`.
3. **Dead Letter Queue (DLQ)**: If a message fails after maximum retries (default 3) or encounters a non-retryable format validation error, it is automatically routed to `api_hits.dlq` for administrator inspection.
4. **Sliding-Window Idempotency**: The consumer remembers the last `100,000` processed `messageId` keys in an in-memory cache to ensure identical message double-deliveries are skipped safely.

---

## License

This project is licensed under the ISC License. See `server/package.json` for detail.
