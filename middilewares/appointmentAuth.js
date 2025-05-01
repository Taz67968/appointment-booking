import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";

const appointAuth = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    logger.warn(`No auth token provided`);
    return res.status(401).json({ message: "Authorization denied, no token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure payload structure: { user: { id: ... } }
    if (!decoded.user || !decoded.user.id) {
      return res.status(401).json({ message: "Token payload malformed or missing user ID" });
    }

    req.user = decoded.user;
    logger.debug(`Authorization approved for user ${req.user.id}`);
    next();
  } catch (error) {
    logger.error("Auth middleware: token verification failed", error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token is expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token is not valid" });
    }
    return res.status(500).json({ message: "Server error during token verification" });
  }
};

export default appointAuth;
