# Email Troubleshooting

This file provides quick checks and fixes for common SMTP authentication problems (e.g., Gmail `535 BadCredentials`).

1) Verify `.env` values in `backend/.env`:
   - `EMAIL_USER` must be the full email address (e.g., your@gmail.com)
   - `EMAIL_PASSWORD` should be the App Password for Gmail (16 chars) if 2-Step Verification is enabled
   - `EMAIL_HOST` and `EMAIL_PORT` must match your provider (Gmail: `smtp.gmail.com`, `587`)

2) Gmail-specific steps:
   - Enable 2-Step Verification: https://myaccount.google.com/security
   - Create an App Password: https://myaccount.google.com/apppasswords
   - Use the App Password (16 characters) as `EMAIL_PASSWORD` in `backend/.env` (no spaces)
   - If using a Google Workspace account, ensure SMTP access is allowed by admin or use a service account/SendGrid

3) Ports & security:
   - `587` + `EMAIL_SECURE=false` -> STARTTLS (recommended)
   - `465` + `EMAIL_SECURE=true` -> implicit TLS

4) Testing locally:
   - Run the troubleshooting checks (does not send email):

```bash
cd backend
node tools/email-troubleshoot.mjs
```

   - To attempt contacting the SMTP server and verify credentials (may log SMTP responses):

```bash
cd backend
node tools/email-troubleshoot.mjs --verify
```

5) If `535` persists:
   - Double-check `EMAIL_USER` and `EMAIL_PASSWORD` for typos
   - Recreate the App Password and paste it exactly (no trailing spaces/newlines)
   - Try a transactional email provider (SendGrid, Mailgun) and update `.env` accordingly

6) Security notes:
   - Never commit `backend/.env` to source control
   - For production, use provider secrets or environment config from your host

If you'd like, I can run `node backend/tools/email-troubleshoot.mjs --verify` now and share the output.
