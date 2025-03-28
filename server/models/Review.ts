import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';

// Define the review schema
const reviewSchema = new Schema({
	venue: { type: Schema.Types.ObjectId, ref: 'Venue', required: true },
	user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	rating: { type: Number, required: true, min: 1, max: 5 },
	comment: { type: String },
	sunRating: { type: Number, min: 1, max: 5 },
	shadeRating: { type: Number, min: 1, max: 5 },
	bestTimeToVisit: { type: String }
}, {
	timestamps: true // This will automatically manage createdAt and updatedAt
});

// Create indexes for common queries
reviewSchema.index({ venue: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ rating: -1 });

// Create the model
export const Review = mongoose.model<ReviewDocument>('Review', reviewSchema);

// Define the document interface
export interface ReviewDocument extends Document {
	venue: mongoose.Types.ObjectId;
	user: mongoose.Types.ObjectId;
	rating: number;
	comment?: string;
	sunRating?: number;
	shadeRating?: number;
	bestTimeToVisit?: string;
	createdAt: Date;
	updatedAt: Date;
}

// Create Zod schema for validation
export const reviewSchemaZod = z.object({
	venue: z.string(), // MongoDB ObjectId as string
	user: z.string(), // MongoDB ObjectId as string
	rating: z.number().min(1).max(5),
	comment: z.string().optional(),
	sunRating: z.number().min(1).max(5).optional(),
	shadeRating: z.number().min(1).max(5).optional(),
	bestTimeToVisit: z.string().optional()
});