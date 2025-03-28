import { Venue } from '../shared/schema';

// Hardcoded venue data
const venues = [
  {
    name: "Ölstugan Tullen Kålltorp",
    venueType: "bar",
    address: "Björcksgatan 39, 416 52 Göteborg, Sverige",
    location: {
      type: "Point",
      coordinates: [12.0277995, 57.71705749999999] // [longitude, latitude]
    },
    hasSunnySpot: true,
    sunHoursStart: "15:00",
    sunHoursEnd: "18:30",
    hasHeaters: false,
    city: "Göteborg",
    area: "Östra Centrum",
    website: "https://www.olstugan.se/kalltorp"
  },
  {
    name: "The Old Beefeater Inn",
    venueType: "bar",
    address: "Plantagegatan 1, 413 05 Göteborg, Sverige",
    location: {
      type: "Point",
      coordinates: [11.9506935, 57.6973912]
    },
    hasSunnySpot: true,
    sunHoursStart: "11:00",
    sunHoursEnd: "17:00",
    hasHeaters: true,
    city: "Göteborg",
    area: "Linné",
    website: "https://www.beefeaterinn.se/"
  },
  {
    name: "Restaurang Jesper",
    venueType: "restaurant",
    address: "Kungstorget 13, 411 10 Göteborg, Sverige",
    location: {
      type: "Point",
      coordinates: [11.9687689, 57.70370740000001]
    },
    hasSunnySpot: true,
    sunHoursStart: "12:00",
    sunHoursEnd: "19:00",
    hasHeaters: true,
    city: "Göteborg",
    area: "Inom Vallgraven",
    website: "https://restaurangjesper.se/"
  },
  {
    name: "La Piccola Gondola",
    venueType: "restaurant",
    address: "Kungstorget 15, 411 10 Göteborg, Sverige",
    location: {
      type: "Point",
      coordinates: [11.9684089, 57.7035699]
    },
    hasSunnySpot: true,
    sunHoursStart: "11:30",
    sunHoursEnd: "17:30",
    hasHeaters: true,
    city: "Göteborg",
    area: "Inom Vallgraven",
    website: "http://gondola.se/"
  },
  {
    name: "Allora",
    venueType: "bar",
    address: "Kaserntorget 7, 411 18 Göteborg, Sverige",
    location: {
      type: "Point",
      coordinates: [11.9619678, 57.70269099999999]
    },
    hasSunnySpot: true,
    sunHoursStart: "12:00",
    sunHoursEnd: "19:00",
    hasHeaters: true,
    city: "Göteborg",
    area: "Inom Vallgraven",
    website: "https://www.instagram.com/alloragbg/"
  },
  {
    name: "Ngon",
    venueType: "restaurant",
    address: "Friggagatan 4, 411 01 Göteborg, Sverige",
    location: {
      type: "Point",
      coordinates: [11.9864261, 57.7106897]
    },
    hasSunnySpot: true,
    sunHoursStart: "11:00",
    sunHoursEnd: "15:00",
    hasHeaters: false,
    city: "Göteborg",
    area: "Östra Centrum",
    website: "https://ngongbg.se/"
  },
  {
    name: "Armans Coffee",
    venueType: "cafe",
    address: "Plantagegatan 17, 413 05 Göteborg, Sverige",
    location: {
      type: "Point",
      coordinates: [11.9479289, 57.69720829999999]
    },
    hasSunnySpot: true,
    sunHoursStart: "09:00",
    sunHoursEnd: "20:00",
    hasHeaters: true,
    city: "Göteborg",
    area: "Linné",
    website: "https://www.facebook.com/ARMANs-154786997913625/"
  },
  {
    name: "Bellora",
    venueType: "restaurant",
    address: "Kungsportsavenyen 6, 411 38 Göteborg, Sverige",
    location: {
      type: "Point",
      coordinates: [11.9739829, 57.70169799999999]
    },
    hasSunnySpot: true,
    sunHoursStart: "12:00",
    sunHoursEnd: "21:00",
    hasHeaters: true,
    city: "Göteborg",
    area: "Avenyn",
    website: "https://www.hotelbellora.se/"
  },
  {
    name: "Ostindiska Ölkompaniet",
    venueType: "bar",
    address: "Danska vägen 110, 416 59 Göteborg, Sverige",
    location: {
      type: "Point",
      coordinates: [12.004437, 57.71482870000001]
    },
    hasSunnySpot: true,
    sunHoursStart: "12:00",
    sunHoursEnd: "18:30",
    hasHeaters: true,
    city: "Göteborg",
    area: "Östra Centrum",
    website: "https://www.olkompaniet.com/en/danskavagen/"
  }
];

// Main function to import Swedish locations
export async function importSwedishLocations() {
  console.log('Starting Swedish locations import...');

  // Check if venues already exist in DB
  const venueCount = await Venue.countDocuments();
  if (venueCount > 0) {
    console.log(`Skipping import as ${venueCount} venues already exist in the database.`);
    return;
  }

  try {
    // Import each venue
    for (const venue of venues) {
      try {
        console.log('Processing venue:', venue.name);
        const createdVenue = await Venue.create(venue);
        console.log(`Imported venue: ${venue.name} with coordinates [${venue.location.coordinates[0]}, ${venue.location.coordinates[1]}]`);
      } catch (error) {
        console.error(`Error importing venue ${venue.name}:`, error);
      }
    }

    console.log('Swedish locations import completed successfully');
  } catch (error) {
    console.error('Error during Swedish locations import:', error);
    throw error;
  }
}

// Export the function for use in the main server file
export default importSwedishLocations;