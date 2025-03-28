import { defineConfig } from 'cypress';
import { devServer } from '@cypress/webpack-dev-server';

export default defineConfig({
	component: {
		devServer(devServerConfig) {
			return devServer({
				...devServerConfig,
				framework: 'react',
				webpackConfig: require('./vite.config.ts'),
			});
		},
	},
	e2e: {
		baseUrl: 'http://localhost:5173',
		supportFile: 'cypress/support/e2e.ts',
		specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
		video: false,
		screenshotOnRunFailure: true,
	},
});