# Quick Start Guide

## Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure API URL:**
   Create a `.env.local` file in the `frontend` directory:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```
   (Update the URL if your backend runs on a different port)

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3001` (Next.js default port)

## Testing the Application

### As a Provider:

1. Go to the home page and click "Provider Portal"
2. Click "Register here" to create a new provider account
3. Fill in:
   - First Name, Last Name
   - Email, Password
   - Profession (e.g., "Therapist")
   - Description (e.g., "Experienced therapist")
4. After registration, you'll be logged in automatically
5. On the dashboard:
   - Click "+ Create Timeslot"
   - Select a day, start time, and end time
   - Click "Create"
   - You can edit or delete timeslots
   - Share the timeslot ID with clients

### As a Client:

1. Go to the home page and click "Client Portal"
2. Click "Register here" to create a new client account
3. Fill in: First Name, Last Name, Email, Password
4. After registration, you'll be logged in automatically
5. On the dashboard:
   - Enter a timeslot ID (from your provider)
   - Select an appointment date
   - Click "Book Appointment"
   - To cancel, enter the appointment ID and click "Cancel Appointment"

## Features Implemented

 Client Registration & Login
 Provider Registration & Login
 JWT Token Authentication
 Timeslot Management (Create, Read, Update, Delete) - Provider only
 Appointment Booking - Client
 Appointment Cancellation - Client
 Responsive UI with Tailwind CSS
 TypeScript for type safety
 Protected routes with authentication

## API Endpoints Used

All endpoints from your backend are integrated:
- `/auth/clientRegister`
- `/auth/clientLogin`
- `/auth/providerRegister`
- `/auth/providerLogin`
- `/timeslot/viewTimeslot`
- `/timeslot/createTimeslot`
- `/timeslot/:id/updateTimeslot`
- `/timeslot/:id/DeleteTimeslot`
- `/appointment/createAppointment`
- `/appointment/cancelAppointment`

## Notes

- Make sure your backend is running on port 3000 (or update `.env.local`)
- The frontend stores JWT tokens in localStorage
- All API calls automatically include the Bearer token in headers
- The UI is fully responsive and works on mobile devices(phones, iphone, tablets)

