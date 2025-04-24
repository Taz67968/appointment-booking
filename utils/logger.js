import winston from "winston"
import path, { dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __filname = fileURLToPath(import.meta.url)
const __dirname = dirname(__filname)

const logDir =path.join(__dirname, "../logs")

const {colorize, align, errors, json, combine, timestamp} = winston.format


const logger = winston.createLogger({
    level: process.env.NODE_ENV === "development" ? "debug" : "info",
    format:combine (
        timestamp({format: "YYYY-MM-DD HH:mm:ss"}),
        errors({stack: true}),
        json()

    ),
    transports: [
        new winston.transports.File({
            filename: path.join(logDir, 'app.log'),
      level: "info",
      maxsize: 5242880,
      maxFiles: 5
        }),
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: "error",
            maxsize: 5242880, // 5MB
            maxFiles: 5
          })
    ],
    exceptionHandler: [
        new winston.transports.File({filename:path.join(logDir, "exceptions.log") })
    ],
    rejectionsHandler: [
        new winston.transports.File({filename: path.join(logDir,"rejectoins.log") })
    ],
    exitOnError:false

})

if (process.env.NODE_ENV !== "production") {
    logger.add(new winston.transports.Console({
        format: combine(
            colorize(),
            timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
            align()
        ),
        level: "debug"
    }))
}

logger.stream = {
    write:(message) => {
        logger.info(message.substring(0, message.lasIndex("\n")))
    }
}

export default logger