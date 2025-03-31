import { MongoError } from 'mongodb';

export class MongoErrorHandler {
	static handle(error: unknown): { message: string; code: string } {
		if (error instanceof MongoError) {
			switch (error.code) {
				case 11000: // Duplicate key error
					return {
						message: 'A record with this value already exists',
						code: 'DUPLICATE_KEY'
					};
				case 121: // Document failed validation
					return {
						message: 'Invalid data format',
						code: 'VALIDATION_ERROR'
					};
				case 11600: // Interrupted operation
					return {
						message: 'Operation was interrupted',
						code: 'INTERRUPTED'
					};
				default:
					return {
						message: 'Database operation failed',
						code: 'DATABASE_ERROR'
					};
			}
		}

		return {
			message: 'An unexpected error occurred',
			code: 'UNKNOWN_ERROR'
		};
	}
}