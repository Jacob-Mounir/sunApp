import { exec } from 'child_process';
import { promisify } from 'util';
import { config } from '../config';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

export class DatabaseBackup {
	private static readonly BACKUP_DIR = path.join(process.cwd(), 'backups');

	static async createBackup(): Promise<string> {
		try {
			// Create backup directory if it doesn't exist
			if (!fs.existsSync(this.BACKUP_DIR)) {
				fs.mkdirSync(this.BACKUP_DIR, { recursive: true });
			}

			// Generate backup filename with timestamp
			const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
			const backupFile = path.join(this.BACKUP_DIR, `backup-${timestamp}.json`);

			// Use mongodump to create backup
			const { stdout, stderr } = await execAsync(`mongodump --uri="${config.MONGODB_URI}" --out="${backupFile}"`);

			if (stderr) {
				console.error('Backup stderr:', stderr);
			}

			console.log('Backup created successfully:', backupFile);
			return backupFile;
		} catch (error) {
			console.error('Failed to create backup:', error);
			throw new Error('Database backup failed');
		}
	}

	static async restoreBackup(backupFile: string): Promise<void> {
		try {
			if (!fs.existsSync(backupFile)) {
				throw new Error('Backup file not found');
			}

			// Use mongorestore to restore backup
			const { stdout, stderr } = await execAsync(`mongorestore --uri="${config.MONGODB_URI}" "${backupFile}"`);

			if (stderr) {
				console.error('Restore stderr:', stderr);
			}

			console.log('Backup restored successfully');
		} catch (error) {
			console.error('Failed to restore backup:', error);
			throw new Error('Database restore failed');
		}
	}

	static async listBackups(): Promise<string[]> {
		try {
			if (!fs.existsSync(this.BACKUP_DIR)) {
				return [];
			}

			return fs.readdirSync(this.BACKUP_DIR)
				.filter(file => file.startsWith('backup-') && file.endsWith('.json'))
				.map(file => path.join(this.BACKUP_DIR, file));
		} catch (error) {
			console.error('Failed to list backups:', error);
			throw new Error('Failed to list backups');
		}
	}

	static async cleanupOldBackups(maxBackups: number = 5): Promise<void> {
		try {
			const backups = await this.listBackups();
			if (backups.length <= maxBackups) {
				return;
			}

			// Sort backups by creation time (newest first)
			const sortedBackups = backups.sort((a, b) => {
				const timeA = fs.statSync(a).birthtime;
				const timeB = fs.statSync(b).birthtime;
				return timeB.getTime() - timeA.getTime();
			});

			// Remove oldest backups
			for (let i = maxBackups; i < sortedBackups.length; i++) {
				fs.unlinkSync(sortedBackups[i]);
				console.log(`Removed old backup: ${sortedBackups[i]}`);
			}
		} catch (error) {
			console.error('Failed to cleanup old backups:', error);
			throw new Error('Failed to cleanup old backups');
		}
	}
}