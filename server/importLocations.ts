import fs from 'fs';
import path from 'path';
import { storage } from './storage';
import { InsertVenue } from '../shared/schema';
import { db } from './db';
import { venues } from '../shared/schema';
import { count } from 'drizzle-orm';

interface SwedishLocation {
  Title: string;
  Stad: string;
  Soltimmar: string;
  Typ: string;
  Adress: string;
  Hemsida: string;
  Område: string;
  Värmare: string;
}

function convertVenueType(type: string): string {
  // Extract the venue type string from the format "[\"Restaurant\"]"
  const cleanType = type.replace(/\[|\]|"/g, '').toLowerCase();
  
  if (cleanType.includes('restaurang')) {
    return 'restaurant';
  } else if (cleanType.includes('café') || cleanType.includes('cafe')) {
    return 'cafe';
  } else if (cleanType.includes('bar')) {
    return 'bar';
  } else if (cleanType.includes('park')) {
    return 'park';
  } else {
    return 'restaurant'; // Default to restaurant if unclear
  }
}

function parseSunHours(sunHours: string): { start: string, end: string } {
  if (!sunHours || sunHours === 'N/A') {
    return { start: '12:00', end: '17:00' }; // Default values
  }
  
  // Handle special case "12:00 - Solnedgång" (sunset)
  if (sunHours.includes('Solnedgång')) {
    const start = sunHours.split(' - ')[0];
    return { start, end: '21:00' }; // Assuming sunset is around 9 PM
  }
  
  const parts = sunHours.split(' - ');
  if (parts.length !== 2) {
    return { start: '12:00', end: '17:00' }; // Default values if format is unexpected
  }
  
  return { start: parts[0], end: parts[1] };
}

function parseAddressJson(addressStr: string): {
  formatted: string;
  latitude: number;
  longitude: number;
  city: string;
} {
  try {
    // The CSV contains JSON-like strings that need proper formatting
    const cleanAddressStr = addressStr.replace(/""""/, '"').replace(/""""/g, '"');
    const addressObj = JSON.parse(cleanAddressStr);
    
    return {
      formatted: addressObj.formatted,
      latitude: addressObj.location.latitude,
      longitude: addressObj.location.longitude,
      city: addressObj.city
    };
  } catch (error) {
    console.error("Error parsing address:", error);
    // Return default values if parsing fails
    return {
      formatted: "Unknown address",
      latitude: 57.70887,  // Default to Gothenburg city center
      longitude: 11.97456, 
      city: "Göteborg"
    };
  }
}

export async function importSwedishLocations() {
  console.log('Starting Swedish locations import...');
  
  // Check if venues already exist in DB
  const venueCount = await db.select({ count: count() }).from(venues);
  if (venueCount[0].count > 0) {
    console.log(`Skipping import as ${venueCount[0].count} venues already exist in the database.`);
    return;
  }

  try {
    const csvFilePath = path.resolve('./attached_assets/Uteserveringar.csv');
    const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
    
    // Split the CSV by lines and process manually
    const lines = fileContent.split('\n').filter(line => line.trim() !== '');
    const headers = lines[0].split(',');
    
    console.log(`Found ${lines.length - 1} venues to import`);
    
    // Process each record starting from index 1 (skip headers)
    for (let i = 1; i < lines.length; i++) {
      try {
        // Parse the line carefully considering quoted fields that may contain commas
        const record = parseCSVLine(lines[i]);
        
        // Create a location object
        const location: SwedishLocation = {
          Title: record[0] || '',
          Stad: record[1] || '',
          Soltimmar: record[2] || '',
          Typ: record[3] || '',
          Adress: record[4] || '',
          Hemsida: record[5] || '',
          Område: record[6] || '',
          Värmare: record[7] || ''
        };
        
        // Parse address information from the JSON-like string
        const addressInfo = parseAddressJson(location.Adress);
        
        // Parse sun hours
        const sunHours = parseSunHours(location.Soltimmar);
        
        // Convert venue type
        const venueType = convertVenueType(location.Typ);
        
        // Determine if the venue has heaters
        const hasHeaters = location.Värmare.toLowerCase() === 'ja';
        
        const venue: InsertVenue = {
          name: location.Title,
          venueType,
          address: addressInfo.formatted,
          latitude: addressInfo.latitude,
          longitude: addressInfo.longitude,
          city: addressInfo.city,
          area: location.Område,
          sunHoursStart: sunHours.start,
          sunHoursEnd: sunHours.end,
          hasHeaters,
          website: location.Hemsida,
          hasSunnySpot: true, // Assuming all records in the CSV have sunny spots
          rating: null,
          sunnySpotDescription: null,
          imageUrl: null,
          placeId: null
        };
        
        await storage.createVenue(venue);
        console.log(`Imported venue: ${venue.name}`);
      } catch (error) {
        console.error(`Error importing venue on line ${i}:`, error);
      }
    }
    
    console.log('Import completed successfully!');
  } catch (error) {
    console.error("Error reading CSV file:", error);
  }
}

// Helper function to parse CSV lines that contain quoted fields with commas
function parseCSVLine(line: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last field
  result.push(current);
  
  return result;
}

// Export the function for use in the main server file
export default importSwedishLocations;