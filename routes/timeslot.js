import express from "express";
import { timeslotValidator } from "../validators/auth-timeslot-validator.js";
import {
  createTimeslotHandler,
  updateTimeslot,
  deleteTimeslot,
  getAllTimeslots,
} from "../controllers/create-timeslot-controller.js";
import authMiddleware from "../middilewares/authmiddlewares.js";

const router = express.Router();
/**
 * @swagger
 *  /timeslot/viewTimeslot:
 *   get:
 *     summary: Retrieve all timeslots for the authenticated provider
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: List of timeslots
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   workingDays:
 *                     type: string
 *                   workingTime:
 *                     type: string
 *       '403':
 *         description: Forbidden access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Access denied"
 */
router.get(
  "/veiwTimeslot",
  authMiddleware,
  getAllTimeslots
);
/**
 * @swagger
 * 
 * /timeslot/createTimeslot:
 *   post:
 *     summary: Create a new timeslot
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               workingDays:
 *                 type: string
 *                 example: "Monday"
 *               workingTime:
 *                 type: string
 *                 example: "09:00:00"
 *             required:
 *               - workingDays
 *               - workingTime
 *     responses:
 *       '201':
 *         description: Timeslot created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Timeslot created successfully"
 *                 id:
 *                   type: string
 *                   format: uuid
 *       '400':
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Missing required fields"
 */

router.post('/createTimeslot',
    authMiddleware,
    timeslotValidator, 
    createTimeslotHandler
  )
/**
 * @swagger
 *   /timeslot/:id/updateTimeslot:
 *   put:
 *     summary: Update an existing timeslot
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               workingDays:
 *                 type: string
 *                 example: "Tuesday"
 *               workingTime:
 *                 type: string
 *                 example: "10:00:00"
 *             required:
 *               - workingDays
 *               - workingTime
 *     responses:
 *       '200':
 *         description: Timeslot updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Timeslot updated successfully"
 *                 updatedTimeslot:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     workingDays:
 *                       type: string
 *                     workingTime:
 *                       type: string
 *       '404':
 *         description: Timeslot not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Timeslot not found"
 *       '403':
 *         description: Access denied
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You don't have permission for this timeslot"
 */
router.put(
  "/:id/updateTimeslot",
  authMiddleware,
  updateTimeslot
);
/**
 * @swagger
 * 
 *   /timeslot/:id/DeleteTimeslot:
 *   delete:
 *     summary: Delete an existing timeslot
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Timeslot deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Timeslot was deleted"
 *       '404':
 *         description: Timeslot not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Timeslot not found"
 *       '403':
 *         description: Access denied
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You do not have permission for this timeslot"
 */
router.delete(
  "/:id/DeleteTimeslot",
  authMiddleware,
  deleteTimeslot
);
export default router;
