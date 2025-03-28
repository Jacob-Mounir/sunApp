import cors from 'cors';
import { serverConfig } from '../config';

// CORS configuration
export const corsMiddleware = cors({
	origin: serverConfig.cors.origin,
	credentials: serverConfig.cors.credentials,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
	allowedHeaders: [
		'Content-Type',
		'Authorization',
		'X-Requested-With',
		'Accept',
		'Origin',
	],
	exposedHeaders: ['Content-Range', 'X-Content-Range'],
	maxAge: 86400, // 24 hours
});