import { Request, Response, NextFunction } from 'express';
import { log } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
	const start = Date.now();
	const { method, url, query, body, headers } = req;

	// Log request details
	log.info('Incoming request', {
		method,
		url,
		query,
		body: method !== 'GET' ? body : undefined,
		userAgent: headers['user-agent'],
		ip: req.ip,
	});

	// Capture response
	const originalSend = res.send;
	let responseBody: any;

	res.send = function (body: any) {
		responseBody = body;
		return originalSend.call(this, body);
	};

	// Log response when finished
	res.on('finish', () => {
		const duration = Date.now() - start;
		const { statusCode } = res;

		log.info('Request completed', {
			method,
			url,
			statusCode,
			duration: `${duration}ms`,
			responseSize: res.get('content-length'),
			responseBody: statusCode >= 400 ? responseBody : undefined,
		});
	});

	next();
};