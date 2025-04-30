import { query } from "../config/db.js";
import logger from "../utils/logger.js";
import bcrypt from "bcryptjs";

const HASH_SALT = 10;

export default async function registrationHandler(req, res, next) {
  const { first_name, last_name, email, password } = req.body;
  try {
    const checkQuery = "SELECT email FROM client WHERE email = $1";
    const CheckResults = await query(checkQuery, [email]);
    if (CheckResults.rows.length > 0) {
      logger.warn(
        `Registration attempt failed: Email already exists - ${email}`
      );
      return res.status(409).json({ message: "Email already in use" });
    }
    const hashPassword = await bcrypt.hash(password, HASH_SALT);
    logger.debug(`Password hashed for email: ${email}`);

    const insertTable = `INSERT INTO client (first_name, last_name, email, password)
                             VALUES($1,$2,$3,$4)
                               RETURNING id`;
    const newResult = await query(insertTable, [
      first_name,
      last_name,
      email,
      hashPassword,
    ]);
    const newClient = newResult.rows[0];
    logger.info(`client registered successfully: ${newClient.id}`);

    res.status(201).json({
      message: "client registered successfully",
      clientid: {
        id: newClient.id
      },
    });
  } catch (error) {
    logger.error(`Error during user registration for ${email}: `, error);
    next(error);
  }
}
