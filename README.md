# SunSpotter 🌞

A web application that helps users find sunny outdoor dining spots in Göteborg. The app calculates sun exposure for various venues throughout the day, helping users make informed decisions about where to enjoy their outdoor dining experience.

## Features

- 🗺️ Interactive map showing restaurants, cafes, and bars with outdoor seating
- ☀️ Real-time sun position calculations
- 🏢 Building shadow analysis for accurate sunlight predictions
- 🔍 Search and filter venues by type and location
- ⏰ Time-based sun exposure information
- 🌡️ Information about venues with outdoor heaters

## Live Demo

Check out the live demo of the frontend application on GitHub Pages:
[https://jacob-mounir.github.io/sunApp/](https://jacob-mounir.github.io/sunApp/)

Note: The GitHub Pages deployment only includes the frontend static files. For full functionality, you'll need to deploy the backend API separately.

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

## Deployment

### GitHub Pages (Frontend Only)

To deploy the frontend to GitHub Pages:

1. Make sure your changes are committed and pushed to GitHub
2. Run the deploy script:

   ```bash
   npm run deploy
   ```

This will:

1. Build the project with the GitHub Pages base path
2. Push the built files to the `gh-pages` branch
3. Deploy the website to GitHub Pages

### Backend Deployment

For a fully functional application, you'll need to deploy the backend separately. Consider using services like:

- Heroku
- Render
- Railway
- AWS, Google Cloud, or Azure

Remember to update the `apiBaseUrl` in `client/src/config.ts` to point to your deployed backend API.

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
