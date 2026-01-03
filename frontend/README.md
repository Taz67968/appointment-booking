# Appointment Booking Frontend

A modern Next.js frontend application for the Appointment Booking API, built with TypeScript and Tailwind CSS.

## Features

- **Client Portal**: Book and cancel appointments
- **Provider Portal**: Manage timeslots (create, update, delete)
- **Authentication**: Separate login/registration for clients and providers
- **JWT Token Management**: Secure authentication with token storage
- **Responsive Design**: Beautiful UI built with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:3000` (or configure your own URL)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory:
```bash
cp .env.local.example .env.local
```

3. Update `.env.local` with your backend API URL:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Running the Application

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3001](http://localhost:3001) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   │   ├── login/         # Login page
│   │   └── register/      # Registration page
│   ├── dashboard/         # Dashboard page
│   ├── layout.tsx         # Root layout with AuthProvider
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Navbar.tsx         # Navigation bar
│   ├── ClientDashboard.tsx # Client dashboard
│   └── ProviderDashboard.tsx # Provider dashboard
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication context
└── lib/                   # Utilities
    └── api.ts             # API service layer
```

## API Endpoints Used

### Authentication
- `POST /auth/clientRegister` - Register a new client
- `POST /auth/clientLogin` - Client login
- `POST /auth/providerRegister` - Register a new provider
- `POST /auth/providerLogin` - Provider login

### Timeslots (Provider only)
- `GET /timeslot/viewTimeslot` - Get all timeslots
- `POST /timeslot/createTimeslot` - Create a timeslot
- `PUT /timeslot/:id/updateTimeslot` - Update a timeslot
- `DELETE /timeslot/:id/DeleteTimeslot` - Delete a timeslot

### Appointments
- `POST /appointment/createAppointment` - Create an appointment
- `PATCH /appointment/cancelAppointment` - Cancel an appointment

## Usage

### For Clients

1. Register or login as a client
2. On the dashboard, enter a timeslot ID (provided by your service provider)
3. Select an appointment date
4. Book the appointment
5. Use the cancel form to cancel appointments by ID

### For Providers

1. Register or login as a provider
2. Create timeslots by selecting a day and time range
3. View all your timeslots
4. Edit or delete existing timeslots
5. Share timeslot IDs with clients for booking

## Technologies

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Context API** - State management

## Notes

- The frontend uses JWT tokens stored in localStorage for authentication
- All API calls include the Bearer token in the Authorization header
- The timeslot viewing endpoint requires provider authentication, so clients need to get timeslot IDs from their providers
- Make sure your backend CORS settings allow requests from the frontend origin
