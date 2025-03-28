import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';

// Define the user schema
const userSchema = new Schema({
	username: { type: String, required: true, unique: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	fullName: { type: String },
	avatarUrl: { type: String },
	preferences: { type: Schema.Types.Mixed, default: {} },
	isVerified: { type: Boolean, default: false },
	lastLogin: { type: Date }
}, {
	timestamps: true // This will automatically manage createdAt and updatedAt
});

// Create indexes for common queries
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });

// Create the model
export const User = mongoose.model<UserDocument>('User', userSchema);

// Define the document interface
export interface UserDocument extends Document {
	username: string;
	email: string;
	password: string;
	fullName?: string;
	avatarUrl?: string;
	preferences: Record<string, any>;
	isVerified: boolean;
	lastLogin?: Date;
	createdAt: Date;
	updatedAt: Date;
}

// Create Zod schema for validation
export const userSchemaZod = z.object({
	username: z.string().min(3).max(30),
	email: z.string().email(),
	password: z.string().min(8),
	fullName: z.string().optional(),
	avatarUrl: z.string().url().optional(),
	preferences: z.record(z.any()).default({}),
	isVerified: z.boolean().default(false)
});