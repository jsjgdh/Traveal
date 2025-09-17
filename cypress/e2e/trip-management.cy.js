describe('Trip Management', () => {
  beforeEach(() => {
    cy.setMobileViewport()
    cy.registerDevice()
    cy.mockGeolocation(40.7128, -74.0060)
    cy.visit('/dashboard')
  })

  it('starts and stops trip detection', () => {
    // Start trip detection
    cy.get('[data-testid="start-trip-button"]').click()
    cy.contains('Trip Detection Active').should('be.visible')
    cy.get('[data-testid="trip-status-indicator"]').should('have.class', 'active')
    
    // Check trip details display
    cy.get('[data-testid="current-location"]').should('be.visible')
    cy.get('[data-testid="trip-duration"]').should('be.visible')
    cy.get('[data-testid="distance-traveled"]').should('be.visible')
    
    // Stop trip
    cy.get('[data-testid="stop-trip-button"]').click()
    cy.contains('Trip Completed').should('be.visible')
  })

  it('validates trip details', () => {
    // Complete a trip
    cy.get('[data-testid="start-trip-button"]').click()
    cy.wait(2000) // Simulate trip duration
    cy.get('[data-testid="stop-trip-button"]').click()
    
    // Trip validation screen should appear
    cy.contains('Validate Your Trip').should('be.visible')
    cy.get('[data-testid="trip-from-location"]').should('be.visible')
    cy.get('[data-testid="trip-to-location"]').should('be.visible')
    cy.get('[data-testid="trip-distance"]').should('be.visible')
    cy.get('[data-testid="trip-duration"]').should('be.visible')
    
    // Select trip purpose
    cy.get('[data-testid="purpose-work"]').click()
    
    // Set companions
    cy.get('[data-testid="companions-plus"]').click()
    cy.get('[data-testid="companions-count"]').should('contain', '1')
    
    // Add notes
    cy.get('[data-testid="trip-notes"]').type('Regular commute to office')
    
    // Confirm trip
    cy.get('[data-testid="confirm-trip-button"]').click()
    cy.contains('Trip Saved Successfully').should('be.visible')
  })

  it('allows manual trip entry', () => {
    cy.get('[data-testid="manual-trip-entry"]').click()
    
    // Fill trip details
    cy.get('[data-testid="origin-input"]').type('123 Main St, New York, NY')
    cy.get('[data-testid="destination-input"]').type('456 Work Ave, New York, NY')
    
    // Set date and time
    cy.get('[data-testid="trip-date"]').type('2024-03-15')
    cy.get('[data-testid="start-time"]').type('09:00')
    cy.get('[data-testid="end-time"]').type('09:30')
    
    // Select transportation mode
    cy.get('[data-testid="mode-subway"]').click()
    
    // Select purpose
    cy.get('[data-testid="purpose-work"]').click()
    
    // Save trip
    cy.get('[data-testid="save-manual-trip"]').click()
    cy.contains('Trip Added Successfully').should('be.visible')
  })

  it('shows trip history', () => {
    cy.visit('/trip/history')
    
    cy.contains('Trip History').should('be.visible')
    cy.get('[data-testid="trip-list"]').should('be.visible')
    
    // Test filters
    cy.get('[data-testid="filter-date-range"]').click()
    cy.get('[data-testid="last-week"]').click()
    
    cy.get('[data-testid="filter-purpose"]').click()
    cy.get('[data-testid="purpose-work"]').click()
    
    // Test trip details view
    cy.get('[data-testid="trip-item"]').first().click()
    cy.contains('Trip Details').should('be.visible')
    cy.get('[data-testid="trip-map"]').should('be.visible')
  })

  it('handles trip errors gracefully', () => {
    // Mock geolocation error
    cy.window().then((win) => {
      cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake((success, error) => {
        error({ code: 1, message: 'User denied geolocation' })
      })
    })
    
    cy.get('[data-testid="start-trip-button"]').click()
    cy.contains('Location access required').should('be.visible')
    cy.get('[data-testid="enable-location-button"]').should('be.visible')
  })
})