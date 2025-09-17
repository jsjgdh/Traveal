// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Add custom commands for accessibility testing
Cypress.Commands.add('checkA11y', (context, options) => {
  cy.injectAxe()
  cy.checkA11y(context, options)
})

// Add commands for testing with different viewport sizes
Cypress.Commands.add('setMobileViewport', () => {
  cy.viewport(375, 667)
})

Cypress.Commands.add('setTabletViewport', () => {
  cy.viewport(768, 1024)
})

Cypress.Commands.add('setDesktopViewport', () => {
  cy.viewport(1280, 720)
})