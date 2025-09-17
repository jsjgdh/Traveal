// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command for onboarding flow testing
Cypress.Commands.add('completeOnboarding', () => {
  cy.visit('/')
  cy.contains('Welcome to Traveal').should('be.visible')
  cy.get('[data-testid="welcome-next-button"]').click()
  
  // Privacy consent
  cy.get('[data-testid="location-allow-tracking"]').check()
  cy.get('[data-testid="consent-next-button"]').click()
  
  // Complete setup
  cy.get('[data-testid="complete-onboarding-button"]').click()
})

// Custom command for simulating device registration
Cypress.Commands.add('registerDevice', () => {
  cy.window().then((win) => {
    win.localStorage.setItem('deviceId', 'test-device-123')
    win.localStorage.setItem('userConsent', JSON.stringify({
      locationData: { allowTracking: true },
      dataCollection: true,
      notifications: true
    }))
  })
})

// Custom command for mocking geolocation
Cypress.Commands.add('mockGeolocation', (latitude = 40.7128, longitude = -74.0060) => {
  cy.window().then((win) => {
    cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake((success) => {
      return success({
        coords: {
          latitude,
          longitude,
          accuracy: 10
        }
      })
    })
  })
})

// Custom command for testing notification permissions
Cypress.Commands.add('mockNotificationPermission', (permission = 'granted') => {
  cy.window().then((win) => {
    cy.stub(win.Notification, 'permission').value(permission)
    cy.stub(win.Notification, 'requestPermission').resolves(permission)
  })
})