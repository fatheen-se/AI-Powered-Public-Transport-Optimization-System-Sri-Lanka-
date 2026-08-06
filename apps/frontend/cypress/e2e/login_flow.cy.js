describe('Authentication Flow', () => {
  it('Should load the login page', () => {
    cy.visit('/')
    cy.contains('Transport Optimization System')
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
  })

  it('Should show error on invalid credentials', () => {
    cy.visit('/')
    cy.get('input[type="email"]').type('invalid@test.com')
    cy.get('input[type="password"]').type('wrongpassword')
    cy.get('button').contains('Sign In').click()
    cy.contains('Invalid email or password').should('be.visible')
  })

  it('Should login as passenger and redirect to tracking dashboard', () => {
    // Note: We use cy.intercept to mock the backend response during E2E frontend tests
    // to prevent hitting the real DB and dealing with test data pollution.
    cy.intercept('POST', '**/api/token/', {
      statusCode: 200,
      body: {
        access: 'mock-access-token',
        refresh: 'mock-refresh-token'
      }
    }).as('loginRequest')
    
    // Mock user profile fetch
    cy.intercept('GET', '**/api/users/me/', {
      statusCode: 200,
      body: {
        id: 1,
        email: 'passenger@test.com',
        is_passenger: true,
        is_driver: false,
        is_authority: false
      }
    }).as('userRequest')

    cy.visit('/')
    cy.get('input[type="email"]').type('passenger@test.com')
    cy.get('input[type="password"]').type('testpassword123')
    cy.get('button').contains('Sign In').click()

    cy.wait('@loginRequest')
    cy.wait('@userRequest')

    cy.url().should('include', '/passenger/dashboard')
    cy.contains('Passenger Dashboard').should('be.visible')
  })
})
