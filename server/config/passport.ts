import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User, UserDocument } from '../models/User';
import { log } from '../utils/logger';
import { config } from '../config';

/**
 * Configures Passport.js with strategies and serialization/deserialization
 */
export function configurePassport() {
	// Configure the local strategy for use by Passport
	passport.use(
		new LocalStrategy(
			{
				usernameField: 'username',
				passwordField: 'password',
			},
			async (username, password, done) => {
				try {
					// Find the user by username (could be username or email)
					const user = await User.findOne({
						$or: [{ username }, { email: username }],
					});

					// If no user is found or password doesn't match
					if (!user) {
						return done(null, false, { message: 'Invalid username or password' });
					}

					// Verify the password
					const isValid = await user.verifyPassword(password);
					if (!isValid) {
						return done(null, false, { message: 'Invalid username or password' });
					}

					// Update last login time
					user.lastLogin = new Date();
					await user.save();

					return done(null, user);
				} catch (err) {
					log.error('Error in passport local strategy', { error: err });
					return done(err);
				}
			}
		)
	);

	// Configure Google OAuth strategy if credentials are available
	if (config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET) {
		passport.use(
			new GoogleStrategy(
				{
					clientID: config.GOOGLE_CLIENT_ID,
					clientSecret: config.GOOGLE_CLIENT_SECRET,
					callbackURL: `${config.API_BASE_URL}/auth/google/callback`,
					scope: ['profile', 'email']
				},
				async (accessToken, refreshToken, profile, done) => {
					try {
						// Check if the user already exists
						let user = await User.findOne({
							$or: [
								{ 'googleId': profile.id },
								{ 'email': profile.emails?.[0]?.value }
							]
						});

						if (user) {
							// User exists, update their Google ID if needed
							if (!user.googleId) {
								user.googleId = profile.id;
								await user.save();
							}

							// Update last login time
							user.lastLogin = new Date();
							await user.save();

							return done(null, user);
						}

						// User doesn't exist, create a new one
						const email = profile.emails?.[0]?.value;

						if (!email) {
							return done(new Error('Email is required for registration'), false);
						}

						// Create username from email or name
						const username = email.split('@')[0] || `user_${profile.id}`;

						// Create new user
						const newUser = new User({
							username,
							email,
							fullName: profile.displayName,
							googleId: profile.id,
							avatarUrl: profile.photos?.[0]?.value,
							isVerified: true, // Auto-verify users who sign in with Google
							password: Math.random().toString(36).slice(-16) // Random password for Google users
						});

						await newUser.save();

						return done(null, newUser);
					} catch (err) {
						log.error('Error in Google authentication strategy', { error: err });
						return done(err);
					}
				}
			)
		);
	} else {
		log.warn('Google OAuth not configured. GOOGLE_CLIENT_ID and/or GOOGLE_CLIENT_SECRET missing.');
	}

	// Serialize user object to store in the session
	passport.serializeUser((user: any, done) => {
		done(null, user.id);
	});

	// Deserialize user from the session
	passport.deserializeUser(async (id: string, done) => {
		try {
			const user = await User.findById(id);
			done(null, user);
		} catch (err) {
			done(err);
		}
	});

	return passport;
}