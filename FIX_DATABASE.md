# Fix Database Connection Issue

## Current Problem
You're getting `EAI_AGAIN` error trying to connect to `dpg-d09vhauuk2gs73erifkg-a` which appears to be an incomplete Render.com database hostname.

## Quick Fix: Use Local Database

### Step 1: Create the Database

**Option A: Using the SQL script (Recommended)**
```bash
sudo -u postgres psql -f create-db.sql
```

**Option B: Manual creation**
```bash
sudo -u postgres psql
```

Then run:
```sql
CREATE DATABASE appointment_booking;
\q
```

**Option C: Using createdb command**
```bash
sudo -u postgres createdb appointment_booking
```

### Step 2: Verify .env File

Your `.env` file should have:
```env
PGUSER=postgres
PGPASSWORD=postgres
PGHOST=localhost
PGNAME=appointment_booking
PGPORT=5432

JWT_SECRET=your_generated_secret
JWT_EXPIRES_IN=1h

NODE_ENV=development
```

**Note:** If your PostgreSQL password is different, update `PGPASSWORD` in `.env`.

### Step 3: Test Connection

```bash
psql -h localhost -U postgres -d appointment_booking
```

If it asks for a password and you don't know it, you may need to:
1. Reset PostgreSQL password, OR
2. Use a different user, OR
3. Configure PostgreSQL to allow local connections without password

### Step 4: Start Your Application

```bash
npm run dev
```

The database schema (tables) will be created automatically.

---

## Alternative: Fix Remote Database Connection

If you want to use the Render.com database instead:

### Step 1: Get Complete Connection String

The hostname `dpg-d09vhauuk2gs73erifkg-a` is incomplete. The full hostname should be something like:
- `dpg-d09vhauuk2gs73erifkg-a.oregon-postgres.render.com`
- Or check your Render dashboard for the complete connection string

### Step 2: Update .env File

```env
# Database Configuration (Remote - Render.com)
PGUSER=your_render_username
PGPASSWORD=your_render_password
PGHOST=dpg-d09vhauuk2gs73erifkg-a.oregon-postgres.render.com
PGNAME=appointment_ouji
PGPORT=5432

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=1h

# Environment
NODE_ENV=production
```

### Step 3: Test Remote Connection

```bash
psql -h dpg-d09vhauuk2gs73erifkg-a.oregon-postgres.render.com -U your_username -d appointment_ouji
```

**Note:** Remote databases often require:
- SSL connection (add `?sslmode=require` or configure SSL in connection)
- Whitelisted IP addresses
- Correct credentials from your Render dashboard

---

## Troubleshooting

### "Password authentication failed"
- Verify the password in `.env` matches your PostgreSQL password
- For local: Try resetting PostgreSQL password or use `trust` authentication for localhost

### "Database does not exist"
- Create it using one of the methods above
- Verify `PGNAME` in `.env` matches the actual database name

### "Connection refused" or "EAI_AGAIN"
- **For local:** Ensure PostgreSQL is running: `sudo systemctl status postgresql`
- **For remote:** Check hostname is complete and correct
- Verify network connectivity: `ping your-database-host.com`
- Check firewall settings

### "Role does not exist"
- Create the user: `CREATE USER postgres WITH PASSWORD 'your_password';`
- Or use an existing user

---

## Recommended: Use Local Database for Development

For development, using a local database is:
- ✅ Faster
- ✅ No network dependency
- ✅ Free
- ✅ Easier to debug
- ✅ Can reset easily

You can always switch to remote database for production later.

