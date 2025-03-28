import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { loggingConfig, isDevelopment, isProduction } from '../config';
import path from 'path';

// Define log format
const logFormat = winston.format.combine(
	winston.format.timestamp(),
	winston.format.errors({ stack: true }),
	winston.format.splat(),
	winston.format.json()
);

// Define console format for development
const consoleFormat = winston.format.combine(
	winston.format.colorize(),
	winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
	winston.format.printf(
		({ level, message, timestamp, ...metadata }) => {
			let msg = `${timestamp} [${level}] : ${message}`;
			if (Object.keys(metadata).length > 0) {
				msg += ` ${JSON.stringify(metadata)}`;
			}
			return msg;
		}
	)
);

// Create the logger
const logger = winston.createLogger({
	level: loggingConfig.level,
	format: logFormat,
	defaultMeta: { service: 'sunspotter-api' },
	transports: [
		// Write all logs to console in development
		new winston.transports.Console({
			format: consoleFormat,
			level: isDevelopment ? 'debug' : 'info',
		}),
		// Write all logs error (and above) to error.log
		new DailyRotateFile({
			filename: path.join('logs', 'error-%DATE%.log'),
			datePattern: 'YYYY-MM-DD',
			zippedArchive: true,
			maxSize: '20m',
			maxFiles: '14d',
			level: 'error',
		}),
		// Write all logs to combined.log
		new DailyRotateFile({
			filename: path.join('logs', 'combined-%DATE%.log'),
			datePattern: 'YYYY-MM-DD',
			zippedArchive: true,
			maxSize: '20m',
			maxFiles: '14d',
		}),
	],
});

// Create a stream object for Morgan integration
export const stream = {
	write: (message: string) => {
		logger.info(message.trim());
	},
};

// Export logger methods
export const log = {
	error: (message: string, meta?: any) => logger.error(message, meta),
	warn: (message: string, meta?: any) => logger.warn(message, meta),
	info: (message: string, meta?: any) => logger.info(message, meta),
	debug: (message: string, meta?: any) => logger.debug(message, meta),
	http: (message: string, meta?: any) => logger.http(message, meta),
};

// Export the logger instance for direct use
export default logger;