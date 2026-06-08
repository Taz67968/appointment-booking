import pg from "pg";
import logger from "../utils/logger.js";
import dotenv from 'dotenv'

const { Pool } = pg;

dotenv.config()

const { PGUSER, PGPASSWORD, PGHOST, PGNAME, PGPORT, NODE_ENV } = process.env;

if (!PGHOST || !PGPASSWORD || !PGNAME || !PGUSER || !PGPORT) {
  logger.error(
    "Database environment variables are missing! Check your .env file."
  );
  process.exit(1);
}

const pool = new Pool({
  user: PGUSER,
  host: PGHOST,
  database: PGNAME,
  password: PGPASSWORD,
  port: parseInt(PGPORT, 10),
  connectionTimeoutMillis: 2000,
});

logger.info(`Database is configured for: ${PGNAME}`);

pool.on("connect", (client) => {
  logger.info(`Client connected from Pool (Total count: ${pool.totalCount}`);
});

pool.on("error", (err, client) => {
  logger.error("Unexpected error on idle client in pool", err);
  process.exit(-1);
});
const initialzeDbSchema = async () => {
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
  endTime VARCHAR(50) NOT NULL
);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS appointment ( 
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        owner_id UUID NOT NULL REFERENCES serviceProvider(id),
        clientId UUID NOT NULL REFERENCES client(id),
        timeslot_id UUID NOT NULL REFERENCES timeslot(id),
        status VARCHAR(20) NOT NULL,
        appointment_date DATE NOT NULL
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
  try {
    const client = await pool.connect();
    logger.info(`Database connection pool established successfully`);
    client.release();
  } catch (error) {
    logger.error("Unable to establish database connection pool", error);
    process.exit(1);
  }
};
const query = async (text, params) => {
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
