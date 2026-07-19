# Healthcare Scheduling System

A microservice-based healthcare scheduling system built with NestJS, GraphQL, Prisma, and PostgreSQL.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Applications                       │
└─────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
        ┌───────────────────┐           ┌───────────────────────────────────┐
        │   Auth Service    │           │        Schedule Service            │
        │   (Port: 3001)    │           │        (Port: 3002)                │
        │                   │           │                                   │
        │ - register        │◄──────────│ - Customer CRUD                   │
        │ - login           │  validate │ - Doctor CRUD                     │
        │ - validateToken   │   token   │ - Schedule CRUD                   │
        └─────────┬─────────┘           │ - Redis Caching                   │
                  │                     │ - Email Notification (Gmail SMTP) │
                  │                     └──────┬──────────────┬─────────────┘
                  │                            │              │
                  ▼                            ▼              ▼
        ┌─────────────────┐          ┌──────────────┐ ┌──────────────┐
        │   PostgreSQL    │          │    Redis      │ │  Gmail SMTP  │
        │ (auth_db +      │          │   (cache)     │ │  (email)     │
        │  schedule_db)   │          └──────────────┘ └──────────────┘
        └─────────────────┘
```

## Tech Stack

| Component      | Technology                          |
|----------------|-------------------------------------|
| Framework      | NestJS                              |
| Database       | PostgreSQL                          |
| API            | GraphQL (code-first with Apollo)    |
| ORM            | Prisma                              |
| Authentication | JWT                                 |
| Caching        | Redis                               |
| Email          | Nodemailer (Gmail SMTP)             |
| Container      | Docker & Docker Compose             |

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development)
- Gmail account with App Password (for email notifications)

### Running with Docker Compose

1. Clone the repository:
```bash
git clone <repository-url>
cd healthcare-scheduling
```

2. Set up Gmail SMTP (for email notifications):
```bash
# Create .env file in schedule-service directory
cat > schedule-service/.env << EOF
SMTP_USER=youraccount@gmail.com
SMTP_PASS=your_app_password
EOF
```

3. Start all services:
```bash
docker compose up -d --build
```

4. Wait for all services to be healthy. You can check the status:
```bash
docker compose ps
```

5. Access GraphQL Playgrounds:
   - Auth Service: http://localhost:3001/graphql
   - Schedule Service: http://localhost:3002/graphql

### Local Development

1. Install dependencies:
```bash
cd auth-service && npm install
cd ../schedule-service && npm install
```

2. Set up PostgreSQL databases locally and Redis

3. Configure environment variables (see `.env.example` in each service)

4. Run migrations:
```bash
cd auth-service && npx prisma migrate dev
cd ../schedule-service && npx prisma migrate dev
```

5. Start services:
```bash
# Terminal 1
cd auth-service && npm run start:dev

# Terminal 2
cd schedule-service && npm run start:dev
```

## Environment Variables

### Auth Service

| Variable        | Description                    | Default                                |
|-----------------|--------------------------------|----------------------------------------|
| DATABASE_URL    | PostgreSQL connection string   | postgresql://postgres:...@postgres:5432/auth_db |
| JWT_SECRET      | Secret key for JWT signing     | (change in production!)                |
| JWT_EXPIRES_IN  | JWT token expiry time          | 24h                                    |
| PORT            | Service port                   | 3001                                   |

### Schedule Service

| Variable          | Description                    | Default                                    |
|-------------------|--------------------------------|--------------------------------------------|
| DATABASE_URL      | PostgreSQL connection string   | postgresql://postgres:...@postgres:5432/schedule_db |
| AUTH_SERVICE_URL  | Auth Service GraphQL endpoint  | http://auth-service:3001/graphql           |
| REDIS_HOST        | Redis host                     | localhost                                  |
| REDIS_PORT        | Redis port                     | 6379                                       |
| SMTP_HOST         | SMTP server host               | smtp.gmail.com                             |
| SMTP_PORT         | SMTP server port               | 587                                        |
| SMTP_USER         | SMTP username (Gmail address)  | (required)                                 |
| SMTP_PASS         | SMTP password (App Password)   | (required)                                 |
| PORT              | Service port                   | 3002                                       |

## GraphQL API Examples

### Auth Service (Port 3001)

#### Register User
```graphql
mutation Register {
  register(email: "user@example.com", password: "password123") {
    id
    email
    createdAt
    updatedAt
  }
}
```

#### Login
```graphql
mutation Login {
  login(email: "user@example.com", password: "password123") {
    accessToken
    user {
      id
      email
    }
  }
}
```

#### Validate Token
```graphql
query ValidateToken {
  validateToken(token: "your-jwt-token-here") {
    valid
    user {
      id
      email
    }
  }
}
```

### Schedule Service (Port 3002)

> Note: All Schedule Service endpoints require Authorization header:
> ```
> Authorization: Bearer <your-jwt-token>
> ```

#### Customer Operations

**Create Customer**
```graphql
mutation CreateCustomer {
  createCustomer(name: "John Doe", email: "john@example.com") {
    id
    name
    email
  }
}
```

**List Customers**
```graphql
query Customers {
  customers(page: 1, limit: 10) {
    items {
      id
      name
      email
    }
    total
    page
    limit
    totalPages
  }
}
```

**Get Customer by ID**
```graphql
query Customer {
  customer(id: "customer-uuid") {
    id
    name
    email
    createdAt
  }
}
```

**Update Customer**
```graphql
mutation UpdateCustomer {
  updateCustomer(id: "customer-uuid", name: "Jane Doe") {
    id
    name
    email
  }
}
```

**Delete Customer**
```graphql
mutation DeleteCustomer {
  deleteCustomer(id: "customer-uuid")
}
```

#### Doctor Operations

**Create Doctor**
```graphql
mutation CreateDoctor {
  createDoctor(name: "Dr. Smith") {
    id
    name
  }
}
```

**List Doctors**
```graphql
query Doctors {
  doctors(page: 1, limit: 10) {
    items {
      id
      name
    }
    total
  }
}
```

**Get Doctor by ID**
```graphql
query Doctor {
  doctor(id: "doctor-uuid") {
    id
    name
    createdAt
  }
}
```

**Update Doctor**
```graphql
mutation UpdateDoctor {
  updateDoctor(id: "doctor-uuid", name: "Dr. Johnson") {
    id
    name
  }
}
```

**Delete Doctor**
```graphql
mutation DeleteDoctor {
  deleteDoctor(id: "doctor-uuid")
}
```

#### Schedule Operations

**Create Schedule**
```graphql
mutation CreateSchedule {
  createSchedule(
    objective: "General checkup"
    customerId: "customer-uuid"
    doctorId: "doctor-uuid"
    scheduledAt: "2024-01-15T10:00:00Z"
  ) {
    id
    objective
    scheduledAt
    customer {
      name
    }
    doctor {
      name
    }
  }
}
```

**List Schedules**
```graphql
query Schedules {
  schedules(page: 1, limit: 10) {
    items {
      id
      objective
      scheduledAt
      customer {
        name
        email
      }
      doctor {
        name
      }
    }
    total
  }
}
```

**Filter Schedules by Customer**
```graphql
query SchedulesByCustomer {
  schedules(page: 1, limit: 10, customerId: "customer-uuid") {
    items {
      id
      objective
      scheduledAt
    }
  }
}
```

**Filter Schedules by Doctor**
```graphql
query SchedulesByDoctor {
  schedules(page: 1, limit: 10, doctorId: "doctor-uuid") {
    items {
      id
      objective
      scheduledAt
    }
  }
}
```

**Get Schedule by ID**
```graphql
query Schedule {
  schedule(id: "schedule-uuid") {
    id
    objective
    scheduledAt
    customer {
      id
      name
    }
    doctor {
      id
      name
    }
  }
}
```

**Delete Schedule**
```graphql
mutation DeleteSchedule {
  deleteSchedule(id: "schedule-uuid")
}
```

## Business Rules

1. **Authentication**: All Schedule Service endpoints require a valid JWT token
2. **Unique Emails**: Customer emails must be unique
3. **Schedule Conflicts**: A doctor cannot have overlapping schedules at the same time
4. **Cascade Delete**: When a customer or doctor is deleted, their associated schedules are also deleted
5. **Redis Caching**: List queries (customers, doctors, schedules) are cached in Redis (TTL: 60s). Cache is invalidated on create/update/delete mutations
6. **Email Notification**: Email sent to customer via Gmail SMTP when a schedule is created or cancelled. Uses configurable HTML templates

## Project Structure

```
healthcare-scheduling/
├── docker-compose.yml
├── README.md
├── graphql-examples.md
├── db/
│   └── init.sql
├── auth-service/
│   ├── Dockerfile
│   ├── docker-entrypoint.sh
│   ├── .env.example
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── auth/
│       ├── prisma/
│       ├── user/
│       ├── app.module.ts
│       └── main.ts
└── schedule-service/
    ├── Dockerfile
    ├── docker-entrypoint.sh
    ├── .env.example
    ├── prisma/
    │   └── schema.prisma
    └── src/
        ├── auth/
        ├── customer/
        ├── doctor/
        ├── email/
        ├── prisma/
        ├── redis/
        ├── schedule/
        ├── app.module.ts
        └── main.ts
```

## Stopping the Services

```bash
docker compose down
```

To remove volumes as well:
```bash
docker compose down -v
```

## License

ISC
