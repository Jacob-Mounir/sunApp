import mongoose from 'mongoose';
import { config } from '../config';

export async function connectDB() {
	try {
		const mongoURI = config.MONGODB_URI;
		if (!mongoURI) {
			throw new Error('MONGODB_URI is not defined in environment variables');
		}

		console.log('Connecting to MongoDB...');
		await mongoose.connect(mongoURI);
		console.log('✅ Connected to MongoDB successfully');

		// Handle connection errors after initial connection
		mongoose.connection.on('error', (err) => {
			console.error('MongoDB connection error:', err);
		});

		// Handle disconnection
		mongoose.connection.on('disconnected', () => {
			console.warn('MongoDB disconnected. Attempting to reconnect...');
			setTimeout(connectDB, 5000);
		});

	} catch (error) {
		console.error('❌ MongoDB connection error:', error);
		process.exit(1);
	}
}

// Export models
export * from '../models/Venue';
export * from '../models/User';
export * from '../models/Review';