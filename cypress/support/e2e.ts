// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Hide XHR requests from command log
const app = window.top;
if (app) {
	app.console.log = () => { };
}

// Add custom commands here
Cypress.Commands.add('login', (email: string, password: string) => {
	cy.visit('/login');
	cy.get('input[name="email"]').type(email);
	cy.get('input[name="password"]').type(password);
	cy.get('button[type="submit"]').click();
});

// Declare custom commands
declare global {
	namespace Cypress {
		interface Chainable {
			login(email: string, password: string): Chainable<void>;
		}
	}
}