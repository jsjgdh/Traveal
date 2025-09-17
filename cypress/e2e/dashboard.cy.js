describe('Dashboard Navigation', () => {
  beforeEach(() => {
    cy.setMobileViewport()
    cy.registerDevice()
    cy.visit('/dashboard')
  })

  it('displays main dashboard elements', () => {
    cy.contains('NATPAC').should('be.visible')
    cy.get('[data-testid="bottom-navigation"]').should('be.visible')
    cy.get('[data-testid="quick-actions"]').should('be.visible')
  })

  it('navigates between main sections', () => {
    // Test bottom navigation
    cy.get('[data-testid="nav-discover"]').click()
    cy.url().should('include', '/discover')
    
    cy.get('[data-testid="nav-rewards"]').click()
    cy.url().should('include', '/rewards')
    
    cy.get('[data-testid="nav-profile"]').click()
    cy.url().should('include', '/profile')
    
    cy.get('[data-testid="nav-settings"]').click()
    cy.url().should('include', '/settings')
    
    // Return to home
    cy.get('[data-testid="nav-home"]').click()
    cy.url().should('include', '/dashboard')
  })

  it('shows active trip detection', () => {
    cy.mockGeolocation(40.7128, -74.0060)
    
    // Start a trip
    cy.get('[data-testid="start-trip-button"]').click()
    cy.contains('Trip Detection Active').should('be.visible')
    cy.get('[data-testid="active-trip-indicator"]').should('be.visible')
    
    // Stop trip
    cy.get('[data-testid="stop-trip-button"]').click()
    cy.contains('Trip Completed').should('be.visible')
  })

  it('displays notification bell with count', () => {
    cy.get('[data-testid="notification-bell"]').should('be.visible')
    
    // Mock notifications
    cy.window().then((win) => {
      win.localStorage.setItem('notifications', JSON.stringify([
        { id: 1, type: 'achievement', message: 'New badge earned!' },
        { id: 2, type: 'trip', message: 'Trip validation needed' }
      ]))
    })
    
    cy.reload()
    cy.get('[data-testid="notification-count"]').should('contain', '2')
    
    cy.get('[data-testid="notification-bell"]').click()
    cy.get('[data-testid="notification-center"]').should('be.visible')
  })
})