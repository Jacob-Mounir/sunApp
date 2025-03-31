import cors from 'cors';
import { serverConfig } from '../config';

// Configure CORS middleware to allow specific origins
const allowedOrigins = [
	'http://localhost:3000',
	'http://localhost:5173',
	'http://localhost:5174',
	'http://localhost:5175',
	'https://jacob-mounir.github.io', // GitHub Pages domain
	'https://sunspotter-web.onrender.com' // Render frontend domain
];

// CORS configuration
export const corsMiddleware = cors({
	origin: function (origin, callback) {
		// Allow requests with no origin (like mobile apps, curl, etc.)
		if (!origin) return callback(null, true);

		// Check if the origin is allowed
		if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('localhost')) {
			callback(null, true);
		} else {
			callback(new Error('Not allowed by CORS'), false);
		}
	},
	methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
	credentials: true,
	optionsSuccessStatus: 200
});