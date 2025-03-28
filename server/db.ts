import mongoose from 'mongoose';
import { config } from './config';

// Create MongoDB connection
const connectionString = config.MONGODB_URI || '';
mongoose.connect(connectionString);

export const db = mongoose.connection;