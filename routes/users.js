import express from 'express';
import authMiddleware from '../middilewares/authmiddlewares.js';
const router = express.Router();

/* GET users listing. */
router.get("/me", (req, res, next) => {
  logger.info('Fetching current user data for:', req.user);
  return res.json({ user: req.user })
})

export default router