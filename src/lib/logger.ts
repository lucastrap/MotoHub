import winston from "winston";

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
          return `[${timestamp}] ${level}: ${message}${extra}`;
        })
      ),
    }),
  ],
});

if (process.env.NODE_ENV === "development") {
  logger.add(new winston.transports.File({ filename: "logs/error.log", level: "error" }));
  logger.add(new winston.transports.File({ filename: "logs/combined.log" }));
}

export default logger;
