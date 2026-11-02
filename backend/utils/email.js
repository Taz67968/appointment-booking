import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import logger from './logger.js';

// Load .env if present
dotenv.config({ path: new URL('../.env', import.meta.url).pathname });

// Basic environment validation to provide clearer runtime guidance
const requiredEnv = ['SENDGRID_API_KEY', 'EMAIL_FROM'];
const missing = requiredEnv.filter((k) => !process.env[k]);
if (missing.length) {
  logger.warn(`Email environment variables missing: ${missing.join(', ')}. See EMAIL_SETUP.md for configuration steps.`);
}

// Configure SendGrid with API key
const sendgridApiKey = process.env.SENDGRID_API_KEY;
if (sendgridApiKey) {
  sgMail.setApiKey(sendgridApiKey);
  logger.info('SendGrid email service configured with API key');
}

logger.debug('Email config', {
  provider: 'SendGrid',
  apiKey: sendgridApiKey ? sendgridApiKey.slice(0, 8) + '****' : '<<missing>>',
  from: process.env.EMAIL_FROM || '<<missing>>',
});

export async function verifyTransporter() {
  if (!sendgridApiKey) {
    logger.warn('SendGrid API key not configured');
    return false;
  }
  try {
    // SendGrid doesn't have a verify method, but we can check if the API key is valid
    // by making a simple request. For now, we just return true if API key is set.
    logger.info('SendGrid email transporter ready for sending');
    return true;
  } catch (error) {
    logger.warn('Email transporter verification failed:');
    logger.warn(error);
    if (error && error.stack) logger.debug(error.stack);
    return false;
  }
}

export async function sendTestEmail(to) {
  const from = process.env.EMAIL_FROM;
  if (!from) throw new Error('EMAIL_FROM must be set to send test emails');
  const dest = to || from;
  
  const msg = {
    to: dest,
    from: from,
    subject: 'AppointmentHub — Test email',
    text: `This is a test email from AppointmentHub at ${new Date().toISOString()}`,
  };
  
  const [info] = await sgMail.send(msg);
  logger.info('Test email sent:', info && info.messageId);
  return info;
}

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

    const result = await sgMail.send(mailOptions);
    logger.info(`Client confirmation email sent to ${clientEmail}:`, result[0] && result[0].messageId);
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

    const result = await sgMail.send(mailOptions);
    logger.info(`Provider notification email sent to ${providerEmail}:`, result[0] && result[0].messageId);
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

    const result = await sgMail.send(mailOptions);
    logger.info(`Client cancellation email sent to ${clientEmail}:`, result[0] && result[0].messageId);
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

    const result = await sgMail.send(mailOptions);
    logger.info(`Provider cancellation email sent to ${providerEmail}:`, result[0] && result[0].messageId);
    return true;
  } catch (error) {
    logger.error(`Failed to send provider cancellation email to ${providerEmail}:`, error);
    return false;
  }
};
