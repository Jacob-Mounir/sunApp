import express, { Request, Response } from 'express';
import passport from 'passport';
import { User, userSchemaZod } from '../models/User';
import { log } from '../utils/logger';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { config } from '../config';

const router = express.Router();

// Validation schema for login
const loginSchema = z.object({
	username: z.string().min(1),
	password: z.string().min(1)
});

// Validation schema for registration
const registerSchema = userSchemaZod.pick({
	username: true,
	email: true,
	password: true,
	fullName: true
});

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', async (req: Request, res: Response) => {
	try {
		// Validate input data
		const userData = registerSchema.parse(req.body);

		// Check if user already exists
		const existingUser = await User.findOne({
			$or: [
				{ username: userData.username },
				{ email: userData.email }
			]
		});

		if (existingUser) {
			if (existingUser.username === userData.username) {
				return res.status(400).json({ error: 'Username already exists' });
			}
			return res.status(400).json({ error: 'Email already in use' });
		}

		// Create new user
		const newUser = new User(userData);
		await newUser.save();

		// Return user data without password
		const userWithoutPassword = {
			id: newUser._id,
			username: newUser.username,
			email: newUser.email,
			fullName: newUser.fullName,
			isVerified: newUser.isVerified,
			createdAt: newUser.createdAt
		};

		res.status(201).json(userWithoutPassword);
	} catch (error) {
		log.error('Error registering user', { error });

		if (error instanceof z.ZodError) {
			const validationError = fromZodError(error);
			return res.status(400).json({ error: validationError.message });
		}

		res.status(500).json({ error: 'Registration failed' });
	}
});

/**
 * @route POST /api/auth/login
 * @desc Login a user
 * @access Public
 */
router.post('/login', (req: Request, res: Response, next) => {
	try {
		// Validate login data
		loginSchema.parse(req.body);

		passport.authenticate('local', (err: Error, user: any, info: any) => {
			if (err) {
				log.error('Login error', { error: err });
				return res.status(500).json({ error: 'Login failed' });
			}

			if (!user) {
				// Authentication failed
				return res.status(401).json({ error: info.message || 'Invalid credentials' });
			}

			// Authentication successful, log in the user
			req.login(user, (loginErr) => {
				if (loginErr) {
					log.error('Login session error', { error: loginErr });
					return res.status(500).json({ error: 'Login failed' });
				}

				// Return user data without sensitive info
				const userWithoutPassword = {
					id: user._id,
					username: user.username,
					email: user.email,
					fullName: user.fullName,
					isVerified: user.isVerified,
					avatarUrl: user.avatarUrl
				};

				return res.json(userWithoutPassword);
			});
		})(req, res, next);
	} catch (error) {
		if (error instanceof z.ZodError) {
			const validationError = fromZodError(error);
			return res.status(400).json({ error: validationError.message });
		}

		res.status(500).json({ error: 'Login failed' });
	}
});

/**
 * @route GET /api/auth/google
 * @desc Initiate Google OAuth authentication
 * @access Public
 */
router.get('/google',
	passport.authenticate('google', { scope: ['profile', 'email'] })
);

/**
 * @route GET /api/auth/google/callback
 * @desc Handle Google OAuth callback
 * @access Public
 */
router.get('/google/callback',
	passport.authenticate('google', {
		failureRedirect: '/login',
		session: true
	}),
	(req: Request, res: Response) => {
		// Determine the redirect URL based on environment
		const frontendUrl = config.NODE_ENV === 'production'
			? 'https://sunspotter-web.onrender.com'
			: 'http://localhost:5173';

		// Successful authentication, redirect to frontend
		res.redirect(`${frontendUrl}/profile?auth=google`);
	}
);

/**
 * @route GET /api/auth/me
 * @desc Get current user
 * @access Private
 */
router.get('/me', (req: Request, res: Response) => {
	if (!req.isAuthenticated()) {
		return res.status(401).json({ error: 'Not authenticated' });
	}

	const user = req.user as any;
	res.json({
		id: user._id,
		username: user.username,
		email: user.email,
		fullName: user.fullName,
		avatarUrl: user.avatarUrl,
		googleId: user.googleId,
		isVerified: user.isVerified,
		createdAt: user.createdAt
	});
});

/**
 * @route POST /api/auth/logout
 * @desc Logout a user
 * @access Private
 */
router.post('/logout', (req: Request, res: Response) => {
	req.logout((err) => {
		if (err) {
			log.error('Logout error', { error: err });
			return res.status(500).json({ error: 'Logout failed' });
		}

		res.json({ message: 'Logged out successfully' });
	});
});

export default router;