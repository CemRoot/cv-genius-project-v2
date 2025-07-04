describe('Skills category select background', () => {
  beforeEach(() => {
    // Visit builder page
    cy.visit('/builder')
    // Wait for page load
    cy.contains('Add Skill', { timeout: 10000 })
  })

  it('should have white background in add skill form', () => {
    // Open add skill form
    cy.contains('Add Skill').click()

    // the category select should exist
    cy.get('select#skillCategory')
      .should('exist')
      // computed background color should be white (rgb(255, 255, 255))
      .should('have.css', 'background-color', 'rgb(255, 255, 255)')
  })
})