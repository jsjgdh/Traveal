describe('Onboarding Flow', () => {
  beforeEach(() => {
    cy.setMobileViewport()
    cy.visit('/')
  })

  it('completes full onboarding process', () => {
    // Welcome step
    cy.contains('Welcome to Traveal').should('be.visible')
    cy.contains('Your journey to sustainable travel starts here').should('be.visible')
    cy.get('[data-testid="welcome-get-started"]').should('be.visible')
    cy.get('[data-testid="welcome-get-started"]').click()
    
    // Privacy consent step
    cy.contains('Privacy & Data Consent').should('be.visible')
    cy.get('[data-testid="location-allow-tracking"]').should('exist')
    cy.get('[data-testid="location-allow-tracking"]').check({ force: true })
    cy.get('[data-testid="data-collection"]').check({ force: true })
    cy.get('[data-testid="analytics"]').check({ force: true })
    cy.get('[data-testid="notifications"]').check({ force: true })
    cy.get('[data-testid="consent-accept-all"]').click()
    
    // Setup complete step
    cy.contains('Setup Complete').should('be.visible')
    cy.get('[data-testid="complete-onboarding-button"]').should('be.visible')
    cy.get('[data-testid="complete-onboarding-button"]').click()
    
    // Should navigate to dashboard
    cy.url().should('include', '/dashboard')
    cy.contains('NATPAC').should('be.visible')
  })

  it('allows navigation back to previous steps', () => {
    cy.get('[data-testid="welcome-get-started"]').click()
    
    // Go to privacy consent
    cy.contains('Privacy & Data Consent').should('be.visible')
    
    // Navigate back
    cy.get('[data-testid="back-button"]').click()
    cy.contains('Welcome to Traveal').should('be.visible')
  })

  it('shows progress indicator correctly', () => {
    // Check initial progress
    cy.get('[data-testid="progress-bar"]').should('be.visible')
    cy.get('[data-testid="progress-step-1"]').should('have.class', 'active')
    
    cy.get('[data-testid="welcome-get-started"]').click()
    
    // Check progress after moving to step 2
    cy.get('[data-testid="progress-step-2"]').should('have.class', 'active')
  })

  it('handles custom privacy preferences', () => {
    cy.get('[data-testid="welcome-get-started"]').click()
    
    // Click custom instead of accept all
    cy.get('[data-testid="consent-custom"]').click()
    
    // Customize preferences
    cy.get('[data-testid="location-allow-tracking"]').check({ force: true })
    cy.get('[data-testid="data-collection"]').check({ force: true })
    cy.get('[data-testid="data-sharing"]').uncheck({ force: true })
    cy.get('[data-testid="analytics"]').check({ force: true })
    cy.get('[data-testid="notifications"]').uncheck({ force: true })
    
    cy.get('[data-testid="consent-save-preferences"]').click()
    
    // Should proceed to completion
    cy.contains('Setup Complete').should('be.visible')
  })

  it('validates required consent fields', () => {
    cy.get('[data-testid="welcome-get-started"]').click()
    
    // Try to proceed without essential consents
    cy.get('[data-testid="consent-next-button"]').click()
    
    // Should show validation error
    cy.contains('Please provide consent for location tracking').should('be.visible')
    
    // Provide minimum required consent
    cy.get('[data-testid="location-allow-tracking"]').check({ force: true })
    cy.get('[data-testid="data-collection"]').check({ force: true })
    cy.get('[data-testid="consent-next-button"]').click()
    
    // Should proceed
    cy.contains('Setup Complete').should('be.visible')
  })
})