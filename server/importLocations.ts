import { storage } from './storage';
import * as fs from 'fs';
import * as path from 'path';
import { InsertVenue } from '@shared/schema';

interface SwedishLocation {
  title: string;
  stad: string;
  soltimmar: string;
  typ: string[];
  adress: {
    city: string;
    location: {
      latitude: number;
      longitude: number;
    };
    streetAddress: {
      number: string;
      name: string;
      apt: string;
    };
    formatted: string;
    country: string;
    postalCode: string;
  };
  hemsida: string;
  område: string;
  värmare: string;
}

// Function to convert venue type from Swedish to our schema format
function convertVenueType(type: string[]): string {
  if (!type || type.length === 0) {
    return 'cafe';
  }
  
  const primaryType = type[0].toLowerCase();
  if (primaryType.includes('restaurang')) {
    return 'restaurant';
  } else if (primaryType.includes('bar')) {
    return 'bar';
  } else if (primaryType.includes('café') || primaryType.includes('cafe')) {
    return 'cafe';
  } else if (primaryType.includes('park')) {
    return 'park';
  }
  
  return 'cafe'; // Default
}

// Function to parse sun hours
function parseSunHours(sunHours: string): { start: string, end: string } {
  if (!sunHours) {
    return { start: '12:00', end: '18:00' };
  }
  
  const parts = sunHours.split('-').map(part => part.trim());
  if (parts.length === 2) {
    return { 
      start: parts[0], 
      end: parts[1] === 'Solnedgång' ? '21:00' : parts[1] // handle "Solnedgång" (sunset)
    };
  }
  
  return { start: '12:00', end: '18:00' }; // Default
}

// Function to parse and convert the Swedish location data
async function importSwedishLocations() {
  try {
    // Read the CSV file
    const csvPath = path.join(process.cwd(), 'attached_assets', 'Uteserveringar.csv');
    const fileContent = fs.readFileSync(csvPath, 'utf8');
    
    // Basic CSV parsing (simplified for this specific format)
    const lines = fileContent.split('\n').filter(line => line.trim().length > 0);
    
    // Skip the header
    const dataLines = lines.slice(1);
    
    for (const line of dataLines) {
      try {
        // This is a simplified parser for the specific CSV structure
        // Parse the line into a SwedishLocation object
        const matches = line.match(/"([^"]*)",([^,]*),([^,]*),(\[[^\]]*\]),(\{[^}]*\}),([^,]*),([^,]*),([^,]*)/);
        
        if (!matches) {
          console.error(`Failed to parse line: ${line}`);
          continue;
        }
        
        const title = matches[1].replace(/"/g, '');
        const stad = matches[2];
        const soltimmar = matches[3];
        let typ;
        try {
          typ = JSON.parse(matches[4].replace(/"{2,}/g, '"').replace(/"""/g, '"'));
        } catch (e) {
          typ = ['Cafe'];
        }
        
        let adress;
        try {
          adress = JSON.parse(matches[5].replace(/"{2,}/g, '"').replace(/"""/g, '"'));
        } catch (e) {
          console.error(`Failed to parse address: ${matches[5]}`);
          continue;
        }
        
        const hemsida = matches[6];
        const område = matches[7];
        const värmare = matches[8];
        
        // Convert to our venue format
        const sunHours = parseSunHours(soltimmar);
        
        const venue: InsertVenue = {
          name: title,
          venueType: convertVenueType(typ),
          address: adress.formatted,
          latitude: adress.location.latitude,
          longitude: adress.location.longitude,
          hasSunnySpot: true,
          sunnySpotDescription: `Sunny hours: ${soltimmar}`,
          city: stad,
          area: område,
          sunHoursStart: sunHours.start,
          sunHoursEnd: sunHours.end,
          hasHeaters: värmare.toLowerCase() === 'ja',
          website: hemsida
        };
        
        // Save to database
        const savedVenue = await storage.createVenue(venue);
        console.log(`Imported: ${savedVenue.name}`);
      } catch (err) {
        console.error(`Error processing venue: ${err}`);
      }
    }
    
    console.log('Import completed');
  } catch (err) {
    console.error(`Import failed: ${err}`);
  }
}

// Execute the import
importSwedishLocations();