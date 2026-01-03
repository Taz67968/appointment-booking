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
      SELECT id, owner_id, booked
      FROM timeslot
      WHERE id = $1
    `;
    const timeslotResult = await query(timeslotCheckQuery, [timeslot_id]);

    if (timeslotResult.rowCount === 0) {
      return res.status(400).json({ message: "Invalid timeslot ID" });
    }

    const timeslot = timeslotResult.rows[0];
    // Check if timeslot is booked (handle NULL as available)
    if (timeslot.booked === true) {
      return res.status(400).json({ message: "Timeslot is already booked" });
    }

    const owner_id = timeslot.owner_id;

    // Check if appointment already exists for this timeslot and date
    const existingAppointment = await pool.query(
      'SELECT * FROM appointment WHERE timeslot_id = $1 AND appointment_date = $2 AND status = $3',
      [timeslot_id, appointment_date, 'booked']
    );
    if (existingAppointment.rows.length > 0) {
      return res.status(409).json({ message: "Time slot already booked for this date" });
    }

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


export const getClientAppointments = async (req, res) => {
  const clientId = req.user.id;

  try {
    const appointmentsQuery = `
      SELECT 
        a.id,
        a.clientid,
        a.timeslot_id,
        a.appointment_date,
        a.status,
        a.owner_id,
        t.workingDays,
        t.startTime,
        t.endTime,
        sp.first_name as provider_first_name,
        sp.last_name as provider_last_name,
        sp.profession
      FROM appointment a
      JOIN timeslot t ON a.timeslot_id = t.id
      JOIN serviceProvider sp ON a.owner_id = sp.id
      WHERE a.clientid = $1
      ORDER BY a.appointment_date DESC, t.startTime ASC
    `;
    
    const appointments = await query(appointmentsQuery, [clientId]);
    
    logger.info(`Retrieved ${appointments.rows.length} appointments for client ${clientId}`);
    res.status(200).json(appointments.rows);
  } catch (error) {
    logger.error("Error fetching client appointments:", error);
    res.status(500).json({ message: "Server error fetching appointments" });
  }
};

export const getProviderAppointments = async (req, res) => {
  const providerId = req.user.id;

  try {
    const appointmentsQuery = `
      SELECT 
        a.id,
        a.clientid,
        a.timeslot_id,
        a.appointment_date,
        a.status,
        a.owner_id,
        t.workingDays,
        t.startTime,
        t.endTime,
        t.booked,
        c.first_name as client_first_name,
        c.last_name as client_last_name,
        c.email as client_email
      FROM appointment a
      JOIN timeslot t ON a.timeslot_id = t.id
      JOIN client c ON a.clientid = c.id
      WHERE a.owner_id = $1
      ORDER BY a.appointment_date DESC, t.startTime ASC
    `;
    
    const appointments = await query(appointmentsQuery, [providerId]);
    
    logger.info(`Retrieved ${appointments.rows.length} appointments for provider ${providerId}`);
    res.status(200).json(appointments.rows);
  } catch (error) {
    logger.error("Error fetching provider appointments:", error);
    res.status(500).json({ message: "Server error fetching appointments" });
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
  
      // Get appointment details including date
      const checkQuery = `
        SELECT timeslot_id, appointment_date, status
        FROM appointment
        WHERE id = $1 AND clientid = $2
      `;
      const checkResult = await client.query(checkQuery, [appointmentId, clientId]);
  
      if (checkResult.rowCount === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ message: "Appointment not found or you don't have permission to cancel it" });
      }

      const appointment = checkResult.rows[0];

      // Check if appointment is already cancelled
      if (appointment.status !== 'booked') {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Appointment is already cancelled or not in a cancellable state" });
      }

      // Optional: Add time restriction (e.g., can't cancel within 24 hours)
      const appointmentDate = new Date(appointment.appointment_date);
      const now = new Date();
      const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      // Uncomment the lines below to enforce 24-hour cancellation policy
      // if (hoursUntilAppointment < 24) {
      //   await client.query("ROLLBACK");
      //   return res.status(400).json({ 
      //     message: "Appointments can only be cancelled at least 24 hours in advance" 
      //   });
      // }
  
      const timeslotId = appointment.timeslot_id;
  
      const cancelQuery = `
        UPDATE appointment SET status = 'cancelled' WHERE id = $1
      `;
      await client.query(cancelQuery, [appointmentId]);
  
      const freeSlotQuery = `
        UPDATE timeslot SET booked = FALSE WHERE id = $1
      `;
      await client.query(freeSlotQuery, [timeslotId]);
  
      await client.query("COMMIT");
      logger.info(`Appointment ${appointmentId} cancelled by client ${clientId}`);
      res.json({ message: "Appointment cancelled successfully" });
  
    } catch (error) {
      await client.query("ROLLBACK");
      logger.error("Error cancelling appointment:", error);
      res.status(500).json({ message: "Server error cancelling appointment" });
    } finally {
      client.release();
    }
  };