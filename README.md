# SunSpotter 🌞

A web application that helps users find sunny outdoor dining spots in Göteborg. The app calculates sun exposure for various venues throughout the day, helping users make informed decisions about where to enjoy their outdoor dining experience.

## Features

- 🗺️ Interactive map showing restaurants, cafes, and bars with outdoor seating
- ☀️ Real-time sun position calculations
- 🏢 Building shadow analysis for accurate sunlight predictions
- 🔍 Search and filter venues by type and location
- ⏰ Time-based sun exposure information
- 🌡️ Information about venues with outdoor heaters

## Tech Stack

### Frontend

- React with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Leaflet for interactive maps

### Backend

- Node.js with Express
- MongoDB for data storage
- SunCalc for solar calculations
- Winston for logging

## Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account
- Git

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/Jacob-Mounir/sunApp.git
   cd sunApp
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the MongoDB connection string and other variables:

   ```
   MONGODB_URI=your_mongodb_connection_string
   PORT=3000
   NODE_ENV=development
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

   This will start both the backend server (port 3000) and frontend client (port 5175).

## Project Structure

```
sunApp/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/        # Custom React hooks
│   │   └── utils/        # Utility functions
├── server/                # Backend Node.js application
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   └── utils/            # Utility functions
├── shared/               # Shared types and utilities
└── types/                # TypeScript type definitions
```

## API Endpoints

- `GET /api/venues` - Get all venues
- `GET /api/venues/:id` - Get venue by ID
- `GET /api/venues/nearby` - Get venues near coordinates
- `GET /api/sun/position` - Get sun position for given time and location

## Testing

Run the test suite:

```bash
npm test
```

For end-to-end testing with Cypress:

```bash
npm run cypress:open
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Data provided by Göteborg Stad
- Built with ❤️ for sunny days in Göteborg
