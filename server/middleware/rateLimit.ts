import rateLimit from 'express-rate-limit';
import { log } from '../utils/logger';

// General API rate limiter
export const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per windowMs
	message: 'Too many requests from this IP, please try again later.',
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	handler: (req, res) => {
		log.warn('Rate limit exceeded', {
			ip: req.ip,
			path: req.path,
			method: req.method,
		});
		res.status(429).json({
			error: 'Too many requests, please try again later.',
		});
	},
});

// Stricter limiter for authentication endpoints
export const authLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 5, // Limit each IP to 5 requests per windowMs
	message: 'Too many login attempts, please try again later.',
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req, res) => {
		log.warn('Auth rate limit exceeded', {
			ip: req.ip,
			path: req.path,
			method: req.method,
		});
		res.status(429).json({
			error: 'Too many login attempts, please try again later.',
		});
	},
});

// Stricter limiter for weather API endpoints
export const weatherLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 120, // Increased from 30 to 120 requests per windowMs to handle multiple venues
	message: 'Too many weather API requests, please try again later.',
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req, res) => {
		log.warn('Weather API rate limit exceeded', {
			ip: req.ip,
			path: req.path,
			method: req.method,
		});
		res.status(429).json({
			error: 'Too many weather API requests, please try again later.',
		});
	},
	skipFailedRequests: true, // Don't count failed requests
	keyGenerator: (req) => {
		// Use a combination of IP and path to separate weather vs sun position limits
		return `${req.ip}-${req.path}`;
	}
});

// Stricter limiter for venue search endpoints
export const searchLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 60, // Reduced from 200 to 60 to prevent overload
	message: 'Too many search requests, please try again later.',
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req, res) => {
		log.warn('Search rate limit exceeded', {
			ip: req.ip,
			path: req.path,
			method: req.method,
		});
		res.status(429).json({
			error: 'Too many search requests, please try again later.',
		});
	},
	skipFailedRequests: true,
	keyGenerator: (req) => {
		// Round coordinates to 5 decimal places to group similar requests
		const lat = req.query.latitude ? Math.round(parseFloat(req.query.latitude as string) * 100000) / 100000 : '';
		const lon = req.query.longitude ? Math.round(parseFloat(req.query.longitude as string) * 100000) / 100000 : '';
		return `${req.ip}-${req.path}-${lat},${lon}`;
	}
});

// Rate limiter for venue details
export const venueDetailsLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 120, // Reduced from 300 to 120 to prevent overload
	message: 'Too many venue detail requests, please try again later.',
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req, res) => {
		log.warn('Venue details rate limit exceeded', {
			ip: req.ip,
			path: req.path,
			method: req.method,
		});
		res.status(429).json({
			error: 'Too many venue detail requests, please try again later.',
		});
	},
	skipFailedRequests: true,
	keyGenerator: (req) => {
		// Group by IP and venue ID
		return `${req.ip}-${req.path}-${req.params.id}`;
	}
});