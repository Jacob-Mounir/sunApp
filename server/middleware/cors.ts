import cors from 'cors';
import { serverConfig } from '../config';

// Configure CORS middleware to allow specific origins
const allowedOrigins = [
	'http://localhost:3000',
	'http://localhost:5173',
	'http://localhost:5174',
	'http://localhost:5175',
	'https://jacob-mounir.github.io', // GitHub Pages domain
	'https://sunspotter-web.onrender.com', // Render frontend domain
	'https://sunspotter-api.onrender.com', // Render API domain
	'http://sunspotter-web.onrender.com',
	'http://sunspotter-api.onrender.com'
];

// CORS configuration
export const corsMiddleware = cors({
	origin: function (origin, callback) {
		// Allow requests with no origin (like mobile apps, curl, etc.)
		if (!origin) return callback(null, true);

		// Check if the origin is allowed
		if (allowedOrigins.includes(origin) ||
			origin.includes('localhost') ||
			origin.includes('sunspotter-web.onrender.com') ||
			origin.includes('sunspotter-api.onrender.com')) {
			callback(null, true);
		} else {
			console.log(`CORS blocked origin: ${origin}`);
			callback(new Error('Not allowed by CORS'), false);
		}
	},
	methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
	credentials: true,
	optionsSuccessStatus: 200
});