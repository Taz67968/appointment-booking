# Database Setup Guide

This guide will help you set up and connect to a PostgreSQL database for the Appointment Booking API.

## Prerequisites

- PostgreSQL installed on your system (version 12 or higher)
- Node.js and npm installed

## Option 1: Local PostgreSQL Database

### Step 1: Install PostgreSQL (if not already installed)

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**macOS (using Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Download and install from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

### Step 2: Start PostgreSQL Service

**Linux:**
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql  # Enable on boot
```

**macOS:**
```bash
brew services start postgresql
```

**Windows:**
PostgreSQL service should start automatically after installation.

### Step 3: Create Database and User

1. **Access PostgreSQL as superuser:**
```bash
sudo -u postgres psql
# Or on macOS/Windows:
psql -U postgres
```

2. **Create a new database:**
```sql
CREATE DATABASE appointment_booking;
```

3. **Create a new user (optional but recommended):**
```sql
CREATE USER appointment_user WITH PASSWORD 'your_secure_password';
```

4. **Grant privileges:**
```sql
GRANT ALL PRIVILEGES ON DATABASE appointment_booking TO appointment_user;
\q
```

### Step 4: Configure Environment Variables

Create a `.env` file in the root of your project:

```bash
cd /home/tazoh-cliff/Desktop/appointment-booking-api
nano .env
```

Add the following configuration:

```env
# Database Configuration (Local)
PGUSER=appointment_user
PGPASSWORD=your_secure_password
PGHOST=localhost
PGNAME=appointment_booking
PGPORT=5432

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=1h

# Environment
NODE_ENV=development
```

**For default postgres user (not recommended for production):**
```env
PGUSER=postgres
PGPASSWORD=postgres
PGHOST=localhost
PGNAME=appointment_booking
PGPORT=5432
```

### Step 5: Test Database Connection

```bash
psql -h localhost -U appointment_user -d appointment_booking
# Enter password when prompted
```

If successful, you should see:
```
appointment_booking=#
```

Type `\q` to exit.

### Step 6: Start Your Application

The database schema will be automatically created when you start the server:

```bash
npm run dev
```

You should see logs indicating:
- Database connection pool established successfully
- Database schema initialized successfully

## Option 2: Remote PostgreSQL Database (Cloud)

If you're using a cloud database service (like Render, Supabase, AWS RDS, etc.):

### Step 1: Get Connection Details

From your cloud provider, get:
- Host (e.g., `dpg-d09vhauuk2gs73erifkg-a.oregon-postgres.render.com`)
- Port (usually `5432`)
- Database name
- Username
- Password

### Step 2: Configure Environment Variables

Create/update your `.env` file:

```env
# Database Configuration (Remote)
PGUSER=your_remote_username
PGPASSWORD=your_remote_password
PGHOST=your-database-host.com
PGNAME=your_database_name
PGPORT=5432

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=1h

# Environment
NODE_ENV=production
```

### Step 3: Test Connection

```bash
psql -h your-database-host.com -U your_remote_username -d your_database_name
```

### Step 4: Start Your Application

```bash
npm run dev
```

## Option 3: Using Docker (Recommended for Development)

### Step 1: Create docker-compose.yml

Create a `docker-compose.yml` file in your project root:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: appointment_booking_db
    environment:
      POSTGRES_USER: appointment_user
      POSTGRES_PASSWORD: appointment_password
      POSTGRES_DB: appointment_booking
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U appointment_user"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

### Step 2: Start PostgreSQL Container

```bash
docker-compose up -d
```

### Step 3: Configure .env

```env
PGUSER=appointment_user
PGPASSWORD=appointment_password
PGHOST=localhost
PGNAME=appointment_booking
PGPORT=5432

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=1h

NODE_ENV=development
```

### Step 4: Start Your Application

```bash
npm run dev
```

## Troubleshooting

### Connection Refused Error

**Problem:** `ECONNREFUSED` or `EAI_AGAIN` errors

**Solutions:**
1. Check if PostgreSQL is running:
   ```bash
   sudo systemctl status postgresql  # Linux
   brew services list  # macOS
   ```

2. Verify the host and port are correct in your `.env` file

3. Check PostgreSQL is listening on the correct port:
   ```bash
   sudo netstat -tlnp | grep 5432
   ```

4. For remote databases, ensure:
   - Firewall allows connections on port 5432
   - Database allows connections from your IP
   - SSL might be required (add `?ssl=true` to connection string)

### Authentication Failed

**Problem:** Password authentication failed

**Solutions:**
1. Verify username and password in `.env` match your database
2. Check `pg_hba.conf` file for authentication method
3. For local connections, try using `trust` authentication temporarily

### Database Does Not Exist

**Problem:** Database not found error

**Solutions:**
1. Create the database manually:
   ```bash
   createdb -U postgres appointment_booking
   ```

2. Or via psql:
   ```sql
   CREATE DATABASE appointment_booking;
   ```

### Permission Denied

**Problem:** Permission denied for table/relation

**Solutions:**
1. Grant necessary permissions:
   ```sql
   GRANT ALL PRIVILEGES ON DATABASE appointment_booking TO your_user;
   GRANT ALL ON SCHEMA public TO your_user;
   ```

2. For existing tables:
   ```sql
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
   ```

## Database Schema

The application automatically creates the following tables:

1. **client** - Stores client user information
2. **serviceProvider** - Stores service provider information
3. **timeslot** - Stores available time slots
4. **appointment** - Stores booked appointments

## Reset Database (Drop and Recreate)

⚠️ **Warning:** This will delete all data!

```bash
# Connect to PostgreSQL
psql -U postgres

# Drop and recreate database
DROP DATABASE IF EXISTS appointment_booking;
CREATE DATABASE appointment_booking;

# Grant permissions (if using a specific user)
GRANT ALL PRIVILEGES ON DATABASE appointment_booking TO appointment_user;
\q
```

Then restart your application - the schema will be recreated automatically.

## Verify Database Setup

After starting your application, you can verify the tables were created:

```bash
psql -h localhost -U appointment_user -d appointment_booking

# List all tables
\dt

# View table structure
\d client
\d serviceProvider
\d timeslot
\d appointment

\q
```

