/**
 * Smoke Test Suite
 * Tests all core features of the Appointment Booking application
 * 
 * Tests:
 * 1. Server health check
 * 2. Client registration & login
 * 3. Provider registration & login
 * 4. Provider creates timeslot
 * 5. Client fetches provider timeslots
 * 6. Client books appointment
 * 7. Client views appointments
 * 8. Client reschedules appointment
 * 9. Provider reschedules appointment
 * 10. Client cancels appointment
 * 11. Provider cancels appointment
 */

const BASE = process.env.API_BASE || 'https://appointment-booking-utc8.onrender.com';

const log = (test, ...a) => console.log(`[SMOKE ${test}]`, ...a);
const pass = (test) => console.log(`[PASS] ${test}`);
const fail = (test, err) => console.error(`[FAIL] ${test}:`, err.message);

async function request(path, opts = {}) {
  const url = BASE + path;
  try {
    const res = await fetch(url, opts);
    const txt = await res.text();
    let json;
    try { json = JSON.parse(txt); } catch { json = txt; }
    return { status: res.status, ok: res.ok, body: json };
  } catch (err) {
    throw new Error(`Request failed: ${url} -> ${err.message}`);
  }
}

(async () => {
  const results = { passed: 0, failed: 0 };
  
  const recordPass = (test) => { results.passed++; pass(test); };
  const recordFail = (test, err) => { results.failed++; fail(test, err); };

  try {
    log('START', 'Starting smoke tests against', BASE);
    console.log('');

    // 1) Server Health Check
    log('HEALTH', 'Testing server health...');
    try {
      const r = await request('/');
      if (r.ok && r.body.message) {
        recordPass('Server Health Check');
        log('HEALTH', 'Server is running:', r.body.message);
      } else {
        throw new Error('Unexpected response');
      }
    } catch (err) {
      recordFail('Server Health Check', err);
      throw new Error('Server is not running. Start the server with: cd backend && npm start');
    }
    console.log('');

    // 2) Client Registration
    const clientEmail = `client+${Date.now()}@example.com`;
    const clientPass = 'password123';
    log('AUTH', 'Registering client', clientEmail);
    try {
      let r = await request('/auth/clientRegister', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          first_name: 'Smoke', 
          last_name: 'Client', 
          email: clientEmail, 
          password: clientPass, 
          role: 'client' 
        }),
      });
      if (r.ok || r.status === 201) {
        recordPass('Client Registration');
      } else {
        throw new Error(`Status ${r.status}: ${JSON.stringify(r.body)}`);
      }
    } catch (err) {
      recordFail('Client Registration', err);
    }

    // 3) Client Login
    log('AUTH', 'Logging in client...');
    let clientToken;
    let clientId;
    try {
      let r = await request('/auth/clientLogin', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ email: clientEmail, password: clientPass, role: 'client' })
      });
      if (!r.ok) throw new Error('Login failed');
      clientToken = r.body.token;
      clientId = r.body.client?.id || r.body.clientid?.id || r.body.client?.id;
      recordPass('Client Login');
      log('AUTH', 'Client logged in, token received');
    } catch (err) {
      recordFail('Client Login', err);
      throw err;
    }
    console.log('');

    // 4) Provider Registration
    const provEmail = `provider+${Date.now()}@example.com`;
    const provPass = 'password123';
    log('AUTH', 'Registering provider', provEmail);
    try {
      let r = await request('/auth/providerRegister', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          first_name: 'Smoke', 
          last_name: 'Prov', 
          email: provEmail, 
          password: provPass, 
          profession: 'Tester', 
          description: 'Smoke test provider', 
          booked: false, 
          role: 'provider' 
        })
      });
      if (r.ok || r.status === 201) {
        recordPass('Provider Registration');
      } else {
        throw new Error(`Status ${r.status}: ${JSON.stringify(r.body)}`);
      }
    } catch (err) {
      recordFail('Provider Registration', err);
    }

    // 5) Provider Login
    log('AUTH', 'Logging in provider...');
    let provToken;
    let provId;
    try {
      let r = await request('/auth/providerLogin', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ email: provEmail, password: provPass, role: 'provider' }) 
      });
      if (!r.ok) throw new Error('Login failed');
      provToken = r.body.token;
      provId = r.body.provider?.id;
      recordPass('Provider Login');
      log('AUTH', 'Provider logged in, token received');
    } catch (err) {
      recordFail('Provider Login', err);
      throw err;
    }
    console.log('');

    // 6) Provider creates timeslot
    log('TIMESLOT', 'Provider creating timeslot...');
    let timeslotId;
    try {
      let r = await request('/timeslot/createTimeslot', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + provToken },
        body: JSON.stringify({ workingDays: 'Monday', startTime: '09:00', endTime: '10:00' })
      });
      if (!r.ok) throw new Error(`Status ${r.status}: ${JSON.stringify(r.body)}`);
      timeslotId = r.body.id || (r.body.created && r.body.created.id) || null;
      recordPass('Create Timeslot');
      log('TIMESLOT', 'Timeslot created, ID:', timeslotId);
    } catch (err) {
      recordFail('Create Timeslot', err);
      throw err;
    }

    // 7) Client fetches provider timeslots
    log('TIMESLOT', 'Client fetching provider timeslots...');
    try {
      let r = await request('/users/providers/' + provId + '/timeslots', { method: 'GET' });
      if (r.ok) {
        recordPass('Fetch Provider Timeslots');
        log('TIMESLOT', 'Found', Array.isArray(r.body) ? r.body.length : 0, 'timeslots');
      } else {
        throw new Error('Status ' + r.status);
      }
    } catch (err) {
      recordFail('Fetch Provider Timeslots', err);
    }
    console.log('');

    // 8) Client books appointment
    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + 7);
    const dateStr = appointmentDate.toISOString().slice(0,10);
    log('APPOINTMENT', 'Client booking appointment for', dateStr);
    let appointmentId;
    try {
      let r = await request('/appointment/createAppointment', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + clientToken },
        body: JSON.stringify({ timeslot_id: timeslotId, appointment_date: dateStr })
      });
      if (!r.ok) throw new Error(`Status ${r.status}: ${JSON.stringify(r.body)}`);
      appointmentId = r.body.appointment?.id || r.body.id || (r.body.appointment && r.body.appointment.id) || null;
      recordPass('Book Appointment');
      log('APPOINTMENT', 'Appointment booked, ID:', appointmentId);
    } catch (err) {
      recordFail('Book Appointment', err);
      throw err;
    }

    // 9) Client views appointments
    log('APPOINTMENT', 'Client fetching appointments...');
    try {
      let r = await request('/appointment/getAppointments', { method: 'GET', headers: { Authorization: 'Bearer ' + clientToken } });
      if (r.ok) {
        recordPass('View Appointments');
        log('APPOINTMENT', 'Found', (Array.isArray(r.body) && r.body.length) || 0, 'appointments');
      } else {
        throw new Error('Status ' + r.status);
      }
    } catch (err) {
      recordFail('View Appointments', err);
    }
    console.log('');

    // 10) Client reschedules appointment
    log('APPOINTMENT', 'Client rescheduling appointment...');
    const newDate = new Date(); 
    newDate.setDate(newDate.getDate() + 8);
    const newDateStr = newDate.toISOString().slice(0,10);
    try {
      let r = await request('/appointment/' + appointmentId + '/client-update', {
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + clientToken },
        body: JSON.stringify({ appointment_date: newDateStr, reason: 'Need to shift by one day' })
      });
      if (!r.ok) throw new Error(`Status ${r.status}: ${JSON.stringify(r.body)}`);
      recordPass('Client Reschedule Appointment');
      log('APPOINTMENT', 'Appointment rescheduled to', newDateStr);
    } catch (err) {
      recordFail('Client Reschedule Appointment', err);
    }

    // 11) Provider reschedules appointment
    log('APPOINTMENT', 'Provider rescheduling appointment...');
    try {
      let r = await request('/appointment/' + appointmentId + '/update', {
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + provToken },
        body: JSON.stringify({ appointment_date: dateStr })
      });
      if (!r.ok) throw new Error(`Status ${r.status}: ${JSON.stringify(r.body)}`);
      recordPass('Provider Reschedule Appointment');
      log('APPOINTMENT', 'Appointment rescheduled back to', dateStr);
    } catch (err) {
      recordFail('Provider Reschedule Appointment', err);
    }
    console.log('');

    // 12) Client cancels appointment
    log('APPOINTMENT', 'Client cancelling appointment...');
    try {
      let r = await request('/appointment/cancelAppointment', {
        method: 'PATCH', 
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + clientToken }, 
        body: JSON.stringify({ appointmentId })
      });
      if (!r.ok) throw new Error(`Status ${r.status}: ${JSON.stringify(r.body)}`);
      recordPass('Client Cancel Appointment');
      log('APPOINTMENT', 'Appointment cancelled by client');
    } catch (err) {
      recordFail('Client Cancel Appointment', err);
    }

    // 13) Re-book to test provider cancel
    log('APPOINTMENT', 'Re-booking to test provider cancel...');
    let appt2;
    try {
      let r = await request('/appointment/createAppointment', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + clientToken }, 
        body: JSON.stringify({ timeslot_id: timeslotId, appointment_date: dateStr }) 
      });
      if (!r.ok) throw new Error(`Status ${r.status}: ${JSON.stringify(r.body)}`);
      appt2 = r.body.appointment?.id || r.body.id || null;
      recordPass('Re-book Appointment');
      log('APPOINTMENT', 'Re-booked, ID:', appt2);
    } catch (err) {
      recordFail('Re-book Appointment', err);
    }

    // 14) Provider cancels appointment
    log('APPOINTMENT', 'Provider cancelling appointment...');
    try {
      let r = await request('/appointment/providerCancel', { 
        method: 'PATCH', 
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + provToken }, 
        body: JSON.stringify({ appointmentId: appt2 }) 
      });
      if (!r.ok) throw new Error(`Status ${r.status}: ${JSON.stringify(r.body)}`);
      recordPass('Provider Cancel Appointment');
      log('APPOINTMENT', 'Appointment cancelled by provider');
    } catch (err) {
      recordFail('Provider Cancel Appointment', err);
    }
    console.log('');

    // Summary
    console.log('============================================');
    console.log('           SMOKE TEST RESULTS             ');
    console.log('============================================');
    console.log('  PASSED: ' + results.passed);
    console.log('  FAILED: ' + results.failed);
    console.log('============================================');
    
    if (results.failed > 0) {
      console.log('\nSome tests failed. Check the errors above.\n');
      process.exit(1);
    } else {
      console.log('\nAll smoke tests passed!\n');
    }

  } catch (err) {
    console.error('\nFATAL ERROR:', err.message);
    console.error('   Make sure the server is running on', BASE);
    console.error('   Start with: cd backend && npm start\n');
    process.exit(1);
  }
})();
