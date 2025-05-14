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

const app = express();

const __filname = fileURLToPath(import.meta.url)
const __dirname = dirname(__filname)

// view engine setup
app.set('views', path.join(__dirname, 'views'));


const morganFormat = process.env.NODE_ENV === "production" ? "dev" : 'combined'
app.use(morgan(morganFormat, { stream: winstonLogger.stream }));

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
