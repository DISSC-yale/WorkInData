import type {ViewDef} from '../../app/data/view'
import {Variable} from '../../app/data/variable'
import {ColumnTable, loadJSON, not} from 'arquero'
import {makeSeries} from '../../app/data/make_series'

const LFPVariants: Variable[] = [
  new Variable({
    base: 'count',
    percent: true,
    subset: {variable: 'main_activity', level: 'Out of Workforce', adjust: '-'},
  }),
  new Variable({
    base: 'count',
    percent: true,
    subset: {variable: 'main_activity', level: 'Out of Workforce', adjust: '-'},
    summary: {variable: 'sex', level: 'Female', adjust: '-'},
  }),
]

const genderGrowthGap = loadJSON('/WorkInData/gender_gap/data.json.gz')
const worldBank = loadJSON('/WorkInData/gender_gap/world_bank.json.gz')

function checkValues(expected: number[], data: ColumnTable, view: ViewDef) {
  const {series} = makeSeries(
    data,
    view,
    {panelX: view.x_panels, panelY: view.y_panels, color: view.color, symbol: view.symbol},
    {}
  )
  expected.forEach((v, i) => {
    const d = series[i].data as number[][]
    expect(d[0][0].toFixed(6)).to.equal(v.toFixed(6))
  })
}

describe('tests aggregated results', () => {
  it('aggregates properly', () => {
    cy.fixture('data.json', 'utf8').then(async content => {
      const refData = JSON.parse(content)
      const totals: {[index: string]: number} = {overall: 0, workForce: 0, MaleWorkForce: 0, FemaleWorkForce: 0}
      Object.keys(refData).forEach(level => {
        const [sex, sector] = level.split('.')
        if (!(sex in totals)) totals[sex] = 0
        if (!(sector in totals)) totals[sector] = 0
        const value = refData[level]
        totals.overall += value
        totals[sex] += value
        totals[sector] += value
        if (sector !== 'Out of Workforce') {
          totals.workForce += value
          totals[sex + 'WorkForce'] += value
        }
      })

      const data = (await genderGrowthGap)
        .derive({country_year: 'd.country + d.year'})
        .join(
          (await worldBank).derive({country_year: 'd.country + d.year'}).select(not('country', 'year')),
          'country_year'
        )
        .select(not('country_year'))
        .derive({labor_force: 'd.main_activity !== "Out of Workforce"'})
        .filter('d.country === "MEX" && d.year === 2018')

      const view: ViewDef = {
        as_plot: true,
        lock_range: false,
        country_center: false,
        color_source: 'gdp',
        x: new Variable({base: 'count', percent: false}),
        y: new Variable({base: 'gdp', log: false}),
        color: 'country',
        symbol: '',
        x_panels: '',
        y_panels: '',
        time_agg: 'last',
        select_year: '2018',
        advanced: true,
        regression: 'none',
        within_split: true,
      }
      const dataTotal = data.filter('d.variable === "total"')
      checkValues([totals.overall], dataTotal, view)
      view.x = LFPVariants[0]
      checkValues([(totals.workForce / totals.overall) * 100], dataTotal, view)
      view.x = LFPVariants[1].copy()
      checkValues(
        [(totals.FemaleWorkForce / totals.Female) * 100 - (totals.MaleWorkForce / totals.Male) * 100],
        dataTotal,
        view
      )
      view.x.summary.adjust = '/'
      checkValues(
        [((totals.FemaleWorkForce / totals.Female) * 100) / ((totals.MaleWorkForce / totals.Male) * 100 + 1e-6)],
        dataTotal,
        view
      )
      view.x.summary.overall = true
      checkValues(
        [((totals.FemaleWorkForce / totals.overall) * 100) / ((totals.MaleWorkForce / totals.overall) * 100 + 1e-6)],
        dataTotal,
        view
      )
      view.x.summary.adjust = '-'
      checkValues(
        [(totals.FemaleWorkForce / totals.overall) * 100 - (totals.MaleWorkForce / totals.overall) * 100],
        dataTotal,
        view
      )
      view.symbol = 'sex'
      view.x = LFPVariants[0].copy()
      checkValues(
        [(totals.MaleWorkForce / totals.overall) * 100, (totals.FemaleWorkForce / totals.overall) * 100],
        dataTotal,
        view
      )
      view.x.updateLevel('subset', {key: 'remove'})
      checkValues([(totals.Male / totals.overall) * 100, (totals.Female / totals.overall) * 100], dataTotal, view)
      view.x.percent = false
      checkValues([totals.Male, totals.Female], dataTotal, view)
    })
  })
})
