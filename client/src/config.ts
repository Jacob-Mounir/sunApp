// Determine the API URL based on the environment
const isProduction = import.meta.env.PROD;
const isGitHubPages = import.meta.env.BASE_URL.includes('github.io');
const isRenderFrontend = isProduction && !isGitHubPages;

// Default to local development API
let apiBaseUrl = '/api';

if (isProduction) {
	if (isGitHubPages) {
		// For GitHub Pages deployment (pointing to Render backend)
		apiBaseUrl = 'https://sunspotter-api.onrender.com/api';
	} else if (isRenderFrontend) {
		// For Render deployment (frontend and backend on same domain)
		// Use the API service URL from render.yaml
		apiBaseUrl = 'https://sunspotter-api.onrender.com/api';
	}
}

export const config = {
	apiBaseUrl,
};

export default config;