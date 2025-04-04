import mongoose, { Connection } from 'mongoose';
import { config } from './config';

// Create MongoDB connection
const connectionString = config.MONGODB_URI || '';

// Add connection event handlers
mongoose.connection.on('connected', () => {
	console.log('MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
	console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
	console.log('MongoDB disconnected');
});

// Connect to MongoDB with options
mongoose.connect(connectionString, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverSelectionTimeoutMS: 5000,
	socketTimeoutMS: 45000,
});

export const db: Connection = mongoose.connection;

// Handle application termination
process.on('SIGINT', async () => {
	await mongoose.connection.close();
	console.log('MongoDB connection closed through app termination');
	process.exit(0);
});