import { DatabaseBackup } from './backup';
import { config } from '../config';

export class Scheduler {
	private static backupInterval: NodeJS.Timeout | null = null;

	static startScheduledBackups(intervalHours: number = 24): void {
		if (this.backupInterval) {
			console.log('Backup scheduler is already running');
			return;
		}

		// Convert hours to milliseconds
		const intervalMs = intervalHours * 60 * 60 * 1000;

		// Create backup immediately
		this.createBackup();

		// Schedule regular backups
		this.backupInterval = setInterval(() => {
			this.createBackup();
		}, intervalMs);

		console.log(`Scheduled backups every ${intervalHours} hours`);
	}

	static stopScheduledBackups(): void {
		if (this.backupInterval) {
			clearInterval(this.backupInterval);
			this.backupInterval = null;
			console.log('Stopped scheduled backups');
		}
	}

	private static async createBackup(): Promise<void> {
		try {
			const backupFile = await DatabaseBackup.createBackup();
			console.log(`Created backup: ${backupFile}`);

			// Cleanup old backups
			await DatabaseBackup.cleanupOldBackups(5);
		} catch (error) {
			console.error('Failed to create scheduled backup:', error);
		}
	}
}