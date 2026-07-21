import { query } from "../config/db.js";
import logger from "../utils/logger.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default async function clientLoginHandler(req, res, next) {
  const { email, password, role } = req.body;
  try {
    const findClientSQL = `SELECT id, email, first_name, last_name, password, role, profile_image FROM client WHERE email = $1`;
    const clientResult = await query(findClientSQL, [email])
    if (clientResult.rowCount === 0) {
      logger.warn(`Login attempt failed: Client not found - ${email}`);
      return res.status(401).json({ message: "invalid Credentials" });
    }
    const client = clientResult.rows[0];
    const passwordMatch = await bcrypt.compare(password, client.password);
    if (!passwordMatch) {
      logger.warn(`Login attempt failed: Incorrect pasword - ${email}`);
      return res.status(401).json({ message: "Invalid password" });
    }
    const payload = {
      user: {
        id: client.id,
        email: client.email,
        role: client.role,
      },
    };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
      (err, token) => {
        if (err) {
          logger.warn(`Error generating JWT for ${email}:`, err);
          throw new Error(`Error grnerating authentication token `);
        }
        logger.info(`user logged in succesfully: ${email} (ID : ${client.id})`);
        res.json({
          message: "Login Succesfull",
          token: token,
          client: {
            id: client.id,
            first_name: client.first_name,
            last_name: client.last_name,
            email: client.email,
            role: client.role,
            profile_image: client.profile_image,
          },
        });
      }
    );
  } catch (error) {
    logger.error(`Error during login process for ${email}: `, error);
    res
      .status(500)
      .json({ message: error.message || "Server error during login" });
  }
}
