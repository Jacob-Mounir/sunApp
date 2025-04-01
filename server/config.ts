import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

// Environment variable schema
const envSchema = z.object({
	// Database
	DATABASE_URL: z.string().optional(),
	MONGODB_URI: z.string(),

	// API Keys
	OPENWEATHER_API_KEY: z.string().min(1),

	// Server
	NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
	PORT: z.string().transform(Number).pipe(z.number().positive()).default('5000'),

	// Security
	SESSION_SECRET: z.string().min(32).default(() => {
		if (process.env.NODE_ENV === 'production') {
			throw new Error('SESSION_SECRET must be set in production');
		}
		return 'default_development_session_secret_32chars';
	}),
	CORS_ORIGIN: z.string().url().default('http://localhost:5000'),

	// Optional Features
	ENABLE_WEATHER_CACHE: z.string()
		.transform((val) => val.toLowerCase() === 'true')
		.pipe(z.boolean())
		.default('true'),
	CACHE_DURATION_MINUTES: z.coerce
		.number()
		.positive()
		.default(30),

	// Logging
	LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

	// Backup configuration
	ENABLE_SCHEDULED_BACKUPS: z.string()
		.transform((val) => val.toLowerCase() === 'true')
		.pipe(z.boolean())
		.default('false'),
	BACKUP_INTERVAL_HOURS: z.coerce
		.number()
		.positive()
		.default(24),
	MAX_BACKUPS: z.coerce
		.number()
		.positive()
		.default(5),
	BACKUP_DIR: z.string().default(path.join(process.cwd(), 'backups')),

	// Google Maps API
	GOOGLE_MAPS_API_KEY: z.string().optional(),

	// JWT configuration
	JWT_SECRET: z.string().min(32).default(() => {
		if (process.env.NODE_ENV === 'production') {
			throw new Error('JWT_SECRET must be set in production');
		}
		return 'your-secret-key';
	}),
	JWT_EXPIRES_IN: z.string().default('24h'),

	// Rate limiting
	RATE_LIMIT_WINDOW: z.coerce
		.number()
		.positive()
		.default(15),
	RATE_LIMIT_MAX: z.coerce
		.number()
		.positive()
		.default(100),

	// Cache configuration
	CACHE_TTL: z.coerce
		.number()
		.positive()
		.default(3600), // 1 hour in seconds

	// Cloudinary Configuration
	CLOUDINARY_CLOUD_NAME: z.string(),
	CLOUDINARY_API_KEY: z.string(),
	CLOUDINARY_API_SECRET: z.string(),
});

// Function to validate and load environment variables
function validateEnv() {
	try {
		return envSchema.parse(process.env);
	} catch (error) {
		if (error instanceof z.ZodError) {
			const validationError = fromZodError(error);
			console.error('Environment validation failed:');
			console.error(validationError.message);
			process.exit(1);
		}
		throw error;
	}
}

// Export validated environment variables
export const config = validateEnv();

// Export specific configurations
export const isDevelopment = config.NODE_ENV === 'development';
export const isProduction = config.NODE_ENV === 'production';
export const isTest = config.NODE_ENV === 'test';

// Database configuration
export const dbConfig = {
	uri: config.MONGODB_URI,
};

// Cloudinary configuration
const cloudinaryConfig = {
	cloudName: process.env.CLOUDINARY_CLOUD_NAME,
	apiKey: process.env.CLOUDINARY_API_KEY,
	apiSecret: process.env.CLOUDINARY_API_SECRET,
};

// Server configuration
export const serverConfig = {
	port: config.PORT,
	cors: {
		origin: config.CORS_ORIGIN,
		credentials: true,
	},
	cloudinary: cloudinaryConfig,
};

// Weather API configuration
export const weatherConfig = {
	apiKey: config.OPENWEATHER_API_KEY,
	baseUrl: 'https://api.openweathermap.org/data/2.5',
	cache: {
		enabled: config.ENABLE_WEATHER_CACHE,
		duration: config.CACHE_DURATION_MINUTES * 60 * 1000, // Convert to milliseconds
	},
};

// Session configuration
export const sessionConfig = {
	secret: config.SESSION_SECRET,
	cookie: {
		secure: isProduction,
		maxAge: 24 * 60 * 60 * 1000, // 24 hours
	},
};

// Logging configuration
export const loggingConfig = {
	level: config.LOG_LEVEL,
	timestamp: true,
};