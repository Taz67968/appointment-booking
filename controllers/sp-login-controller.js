import { query } from "../config/db.js";
import logger from "../utils/logger.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default async function providerLoginHandler(req, res, next) {
  const { email, password, role } = req.body;
  try {
    const findProviderSQL = `SELECT id, email, first_name, last_name, password, role FROM serviceProvider WHERE email = $1`;
    const providerResult = await query(findProviderSQL, [email]);
    if (providerResult.rowCount === 0) {
      logger.warn(`Login attempt failed: Provider not found - ${email}`);
      return res.status(401).json({ message: "invalid Credentials" });
    }
    const provider = providerResult.rows[0]
    const passwordMatch = await bcrypt.compare(password, provider.password);
    if (!passwordMatch) {
      logger.warn(`Login attempt failed: Incorrect pasword - ${email}`);
      return res.status(401).json({ message: "Invalid password" });
    }
    const payload = {
      user: {
        id: provider.id,
        email: provider.email,
        role: provider.role,
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
        logger.info(
          `user logged in succesfully: ${email} (ID : ${provider.id})`
        );
        res.json({
          message: "Login Succesfull",
          token: token,
          provider: {
            id: provider.id,
            first_name: provider.first_name,
            last_name: provider.last_name,
            email: provider.email,
            role: provider.role,
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
