#!/bin/bash

# Fix PostgreSQL Authentication and Create Database
# This script helps set up PostgreSQL for the Appointment Booking API

set -e

echo "=========================================="
echo "PostgreSQL Authentication Setup"
echo "=========================================="
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SYSTEM_USER=$(whoami)
DB_NAME="appointment_booking"
DB_USER="appointment_user"

echo "Current system user: $SYSTEM_USER"
echo ""

# Option 1: Try to create database using system user
echo -e "${YELLOW}Attempting Option 1: Create database as system user...${NC}"
if createdb "$DB_NAME" 2>/dev/null; then
    echo -e "${GREEN}✓ Database created successfully as $SYSTEM_USER${NC}"
    echo ""
    echo "Update your .env file with:"
    echo "  PGUSER=$SYSTEM_USER"
    echo "  PGPASSWORD=(leave empty or set your password)"
    echo "  PGHOST=localhost"
    echo "  PGNAME=$DB_NAME"
    echo "  PGPORT=5432"
    exit 0
fi

echo -e "${YELLOW}Option 1 failed. Trying Option 2...${NC}"
echo ""

# Option 2: Create a new PostgreSQL user matching system user
echo -e "${YELLOW}Attempting Option 2: Create PostgreSQL user matching system user...${NC}"
echo "You'll need to run these commands manually:"
echo ""
echo "1. Connect to PostgreSQL (you may need sudo password):"
echo "   sudo -u postgres psql"
echo ""
echo "2. Then run these SQL commands:"
echo "   CREATE USER $SYSTEM_USER WITH SUPERUSER PASSWORD 'your_password_here';"
echo "   CREATE DATABASE $DB_NAME OWNER $SYSTEM_USER;"
echo "   \\q"
echo ""
echo "3. Update your .env file:"
echo "   PGUSER=$SYSTEM_USER"
echo "   PGPASSWORD=your_password_here"
echo ""

# Option 3: Reset postgres password
echo -e "${YELLOW}Option 3: Reset postgres user password...${NC}"
echo "Run these commands:"
echo ""
echo "1. sudo -u postgres psql"
echo "2. ALTER USER postgres WITH PASSWORD 'new_password';"
echo "3. \\q"
echo ""
echo "Then update .env:"
echo "   PGUSER=postgres"
echo "   PGPASSWORD=new_password"
echo ""

# Option 4: Configure trust authentication for localhost
echo -e "${YELLOW}Option 4: Configure trust authentication (less secure, for development only)...${NC}"
echo ""
echo "1. Edit pg_hba.conf (usually at /etc/postgresql/*/main/pg_hba.conf):"
echo "   sudo nano /etc/postgresql/*/main/pg_hba.conf"
echo ""
echo "2. Find this line:"
echo "   local   all             postgres                                peer"
echo ""
echo "3. Change 'peer' to 'trust' for localhost:"
echo "   local   all             postgres                                trust"
echo "   host    all             all             127.0.0.1/32            trust"
echo ""
echo "4. Restart PostgreSQL:"
echo "   sudo systemctl restart postgresql"
echo ""
echo "5. Then you can connect without password:"
echo "   psql -U postgres -d postgres"
echo "   CREATE DATABASE $DB_NAME;"
echo ""

echo "=========================================="
echo "Recommended: Use Docker (Easiest)"
echo "=========================================="
echo ""
echo "If you have Docker installed, this is the easiest option:"
echo ""
echo "1. docker-compose up -d"
echo "2. Your .env is already configured for Docker"
echo ""

