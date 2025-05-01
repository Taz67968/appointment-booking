import { query } from '../config/db.js';
import { pool } from "../config/db.js";
import logger from '../utils/logger.js';

export const createAppointment = async (req, res) => {
  const clientId = req.user.id;
  const { timeslot_id, appointment_date } = req.body;

  try {
    if (!clientId || !timeslot_id || !appointment_date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const timeslotCheckQuery = `
      SELECT id, owner_id
      FROM timeslot
      WHERE id = $1 AND booked = FALSE
    `;
    const timeslotResult = await query(timeslotCheckQuery, [timeslot_id]);

    if (timeslotResult.rowCount === 0) {
      return res.status(400).json({ message: "Invalid or already booked timeslot" });
    }

    const owner_id = timeslotResult.rows[0].owner_id;

    const insertAppointmentQuery = `
      INSERT INTO appointment (clientid, timeslot_id, status, appointment_date, owner_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const appointmentResult = await query(insertAppointmentQuery, [
      clientId,
      timeslot_id,
      "booked",
      appointment_date,
      owner_id,
    ]);

    const updateTimeslotQuery = `
      UPDATE timeslot
      SET booked = TRUE
      WHERE id = $1
    `;
    await query(updateTimeslotQuery, [timeslot_id]);

    logger.info(`Appointment created successfully for client ${clientId}`);
    res.status(201).json({
      message: "Appointment booked successfully",
      appointment: appointmentResult.rows[0],
    });

  } catch (error) {
    logger.error("Error booking appointment:", error);
    res.status(500).json({ message: "Server error booking appointment" });
  }
};


export const cancelAppointment = async (req, res) => {
    const clientId = req.user?.id;
    const { appointmentId } = req.body;
  
    if (!appointmentId) {
      return res.status(400).json({ message: "Appointment ID is required" });
    }
  
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
  
      const checkQuery = `
        SELECT timeslot_id FROM appointment
        WHERE id = $1 AND clientId = $2 AND status = 'booked'
      `;
      const checkResult = await client.query(checkQuery, [appointmentId, clientId]);
  
      if (checkResult.rowCount === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ message: "Appointment not found or already cancelled" });
      }
  
      const timeslotId = checkResult.rows[0].timeslot_id;
  
      const cancelQuery = `
        UPDATE appointment SET status = 'cancelled' WHERE id = $1
      `;
      await client.query(cancelQuery, [appointmentId]);
  
      const freeSlotQuery = `
        UPDATE timeslot SET booked = FALSE WHERE id = $1
      `;
      await client.query(freeSlotQuery, [timeslotId]);
  
      await client.query("COMMIT");
      res.json({ message: "Appointment cancelled successfully" });
  
    } catch (error) {
      await client.query("ROLLBACK");
      logger.error("Error cancelling appointment:", error);
      res.status(500).json({ message: "Server error cancelling appointment" });
    } finally {
      client.release();
    }
  };