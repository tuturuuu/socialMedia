describe('Authentication flow', () => {
  const appUrl = Cypress.config('baseUrl') || 'http://localhost:3000'

  it('registers a new user, logs in, and logs out', () => {
    const uniqueId = `${Date.now()}-${Cypress._.random(1000, 9999)}`
    const username = `e2e_user_${uniqueId}`
    const email = `e2e-${uniqueId}@example.com`
    const age = '25'
    const password = 'Password123!'

    cy.visit(`${appUrl}/register`)

    cy.get('#usernameInput').type(username)
    cy.get('#emailInput').type(email)
    cy.get('#ageInput').type(age)
    cy.get('#passwordInput').type(password)
    cy.get('#repeatPasswordInput').type(password)
    cy.get('input[type="submit"][value="Register"]').click()

    cy.url().should('eq', `${appUrl}/login`)

    cy.get('#emailInput').type(email)
    cy.get('#passwordInput').type(password)
    cy.contains('button', 'Sign in').click()

    cy.url().should('eq', `${appUrl}/`)
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.be.a('string').and.not.be.empty
    })

    cy.contains('a', 'Sign out').click()

    cy.url().should('eq', `${appUrl}/login`)
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.be.null
    })
    cy.contains('button', 'Sign in').should('be.visible')
  })
})
