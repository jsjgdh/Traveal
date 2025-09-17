import winston from 'winston';
import { config } from '../config/environment';

const { combine, timestamp, errors, json, printf, colorize } = winston.format;

// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Create the logger
export const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: combine(
    timestamp(),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: { service: 'traveal-backend' },
  transports: [
    // Write to console in development
    ...(config.isDevelopment ? [
      new winston.transports.Console({
        format: combine(
          colorize(),
          timestamp({ format: 'HH:mm:ss' }),
          consoleFormat
        )
      })
    ] : []),
    
    // Write to file in production
    ...(config.isProduction ? [
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: combine(timestamp(), errors({ stack: true }), json())
      }),
      new winston.transports.File({
        filename: config.LOG_FILE,
        format: combine(timestamp(), json())
      })
    ] : [])
  ]
});

// Add console transport for production if LOG_LEVEL is debug
if (config.isProduction && config.LOG_LEVEL === 'debug') {
  logger.add(new winston.transports.Console({
    format: combine(
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      consoleFormat
    )
  }));
}

export default logger;