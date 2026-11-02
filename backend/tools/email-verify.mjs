import dotenv from 'dotenv'
import nodemailer from 'nodemailer'

// Load environment from backend/.env
dotenv.config({ path: './.env' })

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: { rejectUnauthorized: false },
})

console.log('Using EMAIL_HOST=%s EMAIL_PORT=%s EMAIL_USER=%s', process.env.EMAIL_HOST, process.env.EMAIL_PORT, process.env.EMAIL_USER)

;(async () => {
  try {
    await transporter.verify()
    console.log('Transporter verified: ready to send messages')
  } catch (err) {
    console.error('Transporter verification failed:')
    console.error(err)
    if (err && err.stack) console.error(err.stack)
    process.exitCode = 1
  }
})()
