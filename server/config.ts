import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import dotenv from 'dotenv';

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
	CACHE_DURATION_MINUTES: z.string()
		.transform(Number)
		.pipe(z.number().positive())
		.default('30'),

	// Logging
	LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
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

// Server configuration
export const serverConfig = {
	port: config.PORT,
	cors: {
		origin: config.CORS_ORIGIN,
		credentials: true,
	},
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