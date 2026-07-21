import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import nodemailer from 'nodemailer'

// Resolve backend/.env relative to this script's directory so it works when invoked
const __filename = new URL(import.meta.url).pathname
const __dirname = path.dirname(__filename)
const envPath = path.resolve(__dirname, '../.env')
dotenv.config({ path: envPath })

const cfg = {
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE,
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASSWORD,
  from: process.env.EMAIL_FROM,
}

const mask = (v) => {
  if (!v) return '<<missing>>'
  if (v.length <= 4) return '****'
  return v.slice(0,2) + '****' + v.slice(-2)
}

console.log('Email configuration (masked):')
console.log('EMAIL_HOST:', cfg.host || '<<missing>>')
console.log('EMAIL_PORT:', cfg.port || '<<missing>>')
console.log('EMAIL_SECURE:', cfg.secure || 'false')
console.log('EMAIL_USER:', cfg.user ? cfg.user.replace(/(.{2}).+(@.+)/, '$1****$2') : '<<missing>>')
console.log('EMAIL_PASSWORD:', mask(cfg.pass))
console.log('EMAIL_FROM:', cfg.from || '<<missing>>')

let problems = []
if (!cfg.host) problems.push('EMAIL_HOST is missing')
if (!cfg.port) problems.push('EMAIL_PORT is missing')
else if (Number.isNaN(Number(cfg.port))) problems.push('EMAIL_PORT is not numeric')
if (!cfg.user) problems.push('EMAIL_USER is missing')
if (!cfg.pass) problems.push('EMAIL_PASSWORD is missing')
if (cfg.user && !/@/.test(cfg.user)) problems.push('EMAIL_USER does not look like an email address')
if (cfg.pass && cfg.pass.length === 16) console.log('- Detected 16-char password; looks like a Gmail App Password (good).')

if (problems.length) {
  console.log('\nProblems found:')
  problems.forEach((p) => console.log('- ' + p))
  console.log('\nSee backend/EMAIL_TROUBLESHOOT.md for next steps')
  process.exitCode = 1
} else {
  console.log('\nNo immediate config problems detected.')
  console.log('Tip: To attempt an SMTP connection verification run with --verify')
}

const args = process.argv.slice(2)
if (args.includes('--verify')) {
  console.log('\nAttempting transporter.verify() (this will contact the SMTP server)')
  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: Number(cfg.port),
    secure: cfg.secure === 'true',
    auth: { user: cfg.user, pass: cfg.pass },
    tls: { rejectUnauthorized: false },
  })

  transporter.verify().then(() => {
    console.log('Transporter verified: ready to send messages')
  }).catch((err) => {
    console.error('Transporter verification failed:')
    console.error(err && err.message ? err.message : err)
    if (err && err.response) console.error('\nSMTP response:\n', err.response)
    process.exitCode = 1
  })
}
