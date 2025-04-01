import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if user is authenticated
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
	if (req.isAuthenticated()) {
		return next();
	}

	res.status(401).json({ error: 'Authentication required' });
}

/**
 * Middleware to check if user is NOT authenticated
 * For routes that should only be accessed by non-logged in users
 */
export function isNotAuthenticated(req: Request, res: Response, next: NextFunction) {
	if (!req.isAuthenticated()) {
		return next();
	}

	res.status(403).json({ error: 'Already authenticated' });
}