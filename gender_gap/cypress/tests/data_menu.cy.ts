function setSelect(labelId: string, option: string) {
  cy.get('#' + labelId)
    .parent()
    .click()
  cy.get('ul[aria-labelledby="' + labelId + '"]').within(() => {
    cy.get('li[data-value="' + option + '"]').click()
  })
}

describe('tests data menu', () => {
  it('can select to the lowest level (basic)', () => {
    cy.visit('/', {timeout: 5000})
    setSelect('basic_y_subset_select', 'Unemployed')
    setSelect('basic_y_summary_select', 'Female')
    setSelect('basic_x_select', 'gdp_ppptrue')
    setSelect('color_basis_select', 'region')
    setSelect('basic_y_panel_select', 'age')
    setSelect('basic_time_agg_select', 'all')
  })
  it('can select to the lowest level (advanced)', () => {
    cy.visit('/', {timeout: 5000})
    cy.get('.MuiFormControlLabel-label').contains('Advanced Menu').prev().click()
    cy.get('label')
      .contains('Countries')
      .parent()
      .within(() => {
        cy.get('button[title="Clear"]').click({force: true})
        cy.get('input').click()
      })
    cy.get('div[role="presentation"]').within(() => {
      cy.get('li').contains('Mexico').click()
    })
    cy.get('#symbol_select').click({force: true})
    setSelect('symbol_select', 'sex')
    setSelect('x_panels_select', 'age')
    setSelect('y_panels_select', 'age')
    setSelect('x_panels_select', 'main_activity')
  })
})
