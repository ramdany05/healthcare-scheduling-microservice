# GraphQL Examples

## Auth Service Examples (Port 3001)

### 1. Register a new user
```graphql
mutation Register {
  register(email: "admin@example.com", password: "password123") {
    id
    email
    createdAt
    updatedAt
  }
}
```

### 2. Login to get access token
```graphql
mutation Login {
  login(email: "admin@example.com", password: "password123") {
    accessToken
    user {
      id
      email
      createdAt
    }
  }
}
```

### 3. Validate token
```graphql
query ValidateToken {
  validateToken(token: "YOUR_ACCESS_TOKEN_HERE") {
    valid
    user {
      id
      email
      createdAt
    }
  }
}
```

---

## Schedule Service Examples (Port 3002)

> **Important**: Add Authorization header for all requests:
> ```
> Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
> ```

### Customer Operations

#### Create Customer
```graphql
mutation CreateCustomer {
  createCustomer(name: "John Doe", email: "john@example.com") {
    id
    name
    email
    createdAt
    updatedAt
  }
}
```

#### List All Customers (with pagination)
```graphql
query Customers {
  customers(page: 1, limit: 10) {
    items {
      id
      name
      email
      createdAt
      updatedAt
    }
    total
    page
    limit
    totalPages
  }
}
```

#### Get Customer by ID
```graphql
query Customer {
  customer(id: "CUSTOMER_UUID") {
    id
    name
    email
    createdAt
    updatedAt
  }
}
```

#### Update Customer
```graphql
mutation UpdateCustomer {
  updateCustomer(id: "CUSTOMER_UUID", name: "John Updated", email: "john.updated@example.com") {
    id
    name
    email
    updatedAt
  }
}
```

#### Delete Customer
```graphql
mutation DeleteCustomer {
  deleteCustomer(id: "CUSTOMER_UUID")
}
```

### Doctor Operations

#### Create Doctor
```graphql
mutation CreateDoctor {
  createDoctor(name: "Dr. Jane Smith") {
    id
    name
    createdAt
    updatedAt
  }
}
```

#### List All Doctors (with pagination)
```graphql
query Doctors {
  doctors(page: 1, limit: 10) {
    items {
      id
      name
      createdAt
      updatedAt
    }
    total
    page
    limit
    totalPages
  }
}
```

#### Get Doctor by ID
```graphql
query Doctor {
  doctor(id: "DOCTOR_UUID") {
    id
    name
    createdAt
    updatedAt
  }
}
```

#### Update Doctor
```graphql
mutation UpdateDoctor {
  updateDoctor(id: "DOCTOR_UUID", name: "Dr. Jane Smith-Updated") {
    id
    name
    updatedAt
  }
}
```

#### Delete Doctor
```graphql
mutation DeleteDoctor {
  deleteDoctor(id: "DOCTOR_UUID")
}
```

### Schedule Operations

#### Create Schedule
```graphql
mutation CreateSchedule {
  createSchedule(
    objective: "General health checkup"
    customerId: "CUSTOMER_UUID"
    doctorId: "DOCTOR_UUID"
    scheduledAt: "2024-02-15T10:00:00.000Z"
  ) {
    id
    objective
    scheduledAt
    createdAt
    customer {
      id
      name
      email
    }
    doctor {
      id
      name
    }
  }
}
```

#### List All Schedules (with pagination)
```graphql
query Schedules {
  schedules(page: 1, limit: 10) {
    items {
      id
      objective
      scheduledAt
      createdAt
      customer {
        id
        name
        email
      }
      doctor {
        id
        name
      }
    }
    total
    page
    limit
    totalPages
  }
}
```

#### Filter Schedules by Customer
```graphql
query SchedulesByCustomer {
  schedules(page: 1, limit: 10, customerId: "CUSTOMER_UUID") {
    items {
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
    total
  }
}
```

#### Filter Schedules by Doctor
```graphql
query SchedulesByDoctor {
  schedules(page: 1, limit: 10, doctorId: "DOCTOR_UUID") {
    items {
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
    total
  }
}
```

#### Get Schedule by ID
```graphql
query Schedule {
  schedule(id: "SCHEDULE_UUID") {
    id
    objective
    scheduledAt
    createdAt
    updatedAt
    customer {
      id
      name
      email
    }
    doctor {
      id
      name
    }
  }
}
```

#### Delete Schedule
```graphql
mutation DeleteSchedule {
  deleteSchedule(id: "SCHEDULE_UUID")
}
```

---

## Complete Workflow Example

### Step 1: Register and Login (Auth Service)
```graphql
# 1. Register
mutation Register {
  register(email: "user@example.com", password: "password123") {
    id
    email
  }
}

# 2. Login - Copy the accessToken from response
mutation Login {
  login(email: "user@example.com", password: "password123") {
    accessToken
    user {
      email
    }
  }
}
```

### Step 2: Create Customer and Doctor (Schedule Service)
```graphql
# Add header: Authorization: Bearer YOUR_TOKEN

# 3. Create Customer
mutation CreateCustomer {
  createCustomer(name: "Alice Johnson", email: "alice@example.com") {
    id
    name
  }
}

# 4. Create Doctor
mutation CreateDoctor {
  createDoctor(name: "Dr. Bob Wilson") {
    id
    name
  }
}
```

### Step 3: Create a Schedule
```graphql
# 5. Create Schedule with customer and doctor IDs from steps 3-4
mutation CreateSchedule {
  createSchedule(
    objective: "Annual health checkup"
    customerId: "CUSTOMER_ID_FROM_STEP_3"
    doctorId: "DOCTOR_ID_FROM_STEP_4"
    scheduledAt: "2024-03-15T14:00:00.000Z"
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

### Step 4: Query Schedules
```graphql
# 6. List all schedules
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
