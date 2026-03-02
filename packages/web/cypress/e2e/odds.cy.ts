describe('Odds Calculator', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('displays the page title and upload area', () => {
    cy.contains('C-3PO').should('be.visible');
    cy.contains('UPLOAD INTERCEPTED DATA').should('be.visible');
    cy.contains('Drop empire.json here or click to browse').should('be.visible');
  });

  it('uploads empire.json and displays 0% odds (example 1)', () => {
    const empireData = {
      countdown: 7,
      bounty_hunters: [
        { planet: 'Hoth', day: 6 },
        { planet: 'Hoth', day: 7 },
        { planet: 'Hoth', day: 8 },
      ],
    };

    cy.get('#empire-file').selectFile(
      {
        contents: Cypress.Buffer.from(JSON.stringify(empireData)),
        fileName: 'empire.json',
        mimeType: 'application/json',
      },
      { force: true },
    );

    cy.contains('0%').should('be.visible');
    cy.contains('cannot reach Endor').should('be.visible');
  });

  it('uploads empire.json and displays 81% odds (example 2)', () => {
    const empireData = {
      countdown: 8,
      bounty_hunters: [
        { planet: 'Hoth', day: 6 },
        { planet: 'Hoth', day: 7 },
        { planet: 'Hoth', day: 8 },
      ],
    };

    cy.get('#empire-file').selectFile(
      {
        contents: Cypress.Buffer.from(JSON.stringify(empireData)),
        fileName: 'empire.json',
        mimeType: 'application/json',
      },
      { force: true },
    );

    cy.contains('81%').should('be.visible');
    cy.contains('Bounty hunters may intercept').should('be.visible');
  });

  it('uploads empire.json and displays 100% odds (example 4)', () => {
    const empireData = {
      countdown: 10,
      bounty_hunters: [
        { planet: 'Hoth', day: 6 },
        { planet: 'Hoth', day: 7 },
        { planet: 'Hoth', day: 8 },
      ],
    };

    cy.get('#empire-file').selectFile(
      {
        contents: Cypress.Buffer.from(JSON.stringify(empireData)),
        fileName: 'empire.json',
        mimeType: 'application/json',
      },
      { force: true },
    );

    cy.contains('100%').should('be.visible');
    cy.contains('will reach Endor safely').should('be.visible');
  });

  it('handles invalid JSON gracefully', () => {
    cy.get('#empire-file').selectFile(
      {
        contents: Cypress.Buffer.from('not valid json'),
        fileName: 'bad.json',
        mimeType: 'application/json',
      },
      { force: true },
    );

    cy.contains('ERROR').should('be.visible');
  });
});
