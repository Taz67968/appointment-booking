import { query } from '../config/db.js';
import { pool } from "../config/db.js";
import logger from '../utils/logger.js';
import {
  sendClientConfirmationEmail,
  sendProviderNotificationEmail,
  sendClientCancellationEmail,
  sendProviderCancellationEmail,
} from '../utils/email.js';
import {
  generateAppointmentCalendar,
  generateCancellationCalendar,
} from '../utils/calendar.js';

// Provider: update appointment (reschedule or change timeslot)
export const providerUpdateAppointment = async (req, res) => {
  const providerId = req.user?.id;
  const appointmentId = req.params.id;
  const { timeslot_id: newTimeslotId, appointment_date: newDate } = req.body;

  if (!appointmentId || (!newTimeslotId && !newDate)) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Fetch appointment and ensure provider owns it
    const apptQ = `SELECT id, timeslot_id, owner_id, status FROM appointment WHERE id = $1`;
    const apptRes = await client.query(apptQ, [appointmentId]);
    if (apptRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Appointment not found' });
    }
    const appt = apptRes.rows[0];
    if (String(appt.owner_id) !== String(providerId)) {
      await client.query('ROLLBACK');
      return res.status(403).json({ message: 'Not authorized to modify this appointment' });
    }

    // If changing timeslot, free previous timeslot and reserve new one
    if (newTimeslotId && newTimeslotId !== appt.timeslot_id) {
      // ensure new timeslot exists and belongs to provider
      const tsQ = `SELECT id, owner_id, booked FROM timeslot WHERE id = $1`;
      const tsRes = await client.query(tsQ, [newTimeslotId]);
      if (tsRes.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'New timeslot not found' });
      }
      const newTs = tsRes.rows[0];
      if (String(newTs.owner_id) !== String(providerId)) {
        await client.query('ROLLBACK');
        return res.status(403).json({ message: 'New timeslot does not belong to you' });
      }
      if (newTs.booked === true) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'New timeslot is already booked' });
      }

      // free old timeslot
      await client.query('UPDATE timeslot SET booked = FALSE WHERE id = $1', [appt.timeslot_id]);
      // reserve new timeslot
      await client.query('UPDATE timeslot SET booked = TRUE WHERE id = $1', [newTimeslotId]);
      // update appointment timeslot
      await client.query('UPDATE appointment SET timeslot_id = $1 WHERE id = $2', [newTimeslotId, appointmentId]);
    }

    // update date if provided
    if (newDate) {
      await client.query('UPDATE appointment SET appointment_date = $1 WHERE id = $2', [newDate, appointmentId]);
    }

    await client.query('COMMIT');

    // Fetch updated appointment details
    const appointmentDetailsQuery = `
      SELECT 
        a.id,
        a.appointment_date,
        t.workingDays,
        t.startTime,
        t.endTime,
        c.email as client_email,
        c.first_name as client_first_name,
        c.last_name as client_last_name,
        sp.email as provider_email,
        sp.first_name as provider_first_name,
        sp.last_name as provider_last_name,
        sp.profession
      FROM appointment a
      JOIN timeslot t ON a.timeslot_id = t.id
      JOIN client c ON a.clientid = c.id
      JOIN serviceProvider sp ON a.owner_id = sp.id
      WHERE a.id = $1
    `;
    const appointmentDetails = await query(appointmentDetailsQuery, [appointmentId]);
    const appointmentData = appointmentDetails.rows[0];

    // send updated confirmation with calendar
    const calendarEvent = generateAppointmentCalendar({
      appointmentId: appointmentData.id,
      appointmentDate: appointmentData.appointment_date,
      startTime: appointmentData.startTime,
      endTime: appointmentData.endTime,
      clientName: `${appointmentData.client_first_name} ${appointmentData.client_last_name}`,
      clientEmail: appointmentData.client_email,
      providerName: `${appointmentData.provider_first_name} ${appointmentData.provider_last_name}`,
      providerEmail: appointmentData.provider_email,
      profession: appointmentData.profession,
      workingDays: appointmentData.workingDays,
    });

    const calendarAttachment = calendarEvent ? { filename: calendarEvent.filename, content: calendarEvent.content, contentType: calendarEvent.contentType } : null;

    Promise.all([
      sendClientConfirmationEmail(
        appointmentData.client_email,
        `${appointmentData.client_first_name} ${appointmentData.client_last_name}`,
        `${appointmentData.provider_first_name} ${appointmentData.provider_last_name}`,
        appointmentData.profession,
        appointmentData.appointment_date,
        appointmentData.workingDays,
        appointmentData.startTime,
        appointmentData.endTime,
        calendarAttachment
      ),
      sendProviderNotificationEmail(
        appointmentData.provider_email,
        `${appointmentData.provider_first_name} ${appointmentData.provider_last_name}`,
        `${appointmentData.client_first_name} ${appointmentData.client_last_name}`,
        appointmentData.client_email,
        appointmentData.appointment_date,
        appointmentData.workingDays,
        appointmentData.startTime,
        appointmentData.endTime,
        calendarAttachment
      ),
    ]).catch(err => logger.warn('Reschedule emails failed:', err.message));

    logger.info(`Appointment ${appointmentId} updated by provider ${providerId}`);
    res.json({ message: 'Appointment updated and notifications sent' });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error updating appointment by provider:', error);
    res.status(500).json({ message: 'Server error updating appointment' });
  } finally {
    client.release();
  }
};

// Client: request reschedule (immediately updates if available) with a reason
export const clientUpdateAppointment = async (req, res) => {
  const clientId = req.user?.id;
  const appointmentId = req.params.id;
  const { timeslot_id: newTimeslotId, appointment_date: newDate, reason } = req.body;

  if (!appointmentId || (!newTimeslotId && !newDate)) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Fetch appointment and ensure client owns it
    const apptQ = `SELECT id, timeslot_id, owner_id, clientid, status FROM appointment WHERE id = $1`;
    const apptRes = await client.query(apptQ, [appointmentId]);
    if (apptRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Appointment not found' });
    }
    const appt = apptRes.rows[0];
    if (String(appt.clientid) !== String(clientId)) {
      await client.query('ROLLBACK');
      return res.status(403).json({ message: 'Not authorized to modify this appointment' });
    }

    if (appt.status !== 'booked') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Appointment not in a state that can be rescheduled' });
    }

    // If changing timeslot, free previous timeslot and reserve new one
    if (newTimeslotId && newTimeslotId !== appt.timeslot_id) {
      // ensure new timeslot exists and belongs to same provider
      const tsQ = `SELECT id, owner_id, booked FROM timeslot WHERE id = $1`;
      const tsRes = await client.query(tsQ, [newTimeslotId]);
      if (tsRes.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'New timeslot not found' });
      }
      const newTs = tsRes.rows[0];
      if (String(newTs.owner_id) !== String(appt.owner_id)) {
        await client.query('ROLLBACK');
        return res.status(403).json({ message: 'New timeslot does not belong to the same provider' });
      }
      if (newTs.booked === true) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'New timeslot is already booked' });
      }

      // free old timeslot
      await client.query('UPDATE timeslot SET booked = FALSE WHERE id = $1', [appt.timeslot_id]);
      // reserve new timeslot
      await client.query('UPDATE timeslot SET booked = TRUE WHERE id = $1', [newTimeslotId]);
      // update appointment timeslot
      await client.query('UPDATE appointment SET timeslot_id = $1 WHERE id = $2', [newTimeslotId, appointmentId]);
    }

    // update date if provided
    if (newDate) {
      await client.query('UPDATE appointment SET appointment_date = $1 WHERE id = $2', [newDate, appointmentId]);
    }

    // store reschedule reason if present
    if (reason) {
      await client.query('UPDATE appointment SET reschedule_reason = $1 WHERE id = $2', [reason, appointmentId]);
    }

    await client.query('COMMIT');

    // Fetch updated appointment details
    const appointmentDetailsQuery = `
      SELECT 
        a.id,
        a.appointment_date,
        a.reschedule_reason,
        t.workingDays,
        t.startTime,
        t.endTime,
        c.email as client_email,
        c.first_name as client_first_name,
        c.last_name as client_last_name,
        sp.email as provider_email,
        sp.first_name as provider_first_name,
        sp.last_name as provider_last_name,
        sp.profession
      FROM appointment a
      JOIN timeslot t ON a.timeslot_id = t.id
      JOIN client c ON a.clientid = c.id
      JOIN serviceProvider sp ON a.owner_id = sp.id
      WHERE a.id = $1
    `;
    const appointmentDetails = await query(appointmentDetailsQuery, [appointmentId]);
    const appointmentData = appointmentDetails.rows[0];

    // send updated confirmation with calendar (include reason)
    const calendarEvent = generateAppointmentCalendar({
      appointmentId: appointmentData.id,
      appointmentDate: appointmentData.appointment_date,
      startTime: appointmentData.startTime,
      endTime: appointmentData.endTime,
      clientName: `${appointmentData.client_first_name} ${appointmentData.client_last_name}`,
      clientEmail: appointmentData.client_email,
      providerName: `${appointmentData.provider_first_name} ${appointmentData.provider_last_name}`,
      providerEmail: appointmentData.provider_email,
      profession: appointmentData.profession,
      workingDays: appointmentData.workingDays,
    });

    const calendarAttachment = calendarEvent ? { filename: calendarEvent.filename, content: calendarEvent.content, contentType: calendarEvent.contentType } : null;

    Promise.all([
      sendClientConfirmationEmail(
        appointmentData.client_email,
        `${appointmentData.client_first_name} ${appointmentData.client_last_name}`,
        `${appointmentData.provider_first_name} ${appointmentData.provider_last_name}`,
        appointmentData.profession,
        appointmentData.appointment_date,
        appointmentData.workingDays,
        appointmentData.startTime,
        appointmentData.endTime,
        calendarAttachment,
        appointmentData.reschedule_reason || reason
      ),
      sendProviderNotificationEmail(
        appointmentData.provider_email,
        `${appointmentData.provider_first_name} ${appointmentData.provider_last_name}`,
        `${appointmentData.client_first_name} ${appointmentData.client_last_name}`,
        appointmentData.client_email,
        appointmentData.appointment_date,
        appointmentData.workingDays,
        appointmentData.startTime,
        appointmentData.endTime,
        calendarAttachment,
        appointmentData.reschedule_reason || reason
      ),
    ]).catch(err => logger.warn('Client reschedule emails failed:', err.message));

    logger.info(`Appointment ${appointmentId} updated by client ${clientId}`);
    res.json({ message: 'Appointment rescheduled and notifications sent' });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error updating appointment by client:', error);
    res.status(500).json({ message: 'Server error updating appointment' });
  } finally {
    client.release();
  }
};

// Provider cancels appointment
export const providerCancelAppointment = async (req, res) => {
  const providerId = req.user?.id;
  const { appointmentId } = req.body;

  if (!appointmentId) return res.status(400).json({ message: 'Appointment ID required' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Ensure provider owns the appointment
    const checkQ = `SELECT id, timeslot_id, status, owner_id FROM appointment WHERE id = $1`;
    const checkRes = await client.query(checkQ, [appointmentId]);
    if (checkRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Appointment not found' });
    }
    const appt = checkRes.rows[0];
    if (String(appt.owner_id) !== String(providerId)) {
      await client.query('ROLLBACK');
      return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
    }

    if (appt.status !== 'booked') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Appointment not in cancellable state' });
    }

    await client.query(`UPDATE appointment SET status = 'cancelled' WHERE id = $1`, [appointmentId]);
    await client.query(`UPDATE timeslot SET booked = FALSE WHERE id = $1`, [appt.timeslot_id]);

    await client.query('COMMIT');

    // Fetch appointment details for email
    const appointmentDetailsQuery = `
      SELECT 
        a.id,
        a.appointment_date,
        t.workingDays,
        t.startTime,
        t.endTime,
        c.email as client_email,
        c.first_name as client_first_name,
        c.last_name as client_last_name,
        sp.email as provider_email,
        sp.first_name as provider_first_name,
        sp.last_name as provider_last_name
      FROM appointment a
      JOIN timeslot t ON a.timeslot_id = t.id
      JOIN client c ON a.clientid = c.id
      JOIN serviceProvider sp ON a.owner_id = sp.id
      WHERE a.id = $1
    `;
    const appointmentDetails = await query(appointmentDetailsQuery, [appointmentId]);
    const appointmentData = appointmentDetails.rows[0];

    Promise.all([
      sendClientCancellationEmail(
        appointmentData.client_email,
        `${appointmentData.client_first_name} ${appointmentData.client_last_name}`,
        `${appointmentData.provider_first_name} ${appointmentData.provider_last_name}`,
        appointmentData.appointment_date,
        appointmentData.workingDays,
        appointmentData.startTime,
        appointmentData.endTime
      ),
      sendProviderCancellationEmail(
        appointmentData.provider_email,
        `${appointmentData.provider_first_name} ${appointmentData.provider_last_name}`,
        `${appointmentData.client_first_name} ${appointmentData.client_last_name}`,
        appointmentData.appointment_date,
        appointmentData.workingDays,
        appointmentData.startTime,
        appointmentData.endTime
      ),
    ]).catch(err => logger.warn('Provider cancellation emails failed:', err.message));

    logger.info(`Appointment ${appointmentId} cancelled by provider ${providerId}`);
    res.json({ message: 'Appointment cancelled and notifications sent' });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error cancelling appointment by provider:', error);
    res.status(500).json({ message: 'Server error cancelling appointment' });
  } finally {
    client.release();
  }
};

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

    // Fetch complete appointment details for email
    const appointmentDetailsQuery = `
      SELECT 
        a.id,
        a.appointment_date,
        t.workingDays,
        t.startTime,
        t.endTime,
        c.email as client_email,
        c.first_name as client_first_name,
        c.last_name as client_last_name,
        sp.email as provider_email,
        sp.first_name as provider_first_name,
        sp.last_name as provider_last_name,
        sp.profession
      FROM appointment a
      JOIN timeslot t ON a.timeslot_id = t.id
      JOIN client c ON a.clientid = c.id
      JOIN serviceProvider sp ON a.owner_id = sp.id
      WHERE a.id = $1
    `;
    const appointmentDetails = await query(appointmentDetailsQuery, [appointmentResult.rows[0].id]);
    const appointmentData = appointmentDetails.rows[0];

    // Generate calendar event
    const calendarEvent = generateAppointmentCalendar({
      appointmentId: appointmentData.id,
      appointmentDate: appointmentData.appointment_date,
      startTime: appointmentData.startTime,
      endTime: appointmentData.endTime,
      clientName: `${appointmentData.client_first_name} ${appointmentData.client_last_name}`,
      clientEmail: appointmentData.client_email,
      providerName: `${appointmentData.provider_first_name} ${appointmentData.provider_last_name}`,
      providerEmail: appointmentData.provider_email,
      profession: appointmentData.profession,
      workingDays: appointmentData.workingDays,
    });

    // Convert calendar event to attachment format
    const calendarAttachment = calendarEvent ? {
      filename: calendarEvent.filename,
      content: calendarEvent.content,
      contentType: calendarEvent.contentType,
    } : null;

    // Send emails asynchronously (non-blocking)
    Promise.all([
      sendClientConfirmationEmail(
        appointmentData.client_email,
        `${appointmentData.client_first_name} ${appointmentData.client_last_name}`,
        `${appointmentData.provider_first_name} ${appointmentData.provider_last_name}`,
        appointmentData.profession,
        appointmentData.appointment_date,
        appointmentData.workingDays,
        appointmentData.startTime,
        appointmentData.endTime,
        calendarAttachment
      ),
      sendProviderNotificationEmail(
        appointmentData.provider_email,
        `${appointmentData.provider_first_name} ${appointmentData.provider_last_name}`,
        `${appointmentData.client_first_name} ${appointmentData.client_last_name}`,
        appointmentData.client_email,
        appointmentData.appointment_date,
        appointmentData.workingDays,
        appointmentData.startTime,
        appointmentData.endTime,
        calendarAttachment
      ),
    ]).catch(err => {
      logger.warn('Email sending failed (non-blocking):', err.message);
    });

    logger.info(`Appointment created successfully for client ${clientId}`);
    res.status(201).json({
      message: "Appointment booked successfully. Confirmation email sent.",
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

      // Fetch appointment details for email notification
      const appointmentDetailsQuery = `
        SELECT 
          a.id,
          a.appointment_date,
          t.workingDays,
          t.startTime,
          t.endTime,
          c.email as client_email,
          c.first_name as client_first_name,
          c.last_name as client_last_name,
          sp.email as provider_email,
          sp.first_name as provider_first_name,
          sp.last_name as provider_last_name
        FROM appointment a
        JOIN timeslot t ON a.timeslot_id = t.id
        JOIN client c ON a.clientid = c.id
        JOIN serviceProvider sp ON a.owner_id = sp.id
        WHERE a.id = $1
      `;
      const appointmentDetails = await query(appointmentDetailsQuery, [appointmentId]);
      const appointmentData = appointmentDetails.rows[0];

      // Send cancellation emails asynchronously
      Promise.all([
        sendClientCancellationEmail(
          appointmentData.client_email,
          `${appointmentData.client_first_name} ${appointmentData.client_last_name}`,
          `${appointmentData.provider_first_name} ${appointmentData.provider_last_name}`,
          appointmentData.appointment_date,
          appointmentData.workingDays,
          appointmentData.startTime,
          appointmentData.endTime
        ),
        sendProviderCancellationEmail(
          appointmentData.provider_email,
          `${appointmentData.provider_first_name} ${appointmentData.provider_last_name}`,
          `${appointmentData.client_first_name} ${appointmentData.client_last_name}`,
          appointmentData.appointment_date,
          appointmentData.workingDays,
          appointmentData.startTime,
          appointmentData.endTime
        ),
      ]).catch(err => {
        logger.warn('Cancellation email sending failed (non-blocking):', err.message);
      });

      logger.info(`Appointment ${appointmentId} cancelled by client ${clientId}`);
      res.json({ message: "Appointment cancelled successfully. Notification emails sent." });
  
    } catch (error) {
      await client.query("ROLLBACK");
      logger.error("Error cancelling appointment:", error);
      res.status(500).json({ message: "Server error cancelling appointment" });
    } finally {
      client.release();
    }
  };