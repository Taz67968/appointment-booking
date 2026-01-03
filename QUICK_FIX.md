# Quick Fix for PostgreSQL Authentication

## Problem
Password authentication failed for user "postgres"

## Solution Options (Choose One)

### ✅ Option 1: Use Docker (EASIEST - Recommended)

If you have Docker installed:

```bash
# Start PostgreSQL in Docker
docker-compose up -d

# Wait a few seconds for it to start, then test
psql -h localhost -U appointment_user -d appointment_booking
# Password: appointment_password
```

Your `.env` file should already be configured for this. If not, update it to:
```env
PGUSER=appointment_user
PGPASSWORD=appointment_password
PGHOST=localhost
PGNAME=appointment_booking
PGPORT=5432
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=1h
NODE_ENV=development
```

---

### Option 2: Reset PostgreSQL Password

Run these commands (you'll need sudo password):

```bash
# Connect to PostgreSQL
sudo -u postgres psql
```

Then in the PostgreSQL prompt:
```sql
ALTER USER postgres WITH PASSWORD 'postgres';
CREATE DATABASE appointment_booking;
\q
```

Then update your `.env`:
```env
PGUSER=postgres
PGPASSWORD=postgres
PGHOST=localhost
PGNAME=appointment_booking
PGPORT=5432
```

---

### Option 3: Create Database as Your System User

Try creating the database as your current user:

```bash
createdb appointment_booking
```

If this works, update `.env`:
```env
PGUSER=tazoh-cliff
PGPASSWORD=
PGHOST=localhost
PGNAME=appointment_booking
PGPORT=5432
```

---

### Option 4: Configure Trust Authentication (Development Only)

⚠️ **Warning: Less secure, only for local development**

1. Edit PostgreSQL config:
```bash
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

2. Find and change these lines:
```
# Change from:
local   all             postgres                                peer
host    all             all             127.0.0.1/32            md5

# To:
local   all             postgres                                trust
host    all             all             127.0.0.1/32            trust
```

3. Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

4. Now you can connect without password:
```bash
psql -U postgres -d postgres
CREATE DATABASE appointment_booking;
\q
```

---

## After Setup

1. Test connection:
```bash
psql -h localhost -U your_user -d appointment_booking
```

2. Start your application:
```bash
npm run dev
```

The database tables will be created automatically!

