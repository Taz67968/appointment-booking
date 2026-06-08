import express from 'express';
const router = express.Router();

/* GET users listing. */
router.get("/me", (req, res, next) => {
  logger.info('Fetching current user data for:', req.user);
  return res.json({ user: req.user })
})

export default router