# Email & Calendar Integration Setup Guide

This appointment booking system now includes automatic email notifications and calendar invitations when appointments are booked or cancelled.

## Features

✅ **Appointment Confirmation Emails** - Sent to both client and provider when an appointment is booked  
✅ **Calendar Invitations (.ics files)** - Attached to emails for easy calendar integration  
✅ **Cancellation Notifications** - Both parties receive emails when appointments are cancelled  
✅ **Professional HTML Email Templates** - Beautiful, responsive email designs  

## Setup Instructions

### 1. Configure Email Service

The system supports SMTP-based email services. We recommend **Gmail** for easy setup.

#### Option A: Gmail with App Password (Recommended)

1. **Enable 2-Factor Authentication on your Gmail account:**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification

2. **Generate an App Password:**
   - Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Windows Computer" (or your device)
   - Generate and copy the 16-character password

3. **Update `.env` file in `/backend`:**
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # 16-character App Password (spaces optional)
   EMAIL_FROM=noreply@appointmenthub.com
   FRONTEND_URL=http://localhost:3000  # Update for production
   ```

#### Option B: Other SMTP Providers

**SendGrid:**
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.your_sendgrid_api_key
```

**Mailgun:**
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=postmaster@yourdomain.mailgun.org
EMAIL_PASSWORD=your_mailgun_password
```

**Office 365:**
```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your_password
```

### 2. Start the Backend

After updating `.env`, restart your backend server:

```bash
cd backend
npm run dev
```

The server will verify the email connection on startup and log:
- ✅ `Email transporter ready for sending` - Email is configured correctly
- ⚠️ `Email transporter verification failed` - Check your credentials

### 3. Test Email Sending

1. **Book an appointment** through the frontend
2. **Check the backend logs** for:
   ```
   Client confirmation email sent to client@example.com
   Provider notification email sent to provider@example.com
   ```
3. **Check your inbox** - You should receive HTML emails with appointment details
4. **Calendar file** - Look for an `.ics` attachment you can import into calendar apps

## Email Contents

### Appointment Confirmation (Client)
- Appointment date, time, and day
- Provider name and profession
- Link to dashboard
- Calendar file attachment (.ics)

### Appointment Notification (Provider)
- Client name and email
- Appointment date, time, and day
- Link to dashboard to view all appointments
- Calendar file attachment (.ics)

### Cancellation Emails (Both)
- Cancellation notice
- Original appointment details
- Calendar cancellation file

## Calendar Integration

The `.ics` files attached to emails are calendar-compatible and can be opened with:
- ✅ Google Calendar
- ✅ Outlook
- ✅ Apple Calendar
- ✅ iCal
- ✅ Most calendar applications

Users can either:
1. Download the `.ics` file and import it manually
2. Click "Add to Calendar" if their email client supports it
3. Copy-paste the event details

## Troubleshooting

### "Email transporter verification failed"
- Check email credentials are correct
- Verify SMTP host and port
- For Gmail: Ensure App Password is used (not regular password)
- Check firewall isn't blocking SMTP port

### Emails not received
- Check email logs in backend console
- Verify recipient email addresses are correct
- Check spam/junk folders
- Try a different SMTP provider
- Ensure `EMAIL_FROM` is a valid email address

### Calendar file not downloading
- Check email client supports attachments
- Try a different email provider
- Verify file is included in backend logs

## Production Deployment

For production, update `.env`:

```env
FRONTEND_URL=https://yourdomain.com  # Update to your production domain
EMAIL_FROM=noreply@yourdomain.com    # Use your domain email
```

## Security Notes

⚠️ **Never commit `.env` to version control**  
⚠️ **Use environment variables for sensitive data**  
⚠️ **For production, use dedicated email service accounts**  
⚠️ **Store credentials securely in your hosting platform**  

## Files Modified/Created

- `backend/utils/email.js` - Email sending utilities and templates
- `backend/utils/calendar.js` - Calendar event generation
- `backend/controllers/appointment-controller.js` - Updated to send emails on book/cancel
- `backend/.env` - Added email configuration variables

## Support

If you encounter issues:
1. Check backend logs for specific error messages
2. Verify `.env` configuration
3. Test SMTP credentials with a simple Node.js script if needed
4. Check email provider documentation for SMTP requirements
