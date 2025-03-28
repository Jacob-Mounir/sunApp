-- Drop existing tables and types if they exist
DROP TABLE IF EXISTS sun_calculations CASCADE;
DROP TABLE IF EXISTS weather_data CASCADE;
DROP TABLE IF EXISTS saved_locations CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS venues CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS venue_type CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Create enum type for venue types
CREATE TYPE venue_type AS ENUM ('restaurant', 'cafe', 'bar', 'park', 'beach', 'other');

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}'::jsonb,
    is_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create venues table
CREATE TABLE venues (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    venue_type TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    rating REAL,
    place_id TEXT,
    has_sunny_spot BOOLEAN DEFAULT true,
    sunny_spot_description TEXT,
    image_url TEXT,
    city TEXT,
    area TEXT,
    sun_hours_start TEXT,
    sun_hours_end TEXT,
    has_heaters BOOLEAN DEFAULT false,
    website TEXT,
    monday_hours TEXT,
    tuesday_hours TEXT,
    wednesday_hours TEXT,
    thursday_hours TEXT,
    friday_hours TEXT,
    saturday_hours TEXT,
    sunday_hours TEXT,
    phone_number TEXT,
    email TEXT,
    instagram_url TEXT,
    facebook_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create reviews table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    venue_id INTEGER NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL,
    comment TEXT,
    sun_rating INTEGER,
    shade_rating INTEGER,
    best_time_to_visit TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create saved_locations table
CREATE TABLE saved_locations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    venue_id INTEGER NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create weather_data table
CREATE TABLE weather_data (
    id SERIAL PRIMARY KEY,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    temperature REAL,
    weather_condition TEXT,
    icon TEXT,
    timestamp TEXT NOT NULL,
    forecast JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sun_calculations table
CREATE TABLE sun_calculations (
    id SERIAL PRIMARY KEY,
    venue_id INTEGER NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    sunrise_time TEXT,
    sunset_time TEXT,
    sunny_periods JSONB,
    calculation_timestamp TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_venues_location ON venues(latitude, longitude);
CREATE INDEX idx_venues_type ON venues(venue_type);
CREATE INDEX idx_venues_city ON venues(city);
CREATE INDEX idx_venues_area ON venues(area);
CREATE INDEX idx_reviews_venue_id ON reviews(venue_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_saved_locations_user_id ON saved_locations(user_id);
CREATE INDEX idx_saved_locations_venue_id ON saved_locations(venue_id);
CREATE INDEX idx_weather_data_location ON weather_data(latitude, longitude);
CREATE INDEX idx_weather_data_timestamp ON weather_data(timestamp);
CREATE INDEX idx_sun_calculations_venue_id ON sun_calculations(venue_id);
CREATE INDEX idx_sun_calculations_date ON sun_calculations(date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_locations_updated_at
    BEFORE UPDATE ON saved_locations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_venues_last_updated
    BEFORE UPDATE ON venues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();