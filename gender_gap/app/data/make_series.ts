import type {LineSeriesOption, MapSeriesOption} from 'echarts/charts'
import {ColumnTable} from 'arquero'
import type {Info} from '../data/load'
import {selectableVariables, variableInfo} from '../metadata'
import {regression} from 'echarts-stat'
import {Panel, PlotInput} from '../parts/plot'
import {MapInput} from '../parts/map'
import {unique} from '../utils'
import type {ViewDef} from './view'

const firstLetters = /\b(\w)/g
const colors = ['#A3651E', '#2F8CBF', '#C4AB4B', '#72CED5', '#C8E9B6', '#7E1700', '#1549A2']
const symbols = ['triangle', 'diamond', 'rect', 'roundRect', 'pin', 'arrow', 'circle']
const colorSourceLegend = {gdp: 'name', region: 'region', income: 'income'}

function indexMap(data: ColumnTable, variable: string) {
  const levelMap: {[index: string]: number} = {}
  ;(
    data
      .ungroup()
      .rollup({l: `array_agg_distinct(d.${data.columnIndex(variable) === -1 ? 'level' : variable})`})
      .array('l')[0] as string[]
  ).forEach((l, i) => (levelMap[l] = i))
  return levelMap
}

export function makeSeries(
  filtered: ColumnTable,
  view: ViewDef,
  refs: {panelX: string; panelY: string; color: string; symbol: string},
  countryInfo: Info
) {
  const {panelX, panelY, color, symbol} = refs
  const xPanelLevels = panelX ? unique(filtered, panelX) : ['']
  const yPanelLevels = panelY ? unique(filtered, panelY) : ['']
  const nXLevels = xPanelLevels.length
  const nYLevels = yPanelLevels.length
  const data: (LineSeriesOption | MapSeriesOption)[] = []
  const fitData: LineSeriesOption[] = []
  const panels: Panel[] = []
  const symbolMap: {[index: string]: {symbol: string; opacity: number}} = {}
  const colorSource = view.color_source === 'gdp' ? 'color' : view.color_source + '_color'
  const lineVars: string[] = []
  if (view.time_agg == 'all') lineVars.push('year')
  if (view.as_plot) {
    if (color) lineVars.push(color)
    if (color && symbol) {
      lineVars.push(symbol)
      unique(filtered, symbol).forEach((l, i) => {
        symbolMap[l] = {
          symbol: symbols[i % 7],
          opacity: 0.8,
        }
      })
    }
  }
  const baseSeries: LineSeriesOption | MapSeriesOption = view.as_plot
    ? {
        type: 'line',
        symbolSize: 10,
        color: color ? '' : '#a5cdff',
        itemStyle: {opacity: 1},
        lineStyle: {width: 1, opacity: 1},
        emphasis: {
          focus: 'series',
          lineStyle: {
            width: 5,
            opacity: 1,
          },
        },
      }
    : {
        type: 'map',
        roam: true,
        map: 'countries',
        nameProperty: 'ISO_A3',
        itemStyle: {
          areaColor: '#00000000',
          borderWidth: 1,
        },
        select: {disabled: true},
        projection: {
          project: (point: number[]) => [
            (point[0] / 180) * Math.PI,
            -Math.log(Math.tan((Math.PI / 2 + (point[1] / 180) * Math.PI) / 2)),
          ],
          unproject: (point: number[]) => [
            (point[0] * 180) / Math.PI,
            ((2 * 180) / Math.PI) * Math.atan(Math.exp(point[1])) - 90,
          ],
        },
      }
  let index = -1
  const range = {
    x: [Infinity, -Infinity, -Infinity],
    y: [Infinity, -Infinity, -Infinity],
    panel: [nXLevels, yPanelLevels.length],
  }
  const varIndices: {[index: string]: number} = {}
  const toXY: {y: string; x?: string} = {y: view.y.baseFormula()}
  const baseFun: {[index: string]: string} = {
    n_years: 'distinct(d.year)',
    y: `${selectableVariables.includes(view.y.base) || view.y.isGlobal ? 'max' : 'sum'}(d.y)`,
    y_sum: 'max(d.y_sum)',
    year: 'max(d.year)',
  }
  if (view.as_plot && view.x.base) {
    baseFun.x = `${selectableVariables.includes(view.x.base) || view.x.isGlobal ? 'max' : 'sum'}(d.x)`
    baseFun.x_sum = 'max(d.x_sum)'
    toXY.x = view.x.baseFormula()
  }
  const colorMap = view.color && view.color !== 'country' ? indexMap(filtered, view.color) : {}

  const means: {[index: string]: string} = {
    y: view.y.percent ? 'mean(d.y)' : 'mean(d.y / d.n_years)',
    year: 'max(d.year)',
  }
  if (view.as_plot && view.x.base) means.x = view.x.percent ? 'mean(d.x)' : 'mean(d.x / d.n_years)'

  const toVariantY: {y: string; y_off?: string} = {y: view.y.formula('y')}
  const toVariantX: {x?: string; x_off?: string} = {}
  if (view.as_plot && view.x.base) toVariantX.x = view.x.formula('x')

  const groupVars = view.as_plot ? [...lineVars] : ['country']
  const countryCenter = groupVars.includes('country') && view.country_center && view.as_plot && view.time_agg === 'all'

  const summaries: {y?: string; y_off?: string; x?: string; x_off?: string} = {}
  const summaryDiv = {x: false, y: false}
  if (view.y.summary.variable) {
    summaries.y = view.y.summaryFormula('y')
    if (view.y.summary.adjust === '/') {
      summaryDiv.y = true
      summaries.y_off = view.y.offLevelFormula('y')
      baseFun.y_off = 'max(d.y_off)'
    }
    if (!view.y.summary.overall) baseFun.y_summary_sum = `max(d.y_summary_sum)`
    if (summaryDiv.y && view.y.percent)
      toVariantY.y_off = `d.y_off / d.y${view.y.summary.overall ? '' : '_summary'}_sum * 100`
  }
  if (view.as_plot && view.x.summary.variable) {
    summaries.x = view.x.summaryFormula('x')
    if (view.x.summary.adjust === '/') {
      summaryDiv.x = true
      summaries.x_off = view.x.offLevelFormula('x')
      baseFun.x_off = 'max(d.x_off)'
    }
    if (!view.x.summary.overall) baseFun.x_summary_sum = `max(d.x_summary_sum)`
    if (summaryDiv.x && view.x.percent)
      toVariantX.x_off = `d.x_off / d.x${view.x.summary.overall ? '' : '_summary'}_sum * 100`
  }

  const meanTime = view.time_agg === 'mean' || (view.time_agg === 'all' && !view.as_plot)
  const baseGroups: string[] = []
  if (view.as_plot && view.time_agg === 'all') baseGroups.push('year')
  if (view.color === 'country' || view.symbol === 'country') baseGroups.push('country')
  let prepedData = filtered.groupby(baseGroups).derive({
    x_sum: `sum(d.${view.x.base})`,
    y_sum: `sum(d.${view.y.base})`,
  })
  if (!view.within_split) {
    if (summaries.x) {
      prepedData = prepedData
        .groupby([...baseGroups, view.x.summary.variable].filter(v => !!v))
        .derive({x_summary_sum: `sum(d.${view.x.base})`})
    }
    if (summaries.y) {
      prepedData = prepedData
        .groupby([...baseGroups, view.y.summary.variable].filter(v => !!v))
        .derive({y_summary_sum: `sum(d.${view.y.base})`})
    }
  }
  const baseData = prepedData.groupby(groupVars)
  xPanelLevels.forEach((x, xi) => {
    yPanelLevels.forEach((y, yi) => {
      index++
      const label = (
        (x ? variableInfo[view.x_panels].label + ': ' + x + (y ? ', ' : '') : '') +
        (y ? variableInfo[view.y_panels].label + ': ' + y : '')
      )
        .replace('_', ' ')
        .replace(firstLetters, l => l.toUpperCase())
      let d = baseData
      if (panelX) d = d.filter(`d.${panelX} == '${x}'`)
      if (panelY) d = d.filter(`d.${panelY} == '${y}'`)
      if (!d.numRows()) return
      if (view.within_split) {
        if (summaries.x) {
          d = d
            .groupby([...baseGroups, view.x.summary.variable].filter(v => !!v))
            .derive({x_summary_sum: `sum(d.${view.x.base})`})
        }
        if (summaries.y) {
          d = d
            .groupby([...baseGroups, view.y.summary.variable].filter(v => !!v))
            .derive({y_summary_sum: `sum(d.${view.y.base})`})
        }
      }
      const nCountries = unique(d, 'country').length
      const fun = {...baseFun}
      d = d.derive(toXY)
      if (summaries.y || summaries.x) {
        d = d
          .derive(summaries)
          .groupby([...baseGroups, ...groupVars, view.x.summary.variable, view.y.summary.variable].filter(v => !!v))
          .rollup(fun)
        if (toVariantX.x) {
          d = d.groupby([...baseGroups, view.x.summary.variable].filter(v => !!v)).derive(toVariantX)
        }
        if (toVariantY.y) {
          d = d.groupby([...baseGroups, view.y.summary.variable].filter(v => !!v)).derive(toVariantY)
        }
        d = d.groupby(groupVars).rollup(fun)
        if (summaryDiv.y) d = d.derive({y: 'd.y_off ? d.y / d.y_off : 0'})
        if (summaryDiv.x) d = d.derive({x: 'd.x_off ? d.x / d.x_off : 0'})
      } else {
        d = d.rollup(fun)
        if (toVariantX.x) {
          d = d.groupby([...baseGroups, view.x.summary.variable].filter(v => !!v)).derive(toVariantX)
        }
        if (toVariantY.y) {
          d = d.groupby([...baseGroups, view.y.summary.variable].filter(v => !!v)).derive(toVariantY)
        }
      }
      if (countryCenter) {
        const centers: {y: string; x?: string} = {y: 'd.y - mean(d.y)', x: 'd.x - mean(d.x)'}
        d = d.groupby('country').derive(centers)
      }
      if (baseSeries.type === 'map') {
        if (meanTime) d = d.groupby(['country']).rollup(means)
        const series = {...baseSeries, geoIndex: index}
        series.name = label
        series.id = x + y
        const seriesData: {name: string; value: number; year: number}[] = []
        d.scan(i => {
          seriesData.push({
            name: d.get('country', i),
            value: d.get('y', i),
            year: meanTime ? '' : d.get('year', i),
          })
        })
        series.data = seriesData
        data.push(series)
      } else {
        const hasYear = lineVars.includes('year')
        if (meanTime) {
          delete means.year
          d = d.groupby(lineVars.filter(l => l !== 'year')).rollup(means)
          if (hasYear) lineVars.splice(lineVars.indexOf('year'), 1)
        }
        d = d
          .groupby(lineVars.filter((l, i) => !!i || l !== 'year'))
          .select(['x', 'y', ...lineVars, hasYear || meanTime ? '' : 'year'].filter(l => l !== ''))
        if (hasYear) d = d.orderby('year')
        d = d.reify()
        d.columnNames().forEach((v, i) => (varIndices[v] = i))
        const dataArray: number[][] = []
        d.partitions().forEach(inds => {
          const series = {...baseSeries, xAxisIndex: index, yAxisIndex: index} as LineSeriesOption
          series.id = x + y
          if (color) {
            const colorLevel = d.get(color, inds[0])
            series.id += colorLevel
            if (color === 'country') {
              if (colorLevel in countryInfo) {
                const info = countryInfo[colorLevel]
                series.name = info[colorSourceLegend[view.color_source]]
                series.color = info[colorSource] || '#898989'
              } else {
                series.name = colorLevel || label
                series.color = '#898989'
              }
            } else {
              series.name = colorLevel
              series.color = colors[colorMap[colorLevel]]
            }
            if (symbol) {
              series.name += ', ' + d.get(symbol, inds[0])
              const symbolId = d.get(symbol, inds[0])
              const symbolData = symbolMap[symbolId]
              series.id += symbolId
              series.symbol = symbolData.symbol
              if (series.lineStyle && series.itemStyle) {
                series.lineStyle.opacity = series.itemStyle.opacity = symbolData.opacity
              }
            } else {
              series.symbol = 'circle'
            }
          } else {
            series.name = 'series'
          }
          if (series.name) {
            const seriesData: (string | number)[][] = []
            series.data = seriesData
            inds.forEach(i => {
              const data = Object.values(d.object(i))
              dataArray.push([data[0], data[1]])
              seriesData.push(data)
            })
            data.push(series)
          }
        })
        panels.push({
          label,
          top: 0,
          height: 0,
          left: 0,
          width: 0,
          yIndex: yi,
          nYLevels: nYLevels,
          xIndex: xi,
          nXLevels: nXLevels,
          nCountries,
        })
        if (view.regression !== 'none') {
          const fit = regression(view.regression, dataArray, 2)
          fitData.push({
            name: 'fit',
            type: 'line',
            color: '#898989',
            smooth: true,
            showSymbol: false,
            data: fit.points,
            xAxisIndex: index,
            yAxisIndex: index,
            lineStyle: {width: 1},
          })
        }
      }
      const y_range = d.ungroup().rollup({value: '[min(d.y), quantile(d.y, .97), max(d.y)]'}).array('value')[0]
      range.y[0] = Math.min(range.y[0], y_range[0])
      range.y[1] = Math.max(range.y[1], y_range[1])
      range.y[2] = Math.max(range.y[2], y_range[2])
      if (view.as_plot) {
        const x_range = d.ungroup().rollup({value: '[min(d.x), quantile(d.x, .97), max(d.x)]'}).array('value')[0]
        range.x[0] = Math.min(range.x[0], x_range[0])
        range.x[1] = Math.max(range.x[1], x_range[1])
        range.x[2] = Math.max(range.x[2], x_range[2])
      }
    })
  })
  return view.as_plot
    ? ({series: data, fits: fitData, panels, range, varIndices} as PlotInput)
    : ({series: data, range, varIndices} as MapInput)
}
