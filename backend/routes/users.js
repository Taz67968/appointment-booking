import express from 'express';
import logger from '../utils/logger.js';
import { getAllProviders, getProviderTimeslots } from '../controllers/provider-controller.js';
import { query } from '../config/db.js';
import authMiddleware from '../middilewares/authmiddlewares.js';

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

/**
 * PUT /users/profile
 * Update authenticated provider's profile
 */
router.put("/profile", authMiddleware, async (req, res, next) => {
  try {
    const { first_name, last_name, profession, description } = req.body;
    const userId = req.user.id;

    if (!first_name && !last_name && !profession && !description) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (first_name !== undefined) {
      updateFields.push(`first_name = $${paramCount}`);
      updateValues.push(first_name);
      paramCount++;
    }
    if (last_name !== undefined) {
      updateFields.push(`last_name = $${paramCount}`);
      updateValues.push(last_name);
      paramCount++;
    }
    if (profession !== undefined) {
      updateFields.push(`profession = $${paramCount}`);
      updateValues.push(profession);
      paramCount++;
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramCount}`);
      updateValues.push(description);
      paramCount++;
    }

    updateValues.push(userId);

    const result = await query(
      `UPDATE serviceProvider SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING id, first_name, last_name, email, profession, description, role`,
      updateValues
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    logger.info(`Provider profile updated for user ${userId}`);

    res.json({ 
      message: 'Profile updated successfully',
      provider: result.rows[0]
    });
  } catch (error) {
    logger.error('Error updating provider profile:', error);
    next(error);
  }
});

export default router