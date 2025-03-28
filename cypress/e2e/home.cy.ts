describe('Home Page', () => {
	beforeEach(() => {
		cy.visit('/');
	});

	it('loads the home page', () => {
		cy.get('h1').should('exist');
	});

	it('has working navigation', () => {
		cy.get('nav').should('exist');
		cy.get('nav a').should('have.length.at.least', 1);
	});
});