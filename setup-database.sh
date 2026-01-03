#!/bin/bash

# Database Setup Script for Appointment Booking API
# This script helps you set up a local PostgreSQL database

set -e

echo "=========================================="
echo "Appointment Booking API - Database Setup"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}PostgreSQL is not installed.${NC}"
    echo "Please install PostgreSQL first:"
    echo "  Ubuntu/Debian: sudo apt install postgresql postgresql-contrib"
    echo "  macOS: brew install postgresql"
    exit 1
fi

echo -e "${GREEN}✓ PostgreSQL is installed${NC}"

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo -e "${YELLOW}⚠ PostgreSQL service might not be running${NC}"
    echo "Attempting to start PostgreSQL..."
    sudo systemctl start postgresql 2>/dev/null || echo "Please start PostgreSQL manually"
fi

# Database configuration
DB_NAME="appointment_booking"
DB_USER="appointment_user"
DB_PASSWORD="appointment_password"

echo ""
echo "Setting up database: $DB_NAME"
echo "User: $DB_USER"
echo ""

# Check if .env file exists
if [ -f .env ]; then
    echo -e "${YELLOW}⚠ .env file already exists${NC}"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Keeping existing .env file"
        SKIP_ENV=true
    fi
fi

# Create database and user
echo "Creating database and user..."
sudo -u postgres psql <<EOF
-- Create user if not exists
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '$DB_USER') THEN
        CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
    END IF;
END
\$\$;

-- Create database if not exists
SELECT 'CREATE DATABASE $DB_NAME'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database and user created successfully${NC}"
else
    echo -e "${RED}✗ Failed to create database/user${NC}"
    exit 1
fi

# Create .env file
if [ "$SKIP_ENV" != true ]; then
    echo ""
    echo "Creating .env file..."
    cat > .env <<EOF
# Database Configuration
PGUSER=$DB_USER
PGPASSWORD=$DB_PASSWORD
PGHOST=localhost
PGNAME=$DB_NAME
PGPORT=5432

# JWT Configuration
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "change_this_secret_key_in_production")
JWT_EXPIRES_IN=1h

# Environment
NODE_ENV=development
EOF
    echo -e "${GREEN}✓ .env file created${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}Database setup complete!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Review the .env file and update JWT_SECRET if needed"
echo "2. Start your application: npm run dev"
echo "3. The database schema will be created automatically"
echo ""
echo "To test the connection:"
echo "  psql -h localhost -U $DB_USER -d $DB_NAME"
echo ""

