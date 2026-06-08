import express from "express"
import { cancelAppointment, createAppointment } from "../controllers/appointment-controller.js";
import appointAuth from "../middilewares/appointmentAuth.js";

const router = express.Router();
/**
 * @swagger
 *   /appointment/createAppointment:
 *   post:
 *     summary: Create a new appointment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               timeslot_id:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               appointment_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-05-01"
 *             required:
 *               - timeslot_id
 *               - appointment_date
 *     responses:
 *       '201':
 *         description: Appointment booked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Appointment booked successfully"
 *                 appointment:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *       '400':
 *         description: Invalid or already booked timeslot
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid or already booked timeslot"
 */
router.post("/createAppointment",appointAuth ,createAppointment )
/**
 * @swagger
 *  /appointment/cancelAppointment:
 *   patch:
 *     summary: Cancel an existing appointment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appointmentId:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *             required:
 *               - appointmentId
 *     responses:
 *       '200':
 *         description: Appointment cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Appointment cancelled successfully"
 *       '404':
 *         description: Appointment not found or already cancelled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Appointment not found or already cancelled"
 */
router.patch("/cancelAppointment", appointAuth, cancelAppointment)

export default router