import ical from 'ical';
import logger from './logger.js';

/**
 * Generate iCal calendar event for appointment
 */
export const generateAppointmentCalendar = (appointmentData) => {
  try {
    const {
      appointmentId,
      appointmentDate,
      startTime,
      endTime,
      clientName,
      clientEmail,
      providerName,
      providerEmail,
      profession,
      workingDays,
    } = appointmentData;

    // Validate required time fields
    if (!startTime || !endTime) {
      logger.warn('Missing startTime or endTime for calendar event');
      return null;
    }

    // Parse time (format: "14:30")
    const [startHour, startMin] = startTime.split(':');
    const [endHour, endMin] = endTime.split(':');

    // Create start and end datetime
    const appointmentDateTime = new Date(appointmentDate);
    const startDateTime = new Date(appointmentDateTime);
    startDateTime.setHours(parseInt(startHour), parseInt(startMin), 0, 0);

    const endDateTime = new Date(appointmentDateTime);
    endDateTime.setHours(parseInt(endHour), parseInt(endMin), 0, 0);

    // Create calendar event
    const cal = ical.createCalendar();

    cal.addEvent({
      id: appointmentId,
      title: `Appointment: ${providerName} (${profession})`,
      description: `Appointment with ${providerName}\nProfession: ${profession}\nClient: ${clientName}`,
      start: startDateTime,
      end: endDateTime,
      attendees: [
        {
          email: clientEmail,
          name: clientName,
          role: 'REQ-PARTICIPANT',
        },
        {
          email: providerEmail,
          name: providerName,
          role: 'REQ-PARTICIPANT',
        },
      ],
      organizer: {
        email: providerEmail,
        name: providerName,
      },
      location: 'Online or as arranged',
      status: 'CONFIRMED',
      method: 'PUBLISH',
    });

    const icsContent = cal.toString();
    logger.info(`Calendar event generated for appointment ${appointmentId}`);

    return {
      filename: `appointment-${appointmentId}.ics`,
      content: icsContent,
      contentType: 'text/calendar; charset=utf-8',
    };
  } catch (error) {
    logger.error('Error generating calendar event:', error);
    return null;
  }
};

/**
 * Generate iCal cancellation event
 */
export const generateCancellationCalendar = (appointmentData) => {
  try {
    const {
      appointmentId,
      appointmentDate,
      startTime,
      endTime,
      clientName,
      clientEmail,
      providerName,
      providerEmail,
      profession,
    } = appointmentData;

    // Validate required time fields
    if (!startTime || !endTime) {
      logger.warn('Missing startTime or endTime for cancellation calendar event');
      return null;
    }

    // Parse time (format: "14:30")
    const [startHour, startMin] = startTime.split(':');
    const [endHour, endMin] = endTime.split(':');

    // Create start and end datetime
    const appointmentDateTime = new Date(appointmentDate);
    const startDateTime = new Date(appointmentDateTime);
    startDateTime.setHours(parseInt(startHour), parseInt(startMin), 0, 0);

    const endDateTime = new Date(appointmentDateTime);
    endDateTime.setHours(parseInt(endHour), parseInt(endMin), 0, 0);

    // Create cancellation event
    const cal = ical.createCalendar();

    cal.addEvent({
      id: appointmentId,
      title: `CANCELLED: Appointment with ${providerName}`,
      description: `This appointment has been cancelled.\n\nOriginal appointment: ${providerName}\nProfession: ${profession}`,
      start: startDateTime,
      end: endDateTime,
      attendees: [
        {
          email: clientEmail,
          name: clientName,
        },
        {
          email: providerEmail,
          name: providerName,
        },
      ],
      status: 'CANCELLED',
      method: 'CANCEL',
    });

    const icsContent = cal.toString();
    logger.info(`Cancellation event generated for appointment ${appointmentId}`);

    return {
      filename: `appointment-cancellation-${appointmentId}.ics`,
      content: icsContent,
      contentType: 'text/calendar; charset=utf-8',
    };
  } catch (error) {
    logger.error('Error generating cancellation calendar event:', error);
    return null;
  }
};
