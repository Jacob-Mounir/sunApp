// Determine the API URL based on the environment
const isProduction = import.meta.env.PROD;
const isGitHubPages = import.meta.env.BASE_URL.includes('github.io');

// If it's GitHub Pages, use a deployed API endpoint
// For now, we'll define a placeholder - this needs to be replaced with a real API endpoint
let apiBaseUrl = '/api';

if (isProduction && isGitHubPages) {
	// This should be replaced with your actual deployed API endpoint
	apiBaseUrl = 'https://your-deployed-api.com/api';
}

export const config = {
	apiBaseUrl,
};

export default config;