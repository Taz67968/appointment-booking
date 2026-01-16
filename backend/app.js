import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import express from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import swaggerUi from "swagger-ui-express"
import swaggerSpec from './swaggerConfig.js';

import winstonLogger from "./utils/logger.js"

import authRouter from "./routes/auth.js"
import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import timeslotRouter from './routes/timeslot.js'
import appointmentRouter from "./routes/appointment.js"
import cors from 'cors';

const app = express();


const __filname = fileURLToPath(import.meta.url)
const __dirname = dirname(__filname)

// view engine setup
app.set('views', path.join(__dirname, 'views'));

// app.use(cors({
//   origin: "http://localhost:5174",
//   credentials: true
// }))

const morganFormat = process.env.NODE_ENV === "production" ? "dev" : 'combined'
app.use(morgan(morganFormat, { stream: winstonLogger.stream }));

// CORS configuration
const allowedOrigins = [
  "https://appointment-booking-r2vi.vercel.app",
  "http://localhost:5174",
  "http://localhost:3001",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/timeslot', timeslotRouter)
app.use("/appointment", appointmentRouter)


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app
