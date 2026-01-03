-- Create database and user for Appointment Booking API
-- Run this as postgres superuser: psql -U postgres -f create-db.sql

-- Create database if not exists
SELECT 'CREATE DATABASE appointment_booking'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'appointment_booking')\gexec

-- Connect to the new database
\c appointment_booking

-- Create user if not exists
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'appointment_user') THEN
        CREATE USER appointment_user WITH PASSWORD 'appointment_password';
    END IF;
END
\$\$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE appointment_booking TO appointment_user;
GRANT ALL ON SCHEMA public TO appointment_user;

-- For existing tables (will be created by the app)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO appointment_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO appointment_user;

