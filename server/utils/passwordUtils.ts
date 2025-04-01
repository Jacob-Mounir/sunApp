import bcrypt from 'bcrypt';

/**
 * Hash a password using bcrypt
 * @param password Plain text password to hash
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
	const saltRounds = 10;
	return bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a hashed password
 * @param password Plain text password to verify
 * @param hashedPassword Hashed password to compare against
 * @returns Boolean indicating if the password matches
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
	return bcrypt.compare(password, hashedPassword);
}