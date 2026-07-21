import pg from "pg";
import logger from "../utils/logger.js";
import dotenv from 'dotenv'

// Force Node.js to prefer IPv4 addresses for DNS resolution
process.env.NODE_OPTIONS = (process.env.NODE_OPTIONS || '') + ' --dns-result-order=ipv4first';

const { Pool } = pg;

dotenv.config()

// Check for Supabase DATABASE_URL first, fall back to local PG* variables
const DATABASE_URL = process.env.DATABASE_URL;
const { PGUSER, PGPASSWORD, PGHOST, PGNAME, PGPORT, NODE_ENV } = process.env;

let pool;

try {
  if (DATABASE_URL) {
    // Use cloud database (Supabase or Neon)
    let connectionString = DATABASE_URL.trim();
    
    // Handle different SSL requirements
    const isNeon = connectionString.includes('neon.tech');
    const isSupabase = connectionString.includes('supabase.co');
    
    if (isNeon) {
      // Neon requires sslmode=require
      if (!connectionString.includes('sslmode')) {
        connectionString += connectionString.includes('?') ? '&sslmode=require' : '?sslmode=require';
      }
    } else if (isSupabase) {
      // Supabase - add sslmode=no-verify for compatibility
      if (!connectionString.includes('sslmode')) {
        connectionString += connectionString.includes('?') ? '&sslmode=no-verify' : '?sslmode=no-verify';
      }
    }
    
    // Parse connection string to get individual parameters
    const url = new URL(connectionString);
    const host = url.hostname;
    const port = parseInt(url.port || '5432', 10);
    const database = url.pathname.replace('/', '');
    const user = url.username;
    const password = url.password;
    
    pool = new Pool({
      host,
      port,
      database,
      user,
      password,
      connectionTimeoutMillis: 20000,
      idleTimeoutMillis: 10000,
      ssl: isNeon ? { rejectUnauthorized: false } : { rejectUnauthorized: false },
      family: 4  // Force IPv4
    });
    logger.info(`Using cloud database: ${isNeon ? 'Neon' : 'Supabase'}`);
  } else if (PGHOST && PGPASSWORD && PGNAME && PGUSER && PGPORT) {
    // Use local PostgreSQL database
    pool = new Pool({
      user: PGUSER,
      host: PGHOST,
      database: PGNAME,
      password: PGPASSWORD,
      port: parseInt(PGPORT, 10),
      connectionTimeoutMillis: 2000,
    });
    logger.info(`Using local database: ${PGNAME}`);
  } else {
    logger.error(
      "Database configuration is missing! Set DATABASE_URL (Supabase) or PG* variables (local)."
    );
    // Don't throw here - let the app try to start anyway
  }
} catch (poolError) {
  logger.error('Error creating database pool:', poolError);
  // Don't throw - let app try to start
}

pool.on("connect", (client) => {
  logger.info(`Client connected from Pool (Total count: ${pool.totalCount})`);
});

pool.on("error", (err, client) => {
  logger.error("Unexpected error on idle client in pool", err);
  process.exit(-1);
});

const initialzeDbSchema = async () => {
  if (!pool) {
    return;
  }
  const client = await pool.connect();
  try {
    logger.info("Initializing database schema...");

    await client.query("CREATE EXTENSION IF NOT EXISTS pgcrypto");

    await client.query(`
      CREATE TABLE IF NOT EXISTS client (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS serviceProvider (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        profession VARCHAR(50) NOT NULL,
        description VARCHAR(255) NOT NULL,
        booked BOOLEAN DEFAULT FALSE,
        role VARCHAR(50) NOT NULL
      );
    `);

    await client.query(`
     CREATE TABLE IF NOT EXISTS timeslot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES serviceProvider(id),
  workingDays VARCHAR(50) NOT NULL,
  startTime VARCHAR(50) NOT NULL,
  endTime VARCHAR(50) NOT NULL,
  booked BOOLEAN DEFAULT FALSE
);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS appointment ( 
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        owner_id UUID NOT NULL REFERENCES serviceProvider(id),
        clientid UUID NOT NULL REFERENCES client(id),
        timeslot_id UUID NOT NULL REFERENCES timeslot(id),
        status VARCHAR(20) NOT NULL,
        appointment_date DATE NOT NULL
      );
    `);

    // Add reschedule reason column for storing client's reschedule reason
    await client.query(`
      ALTER TABLE appointment
      ADD COLUMN IF NOT EXISTS reschedule_reason TEXT;
    `);

    // Ensure profile image columns exist for clients and providers
    await client.query(`
      ALTER TABLE client
      ADD COLUMN IF NOT EXISTS profile_image VARCHAR(255);
    `);

    // Make description column nullable if it exists (was incorrectly added as NOT NULL)
    await client.query(`
      ALTER TABLE client ALTER COLUMN description DROP NOT NULL;
    `).catch(() => {
      // Ignore if column doesn't exist
    });

    await client.query(`
      ALTER TABLE serviceProvider
      ADD COLUMN IF NOT EXISTS profile_image VARCHAR(255);
    `);

    // Create products table for provider product uploads
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        provider_id UUID NOT NULL REFERENCES serviceProvider(id),
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price NUMERIC,
        currency VARCHAR(10) DEFAULT 'USD',
        image_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create product reviews table
    await client.query(`
      CREATE TABLE IF NOT EXISTS product_reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        client_id UUID NOT NULL REFERENCES client(id) ON DELETE CASCADE,
        rating INTEGER,
        comment TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE (product_id, client_id)
      );
    `);

    logger.info("Database schema initialized successfully");
  } catch (error) {
    logger.error("Error during schema initialization:", {
      error: error.message,
      stack: error.stack,
      query: error.query,
    });
    throw error;
  } finally {
    client.release();
  }
};

const connectToDb = async () => {
  if (!pool) {
    return;
  }
  try {
    const client = await pool.connect();
    
    // Test the connection with a simple query
    await client.query('SELECT 1');
    
    logger.info(`Database connection pool established successfully`);
    client.release();
  } catch (error) {
    logger.error("Unable to establish database connection pool", error);
    logger.error('Database connection error:', error.message);
  }
};

const query = async (text, params) => {
  if (!pool) {
    throw new Error('Database pool not initialized - no database configuration');
  }
  const start = Date.now();
  try {
    const response = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.info(
      `Executed query: { text: ${text.substring(
        0,
        100
      )}..., params: ${JSON.stringify(
        params
      )}, duration: ${duration}ms, rows: ${response.rowCount}}`
    );
    return response;
  } catch (error) {
    logger.error(
      `Error executing query: { text: ${text.substring(
        0,
        100
      )}..., params: ${JSON.stringify(params)}, error: ${error.message}}`
    );
    throw error;
  }
};

export { pool, connectToDb, query, initialzeDbSchema };
