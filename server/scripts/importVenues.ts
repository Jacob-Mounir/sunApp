import { parse } from 'csv-parse';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { config } from '../config';
import { Venue } from '../models/Venue';

interface VenueCSV {
	Title: string;
	Stad: string;
	Soltimmar: string;
	Typ: string;
	Adress: string;
	Hemsida: string;
	Område: string;
	Värmare: string;
}

async function importVenues() {
	try {
		// Connect to MongoDB
		const mongoURI = config.MONGODB_URI;
		if (!mongoURI) {
			throw new Error('MONGODB_URI is not defined in environment variables');
		}

		console.log('Connecting to MongoDB...');
		await mongoose.connect(mongoURI);
		console.log('✅ Connected to MongoDB successfully');

		// Read and parse CSV file
		const csvFilePath = path.join(process.cwd(), 'Uteserveringar.csv');
		console.log(`Reading CSV file from: ${csvFilePath}`);

		if (!fs.existsSync(csvFilePath)) {
			throw new Error(`CSV file not found at: ${csvFilePath}`);
		}

		const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
		console.log('CSV file content length:', fileContent.length);

		// Split the content into lines and process each line
		const lines = fileContent.split('\n').filter(line => line.trim());
		const records: VenueCSV[] = [];

		// Process each line after the header
		for (let i = 1; i < lines.length; i++) {
			const line = lines[i];
			const record: any = {};

			// Split the line into fields, handling quoted values
			let currentField = '';
			let inQuotes = false;
			let fields: string[] = [];
			let jsonDepth = 0;

			for (let j = 0; j < line.length; j++) {
				const char = line[j];

				if (char === '"') {
					if (inQuotes && line[j + 1] === '"') {
						// Handle escaped quotes
						currentField += '"';
						j++; // Skip the next quote
					} else {
						inQuotes = !inQuotes;
					}
				} else if (char === '{' && inQuotes) {
					jsonDepth++;
					currentField += char;
				} else if (char === '}' && inQuotes) {
					jsonDepth--;
					currentField += char;
				} else if (char === ',' && !inQuotes && jsonDepth === 0) {
					fields.push(currentField);
					currentField = '';
				} else {
					currentField += char;
				}
			}

			// Add the last field
			fields.push(currentField);

			// Map fields to record
			record.Title = fields[0]?.replace(/^"|"$/g, '') || '';
			record.Stad = fields[1]?.replace(/^"|"$/g, '') || '';
			record.Soltimmar = fields[2]?.replace(/^"|"$/g, '') || '';
			record.Typ = fields[3]?.replace(/^"|"$/g, '') || '';
			record.Adress = fields[4]?.replace(/^"|"$/g, '') || '';
			record.Hemsida = fields[5]?.replace(/^"|"$/g, '') || '';
			record.Område = fields[6]?.replace(/^"|"$/g, '') || '';
			record.Värmare = fields[7]?.replace(/^"|"$/g, '') || '';

			records.push(record as VenueCSV);
		}

		console.log(`Found ${records.length} records to process`);

		// Debug: Log the first record to see its structure
		if (records.length > 0) {
			console.log('First record structure:', JSON.stringify(records[0], null, 2));
		}

		// Transform and insert venues
		const venues = records.map((record, index) => {
			try {
				// Validate required fields
				if (!record.Title) {
					console.error(`Record ${index} is missing Title`);
					return null;
				}
				if (!record.Adress) {
					console.error(`Record ${index} is missing Adress`);
					return null;
				}
				if (!record.Typ) {
					console.error(`Record ${index} is missing Typ`);
					return null;
				}

				// Parse the address JSON string
				let addressData;
				try {
					const cleanAddress = record.Adress.replace(/""/g, '"');
					addressData = JSON.parse(cleanAddress);
				} catch (error) {
					console.error(`Error parsing address for ${record.Title}:`, error);
					console.error('Raw address:', record.Adress);
					return null;
				}

				// Parse the type array
				let venueType;
				try {
					const cleanType = record.Typ.replace(/""/g, '"');
					venueType = JSON.parse(cleanType)[0];
				} catch (error) {
					console.error(`Error parsing type for ${record.Title}:`, error);
					console.error('Raw type:', record.Typ);
					return null;
				}

				return {
					name: record.Title,
					venueType: venueType.toLowerCase(),
					address: addressData.formatted,
					location: {
						type: 'Point',
						coordinates: [addressData.location.longitude, addressData.location.latitude]
					},
					city: addressData.city,
					area: record.Område || '',
					sunHoursStart: record.Soltimmar ? record.Soltimmar.split(' - ')[0] : '',
					sunHoursEnd: record.Soltimmar ? record.Soltimmar.split(' - ')[1] : '',
					hasHeaters: record.Värmare ? record.Värmare.toLowerCase() === 'ja' : false,
					website: record.Hemsida || '',
					isVerified: true,
					createdAt: new Date(),
					lastUpdated: new Date()
				};
			} catch (error) {
				console.error(`Error processing record ${index}:`, error);
				console.error('Record data:', JSON.stringify(record, null, 2));
				return null;
			}
		}).filter(Boolean); // Remove any null entries from failed processing

		if (venues.length === 0) {
			throw new Error('No valid venues to import');
		}

		// Insert venues into database
		const result = await Venue.insertMany(venues);
		console.log(`✅ Successfully imported ${result.length} venues`);

		// Create indexes
		await Venue.collection.createIndex({ location: '2dsphere' });
		await Venue.collection.createIndex({ venueType: 1 });
		await Venue.collection.createIndex({ city: 1 });
		await Venue.collection.createIndex({ area: 1 });

		console.log('✅ Created necessary indexes');

	} catch (error) {
		console.error('❌ Error importing venues:', error);
		process.exit(1);
	} finally {
		await mongoose.disconnect();
		process.exit(0);
	}
}

// Run the import
importVenues();