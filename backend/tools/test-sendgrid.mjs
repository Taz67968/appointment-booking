import dotenv from 'dotenv';
import { verifyTransporter, sendTestEmail } from '../utils/email.js';

// Load environment from backend/.env
dotenv.config({ path: new URL('../.env', import.meta.url).pathname });

console.log('Testing SendGrid Email Service');
console.log('================================');
console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? '****' + process.env.SENDGRID_API_KEY.slice(-4) : 'NOT SET');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
console.log('');

(async () => {
  try {
    // Verify transporter is ready
    console.log('1. Verifying SendGrid transporter...');
    const isReady = await verifyTransporter();
    if (!isReady) {
      console.error('Transporter verification failed!');
      process.exit(1);
    }
    console.log('   ✓ Transporter is ready');
    
    // Send a test email
    console.log('');
    console.log('2. Sending test email...');
    const testEmail = process.env.EMAIL_FROM;
    
    if (!testEmail) {
      console.error('ERROR: EMAIL_FROM is not set in .env');
      process.exit(1);
    }
    
    const info = await sendTestEmail(testEmail);
    console.log('   ✓ Test email sent successfully!');
    console.log('   Message ID:', info.messageId);
    console.log('');
    console.log('================================');
    console.log('SendGrid email service is working!');
    
  } catch (err) {
    console.error('');
    console.error('ERROR:');
    console.error(err.response?.body || err.message || err);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }
})();
