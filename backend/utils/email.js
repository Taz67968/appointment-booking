import nodemailer from 'nodemailer';
import logger from './logger.js';

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password',
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify connection (optional, for debugging)
transporter.verify((error, success) => {
  if (error) {
    logger.warn('Email transporter verification failed:', error.message);
  } else {
    logger.info('Email transporter ready for sending');
  }
});

/**
 * Send appointment confirmation email to client
 */
export const sendClientConfirmationEmail = async (
  clientEmail,
  clientName,
  providerName,
  profession,
  appointmentDate,
  workingDays,
  startTime,
  endTime,
  calendarAttachment,
  rescheduleReason
) => {
  try {
    const formattedDate = new Date(appointmentDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .details { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 4px; }
            .detail-row { margin: 10px 0; }
            .label { font-weight: bold; color: #667eea; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Appointment Confirmed!</h1>
              <p>Your appointment has been successfully booked</p>
            </div>
            <div class="content">
              <p>Hi ${clientName},</p>
              <p>Your appointment has been confirmed with <strong>${providerName}</strong> (${profession}).</p>
              
              <div class="details">
                <div class="detail-row">
                  <span class="label">📅 Date:</span> ${formattedDate}
                </div>
                <div class="detail-row">
                  <span class="label">🕐 Time:</span> ${startTime} - ${endTime}
                </div>
                <div class="detail-row">
                  <span class="label">📍 Day:</span> ${workingDays}
                </div>
              ${rescheduleReason ? `
              <div class="details" style="margin-top:12px;">
                <div class="detail-row">
                  <span class="label">🔁 Reschedule Reason:</span> ${rescheduleReason}
                </div>
              </div>
              ` : ''}
              </div>

              <p><strong>What's next?</strong></p>
              <ul>
                <li>Check your calendar for the appointment reminder</li>
                <li>Add this to your calendar using the attached .ics file</li>
                <li>Arrive on time for your appointment</li>
              </ul>

              <p>If you need to cancel or reschedule, please log into your account and manage your appointments.</p>

              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="button">View Your Appointments</a>

              <div class="footer">
                <p>AppointmentHub - Professional Appointment Management</p>
                <p>© 2026. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: clientEmail,
      subject: `Appointment Confirmed: ${providerName} - ${formattedDate}`,
      html: htmlContent,
      attachments: calendarAttachment ? [calendarAttachment] : [],
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info(`Client confirmation email sent to ${clientEmail}:`, result.messageId);
    return true;
  } catch (error) {
    logger.error(`Failed to send client confirmation email to ${clientEmail}:`, error);
    return false;
  }
};

/**
 * Send appointment notification email to provider
 */
export const sendProviderNotificationEmail = async (
  providerEmail,
  providerName,
  clientName,
  clientEmail,
  appointmentDate,
  workingDays,
  startTime,
  endTime,
  calendarAttachment,
  rescheduleReason
) => {
  try {
    const formattedDate = new Date(appointmentDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .details { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 4px; }
            .detail-row { margin: 10px 0; }
            .label { font-weight: bold; color: #667eea; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Appointment Booked!</h1>
              <p>You have a new appointment request</p>
            </div>
            <div class="content">
              <p>Hi ${providerName},</p>
              <p><strong>${clientName}</strong> has booked an appointment with you.</p>
              
              <div class="details">
                <div class="detail-row">
                  <span class="label">👤 Client:</span> ${clientName} (${clientEmail})
                </div>
                <div class="detail-row">
                  <span class="label">📅 Date:</span> ${formattedDate}
                </div>
                <div class="detail-row">
                  <span class="label">🕐 Time:</span> ${startTime} - ${endTime}
                </div>
                <div class="detail-row">
                  <span class="label">📍 Day:</span> ${workingDays}
                </div>
              ${rescheduleReason ? `
              <div class="details" style="margin-top:12px;">
                <div class="detail-row">
                  <span class="label">🔁 Reschedule Reason:</span> ${rescheduleReason}
                </div>
              </div>
              ` : ''}
              </div>

              <p><strong>Action Items:</strong></p>
              <ul>
                <li>Add this appointment to your calendar using the attached .ics file</li>
                <li>Prepare for your appointment</li>
                <li>View all your appointments in your dashboard</li>
              </ul>

              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="button">View All Appointments</a>

              <div class="footer">
                <p>AppointmentHub - Professional Appointment Management</p>
                <p>© 2026. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: providerEmail,
      subject: `New Appointment: ${clientName} - ${formattedDate}`,
      html: htmlContent,
      attachments: calendarAttachment ? [calendarAttachment] : [],
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info(`Provider notification email sent to ${providerEmail}:`, result.messageId);
    return true;
  } catch (error) {
    logger.error(`Failed to send provider notification email to ${providerEmail}:`, error);
    return false;
  }
};

/**
 * Send cancellation email to client
 */
export const sendClientCancellationEmail = async (
  clientEmail,
  clientName,
  providerName,
  appointmentDate,
  workingDays,
  startTime,
  endTime
) => {
  try {
    const formattedDate = new Date(appointmentDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f59e0b; color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .details { background: white; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; border-radius: 4px; }
            .detail-row { margin: 10px 0; }
            .label { font-weight: bold; color: #f59e0b; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Appointment Cancelled</h1>
            </div>
            <div class="content">
              <p>Hi ${clientName},</p>
              <p>Your appointment with <strong>${providerName}</strong> has been cancelled.</p>
              
              <div class="details">
                <div class="detail-row">
                  <span class="label">📅 Date:</span> ${formattedDate}
                </div>
                <div class="detail-row">
                  <span class="label">🕐 Time:</span> ${startTime} - ${endTime}
                </div>
                <div class="detail-row">
                  <span class="label">📍 Day:</span> ${workingDays}
                </div>
              </div>

              <p>If you would like to rebook, please visit your dashboard and select another available time slot.</p>

              <div class="footer">
                <p>AppointmentHub - Professional Appointment Management</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: clientEmail,
      subject: `Appointment Cancelled: ${providerName} - ${formattedDate}`,
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info(`Client cancellation email sent to ${clientEmail}:`, result.messageId);
    return true;
  } catch (error) {
    logger.error(`Failed to send client cancellation email to ${clientEmail}:`, error);
    return false;
  }
};

/**
 * Send cancellation email to provider
 */
export const sendProviderCancellationEmail = async (
  providerEmail,
  providerName,
  clientName,
  appointmentDate,
  workingDays,
  startTime,
  endTime
) => {
  try {
    const formattedDate = new Date(appointmentDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f59e0b; color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .details { background: white; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; border-radius: 4px; }
            .detail-row { margin: 10px 0; }
            .label { font-weight: bold; color: #f59e0b; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Appointment Cancelled</h1>
            </div>
            <div class="content">
              <p>Hi ${providerName},</p>
              <p>An appointment with <strong>${clientName}</strong> has been cancelled.</p>
              
              <div class="details">
                <div class="detail-row">
                  <span class="label">📅 Date:</span> ${formattedDate}
                </div>
                <div class="detail-row">
                  <span class="label">🕐 Time:</span> ${startTime} - ${endTime}
                </div>
                <div class="detail-row">
                  <span class="label">📍 Day:</span> ${workingDays}
                </div>
              </div>

              <p>Your time slot is now available for other clients to book.</p>

              <div class="footer">
                <p>AppointmentHub - Professional Appointment Management</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: providerEmail,
      subject: `Appointment Cancelled: ${clientName} - ${formattedDate}`,
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info(`Provider cancellation email sent to ${providerEmail}:`, result.messageId);
    return true;
  } catch (error) {
    logger.error(`Failed to send provider cancellation email to ${providerEmail}:`, error);
    return false;
  }
};
