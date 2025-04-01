import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';
import { hashPassword, verifyPassword } from '../utils/passwordUtils';

// Define the user schema
const userSchema = new Schema({
	username: { type: String, required: true, unique: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	fullName: { type: String },
	avatarUrl: { type: String },
	googleId: { type: String, sparse: true, unique: true },
	preferences: { type: Schema.Types.Mixed, default: {} },
	isVerified: { type: Boolean, default: false },
	lastLogin: { type: Date },
	savedVenues: [{ type: Schema.Types.ObjectId, ref: 'Venue' }]
}, {
	timestamps: true // This will automatically manage createdAt and updatedAt
});

// Add method to verify password
userSchema.methods.verifyPassword = async function (password: string): Promise<boolean> {
	return verifyPassword(password, this.password);
};

// Middleware to hash password before saving
userSchema.pre<UserDocument>('save', async function (next) {
	// Only hash the password if it has been modified (or is new)
	if (!this.isModified('password')) return next();

	try {
		// Hash the password
		this.password = await hashPassword(this.password);
		next();
	} catch (error) {
		next(error as Error);
	}
});

// Create indexes for common queries
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });

// Create the model - check if it already exists first to avoid model overwrite errors
export const User = mongoose.models.User || mongoose.model<UserDocument>('User', userSchema);

// Define the document interface
export interface UserDocument extends Document {
	username: string;
	email: string;
	password: string;
	fullName?: string;
	avatarUrl?: string;
	googleId?: string;
	preferences: Record<string, any>;
	isVerified: boolean;
	lastLogin?: Date;
	savedVenues?: mongoose.Types.ObjectId[];
	createdAt: Date;
	updatedAt: Date;
	verifyPassword: (password: string) => Promise<boolean>;
}

// Create Zod schema for validation
export const userSchemaZod = z.object({
	username: z.string().min(3).max(30),
	email: z.string().email(),
	password: z.string().min(8),
	fullName: z.string().optional(),
	avatarUrl: z.string().url().optional(),
	googleId: z.string().optional(),
	preferences: z.record(z.any()).default({}),
	isVerified: z.boolean().default(false),
	savedVenues: z.array(z.string()).optional()
});