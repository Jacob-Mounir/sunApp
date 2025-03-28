import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import { config } from '../config';
import fs from 'fs';
import path from 'path';

async function migrate() {
	try {
		// Create database connection
		const connectionString = config.DATABASE_URL;
		if (!connectionString) {
			throw new Error('DATABASE_URL is not set in environment variables');
		}

		console.log('Connecting to database...');
		const client = postgres(connectionString);
		const db = drizzle(client);

		// Read migration file
		const migrationPath = path.join(process.cwd(), 'migrations', '0000_initial_schema.sql');
		if (!fs.existsSync(migrationPath)) {
			throw new Error(`Migration file not found at ${migrationPath}`);
		}

		console.log('Reading migration file...');
		const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

		// Split SQL into statements, handling dollar-quoted strings
		const statements = migrationSQL
			.split(/(?<=;)\s+/)
			.map(statement => statement.trim())
			.filter(statement => statement.length > 0 && !statement.startsWith('--'));

		console.log(`Found ${statements.length} SQL statements to execute`);

		// Execute each statement
		for (const statement of statements) {
			try {
				await db.execute(sql.raw(statement));
				console.log('✓ Executed:', statement.substring(0, 50) + '...');
			} catch (error) {
				console.error('✗ Error executing statement:', error);
				console.error('Failed statement:', statement);
				throw error;
			}
		}

		console.log('✅ Migration completed successfully');
	} catch (error) {
		console.error('❌ Migration failed:', error);
		process.exit(1);
	} finally {
		process.exit(0);
	}
}

// Run migration
migrate();