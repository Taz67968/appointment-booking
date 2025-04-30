import { query } from "../config/db.js";
import logger from "../utils/logger.js";
import bcrypt from "bcryptjs";

const HASH_SALT = 10;

export default async function registrationSpHandler(req, res, next) {
  const {
    first_name,
    last_name,
    profession,
    description,
    email,
    password,
    booked,
  } = req.body;

  try {
    const checkQuery = `SELECT email FROM serviceProvider WHERE email = $1`;
    const checkResults = await query(checkQuery, [email]);
    if (checkResults.rows.length > 0) {
      logger.warn(`Registration attempt failed: Email already exists - ${email}`);
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, HASH_SALT);
    logger.debug(`Password hashed for email: ${email}`);

    const insertTable = `
      INSERT INTO serviceProvider (first_name, last_name, email, description, password, profession, booked, confirmpassword )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING "id"
    `;
    
    const newResult = await query(insertTable, [
      first_name,
      last_name,
      email,
      description,
      hashedPassword,
      profession,
      booked,
      hashedPassword,
    ]);
  

    const newProvider = newResult.rows[0];
    logger.info(`Provider registered successfully: ${newProvider.id}`);

    res.status(201).json({
      message: "Provider registered successfully",
      providerId: newProvider.id,
    });
  } catch (error) {
    logger.error(`Error during user registration for ${email}: `, error);
    next(error);
  }
}
