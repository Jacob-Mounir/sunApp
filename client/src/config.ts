// Determine the API URL based on the environment
const isProduction = import.meta.env.PROD;
const isGitHubPages = import.meta.env.BASE_URL.includes('github.io');

// If it's GitHub Pages, use a deployed API endpoint
// For now, we'll define a placeholder - this needs to be replaced with a real API endpoint
let apiBaseUrl = '/api';

if (isProduction && isGitHubPages) {
	// Replace with your actual Render deployed API endpoint
	apiBaseUrl = 'https://sunspotter-api.onrender.com/api';
}

export const config = {
	apiBaseUrl,
};

export default config;