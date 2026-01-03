import express from 'express';
import logger from '../utils/logger.js';
import { getAllProviders, getProviderTimeslots } from '../controllers/provider-controller.js';

const router = express.Router();

/* GET users listing. */
router.get("/me", (req, res, next) => {
  logger.info('Fetching current user data for:', req.user);
  return res.json({ user: req.user })
})

/**
 * @swagger
 *   /users/providers:
 *   get:
 *     summary: Get all service providers (public endpoint)
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search providers by name, profession, or description
 *       - in: query
 *         name: profession
 *         schema:
 *           type: string
 *         description: Filter by profession
 *     responses:
 *       '200':
 *         description: List of providers
 */
router.get("/providers", getAllProviders);

/**
 * @swagger
 *   /users/providers/:providerId/timeslots:
 *   get:
 *     summary: Get available timeslots for a provider (public endpoint)
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Provider info and available timeslots
 *       '404':
 *         description: Provider not found
 */
router.get("/providers/:providerId/timeslots", getProviderTimeslots);

export default router