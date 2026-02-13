const BASE = process.env.API_BASE || 'http://localhost:3005';

const rnd = () => Math.random().toString(36).slice(2, 8);

const log = (...a) => console.log('[SMOKE]', ...a);

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
  try {
    log('Starting smoke tests against', BASE);

    // 1) Register client
    const clientEmail = `client+${Date.now()}@example.com`;
    const clientPass = 'password123';
    log('Registering client', clientEmail);
    let r = await request('/auth/clientRegister', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ first_name: 'Smoke', last_name: 'Client', email: clientEmail, password: clientPass, role: 'client' }),
    });
    log('clientRegister', r.status, r.body);

    // 2) Login client
    r = await request('/auth/clientLogin', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: clientEmail, password: clientPass, role: 'client' })
    });
    log('clientLogin', r.status);
    if (!r.ok) throw new Error('Client login failed');
    const clientToken = r.body.token;
    const clientId = r.body.client?.id || r.body.clientid?.id || r.body.client?.id;

    // 3) Register provider
    const provEmail = `provider+${Date.now()}@example.com`;
    const provPass = 'password123';
    log('Registering provider', provEmail);
    r = await request('/auth/providerRegister', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ first_name: 'Smoke', last_name: 'Prov', email: provEmail, password: provPass, profession: 'Tester', description: 'Smoke test', booked: false, role: 'provider' })
    });
    log('providerRegister', r.status, r.body);

    // 4) Login provider
    r = await request('/auth/providerLogin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: provEmail, password: provPass, role: 'provider' }) });
    log('providerLogin', r.status);
    if (!r.ok) throw new Error('Provider login failed');
    const provToken = r.body.token;
    const provId = r.body.provider?.id;

    // 5) Provider creates a timeslot
    log('Provider creating timeslot');
    r = await request('/timeslot/createTimeslot', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${provToken}` },
      body: JSON.stringify({ workingDays: 'Monday', startTime: '09:00', endTime: '10:00' })
    });
    log('createTimeslot', r.status, r.body);
    if (!r.ok) throw new Error('Create timeslot failed');
    const timeslotId = r.body.id || (r.body.created && r.body.created.id) || null;

    // 6) Client lists providers and provider timeslots
    log('Client fetching provider timeslots');
    r = await request(`/users/providers/${provId}/timeslots`, { method: 'GET' });
    log('providerTimeslots', r.status, Array.isArray(r.body) ? r.body.length : r.body);

    // 7) Client books appointment using the timeslot
    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + 7);
    const dateStr = appointmentDate.toISOString().slice(0,10);
    log('Client booking appointment for', dateStr);
    r = await request('/appointment/createAppointment', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({ timeslot_id: timeslotId || (r.body[0] && r.body[0].id), appointment_date: dateStr })
    });
    log('createAppointment', r.status, r.body);
    if (!r.ok) throw new Error('Create appointment failed');
    const appointmentId = r.body.appointment?.id || r.body.id || (r.body.appointment && r.body.appointment.id) || null;

    // 8) Client views appointments
    r = await request('/appointment/getAppointments', { method: 'GET', headers: { Authorization: `Bearer ${clientToken}` } });
    log('client appointments', r.status, (Array.isArray(r.body) && r.body.length) || r.body);

    // 9) Client reschedules appointment (client-update)
    log('Client rescheduling appointment');
    // pick same timeslot (no change) but new date
    const newDate = new Date(); newDate.setDate(newDate.getDate() + 8);
    const newDateStr = newDate.toISOString().slice(0,10);
    r = await request(`/appointment/${appointmentId}/client-update`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({ appointment_date: newDateStr, reason: 'Need to shift by one day' })
    });
    log('client-update', r.status, r.body);

    // 10) Provider reschedules appointment via provider endpoint
    log('Provider rescheduling appointment');
    r = await request(`/appointment/${appointmentId}/update`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${provToken}` },
      body: JSON.stringify({ appointment_date: dateStr })
    });
    log('provider-update', r.status, r.body);

    // 11) Client cancels appointment
    log('Client cancelling appointment');
    r = await request('/appointment/cancelAppointment', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clientToken}` }, body: JSON.stringify({ appointmentId })
    });
    log('client cancel', r.status, r.body);

    // 12) Recreate booking to test provider cancel
    log('Re-booking appointment to test provider cancel');
    r = await request('/appointment/createAppointment', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clientToken}` }, body: JSON.stringify({ timeslot_id: timeslotId, appointment_date: dateStr }) });
    log('recreate booking', r.status, r.body);
    const appt2 = r.body.appointment?.id || r.body.id || null;

    // 13) Provider cancels appointment
    log('Provider cancelling appointment');
    r = await request('/appointment/providerCancel', { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${provToken}` }, body: JSON.stringify({ appointmentId: appt2 }) });
    log('provider cancel', r.status, r.body);

    log('SMOKE TESTS COMPLETED');
  } catch (err) {
    console.error('SMOKE TEST ERROR:', err);
    process.exit(1);
  }
})();
