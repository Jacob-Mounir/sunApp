import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';

// Define the venue type enum
export const VenueType = z.enum(['restaurant', 'cafe', 'bar', 'park', 'beach', 'other']);
export type VenueType = z.infer<typeof VenueType>;

// Define the venue schema
const venueSchema = new Schema({
	name: { type: String, required: true },
	venueType: { type: String, required: true, enum: VenueType.options },
	address: { type: String, required: true },
	location: {
		type: { type: String, enum: ['Point'], default: 'Point' },
		coordinates: { type: [Number], required: true } // [longitude, latitude]
	},
	rating: { type: Number },
	placeId: { type: String },
	hasSunnySpot: { type: Boolean, default: true },
	sunnySpotDescription: { type: String },
	imageUrl: {
		type: String,
		default: null,
		get: function (url: string | null) {
			return url || null;
		},
		set: function (url: string | null) {
			return url || null;
		}
	},
	city: { type: String },
	area: { type: String },
	sunHoursStart: { type: String },
	sunHoursEnd: { type: String },
	hasHeaters: { type: Boolean, default: false },
	website: { type: String },
	hours: {
		monday: { type: String },
		tuesday: { type: String },
		wednesday: { type: String },
		thursday: { type: String },
		friday: { type: String },
		saturday: { type: String },
		sunday: { type: String }
	},
	contact: {
		phoneNumber: { type: String },
		email: { type: String },
		instagramUrl: { type: String },
		facebookUrl: { type: String }
	},
	isVerified: { type: Boolean, default: false },
	lastUpdated: { type: Date, default: Date.now },
	createdAt: { type: Date, default: Date.now }
}, {
	timestamps: true, // This will automatically manage createdAt and updatedAt
	toJSON: { getters: true }, // Enable getters when converting to JSON
	toObject: { getters: true } // Enable getters when converting to plain objects
});

// Create geospatial index for location-based queries
venueSchema.index({ location: '2dsphere' });

// Create indexes for common queries
venueSchema.index({ venueType: 1 });
venueSchema.index({ city: 1 });
venueSchema.index({ area: 1 });
venueSchema.index({ rating: -1 });

// Create the model
export const Venue = mongoose.model<VenueDocument>('Venue', venueSchema);

// Define the document interface
export interface VenueDocument extends Document {
	name: string;
	venueType: VenueType;
	address: string;
	location: {
		type: 'Point';
		coordinates: [number, number];
	};
	rating?: number;
	placeId?: string;
	hasSunnySpot: boolean;
	sunnySpotDescription?: string;
	imageUrl?: string;
	city?: string;
	area?: string;
	sunHoursStart?: string;
	sunHoursEnd?: string;
	hasHeaters: boolean;
	website?: string;
	hours: {
		monday?: string;
		tuesday?: string;
		wednesday?: string;
		thursday?: string;
		friday?: string;
		saturday?: string;
		sunday?: string;
	};
	contact: {
		phoneNumber?: string;
		email?: string;
		instagramUrl?: string;
		facebookUrl?: string;
	};
	isVerified: boolean;
	lastUpdated: Date;
	createdAt: Date;
}

// Create Zod schema for validation
export const venueSchemaZod = z.object({
	name: z.string(),
	venueType: VenueType,
	address: z.string(),
	location: z.object({
		type: z.literal('Point'),
		coordinates: z.tuple([z.number(), z.number()])
	}),
	rating: z.number().optional(),
	placeId: z.string().optional(),
	hasSunnySpot: z.boolean().default(true),
	sunnySpotDescription: z.string().optional(),
	imageUrl: z.string().optional(),
	city: z.string().optional(),
	area: z.string().optional(),
	sunHoursStart: z.string().optional(),
	sunHoursEnd: z.string().optional(),
	hasHeaters: z.boolean().default(false),
	website: z.string().optional(),
	hours: z.object({
		monday: z.string().optional(),
		tuesday: z.string().optional(),
		wednesday: z.string().optional(),
		thursday: z.string().optional(),
		friday: z.string().optional(),
		saturday: z.string().optional(),
		sunday: z.string().optional()
	}),
	contact: z.object({
		phoneNumber: z.string().optional(),
		email: z.string().optional(),
		instagramUrl: z.string().optional(),
		facebookUrl: z.string().optional()
	}),
	isVerified: z.boolean().default(false)
});