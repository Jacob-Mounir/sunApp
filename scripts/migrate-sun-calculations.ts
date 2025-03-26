import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function migrateSunCalculations() {
  console.log('Starting migration for sun_calculations table...');
  
  try {
    // Check if the sunny_periods column exists
    let checkColumnQuery = sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'sun_calculations' AND column_name = 'sunny_periods'
      );
    `;
    
    let [columnExists] = await db.execute(checkColumnQuery);
    
    if (!columnExists.exists) {
      console.log('Column sunny_periods does not exist. Adding it now...');
      
      // Add the sunny_periods column
      await db.execute(sql`
        ALTER TABLE sun_calculations
        ADD COLUMN sunny_periods TEXT;
      `);
      
      console.log('Column sunny_periods added successfully.');
    } else {
      console.log('Column sunny_periods already exists.');
    }
    
    // Check if calculation_timestamp column exists
    checkColumnQuery = sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'sun_calculations' AND column_name = 'calculation_timestamp'
      );
    `;
    
    [columnExists] = await db.execute(checkColumnQuery);
    
    if (!columnExists.exists) {
      console.log('Column calculation_timestamp does not exist. Adding it now...');
      
      // Add the calculation_timestamp column
      await db.execute(sql`
        ALTER TABLE sun_calculations
        ADD COLUMN calculation_timestamp TEXT NOT NULL DEFAULT current_timestamp;
      `);
      
      console.log('Column calculation_timestamp added successfully.');
    } else {
      console.log('Column calculation_timestamp already exists.');
    }
    
    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    process.exit(0);
  }
}

migrateSunCalculations();