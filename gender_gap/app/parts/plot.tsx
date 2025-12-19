'use client'

import {use, init, getInstanceByDom} from 'echarts/core'
import {LineChart, type LineSeriesOption} from 'echarts/charts'
import {
  DatasetComponent,
  GraphicComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
} from 'echarts/components'
import {useCallback, useContext, useEffect, useRef} from 'react'
import {CanvasRenderer} from 'echarts/renderers'
import {Info} from '../data/load'
import {Box, useColorScheme} from '@mui/material'
import {formatNumber, tooltipPlacer} from '../utils'
import type {Variable} from '../data/variable'
import {FilterActionContext, FilterContext, ViewDef} from '../data/view'

function axisMin({min}: {min: number}, adj = 1) {
  return +(min < 0 || min - adj > 0 ? min - adj : min > 0.1 ? min : 0).toFixed(2)
}
function axisMax({max}: {max: number}, adj = 1) {
  return +(max + adj).toFixed(2)
}
function assignRanges(range: number[], options: AxisOptions, lock: boolean) {
  const adj = range[0] > 1900 ? 0 : Math.max(0.01, Math.abs(range[0] - range[1]) * 0.02)
  if (lock) {
    options.min = +(range[0] - adj).toFixed(2)
    options.max = +(range[2] + adj).toFixed(2)
  } else {
    options.min = (params: {min: number}) => axisMin(params, adj)
    options.max = (params: {max: number}) => axisMax(params, adj)
  }
}
type AxisOptions = {
  min?: number | (({min}: {min: number}) => number)
  max?: number | (({max}: {max: number}) => number)
  axisLabel?: {formatter: (x: number) => string}
}
function formatNumberAxis(x: number, variable: Variable) {
  if (variable.base === 'year') return x
  if (variable.isGlobal && variable.log) return formatNumber(Math.round(Math.E ** x))
  const x_abs = Math.abs(x)
  const ndec = x_abs < 1 ? 3 : 2
  return x_abs > 1e3
    ? x_abs > 2e9
      ? x.toExponential(1)
      : x_abs > 1e9
      ? (x / 1e9).toFixed(ndec) + 'B'
      : x_abs < 1e6
      ? (x / 1e3).toFixed(ndec) + 'K'
      : (x / 1e6).toFixed(ndec) + 'M'
    : x_abs % 1 === 0
    ? '' + x
    : x.toFixed(ndec)
}
const baseYAxisOptions: AxisOptions = {
  min: axisMin,
  max: axisMax,
}
const baseXAxisOptions: AxisOptions = {}
export type Panel = {
  label: string
  top: number
  height: number
  left: number
  width: number
  legendWidth?: number
  yIndex: number
  nYLevels: number
  xIndex: number
  nXLevels: number
  nCountries: number
}
export type PlotInput = {
  series: LineSeriesOption[]
  fits: LineSeriesOption[]
  panels: Panel[]
  range: {x: number[]; y: number[]; panel: number[]}
  varIndices: {[index: string]: number}
}
const panelSpacing = {
  textGapX: 30,
  textGapY: 50,
  top: 50,
  topNoLabel: 40,
  left: 95,
  bottom: 20,
  gapX: 73,
  gapY: 85,
  legendWidth: 0,
}
const panelContainer: {current: Panel[]} = {current: []}
function resizePanels(frame: {height: number; width: number}, grid: Panel[]) {
  const topGap = panelSpacing[panelContainer.current[0].label === '' ? 'topNoLabel' : 'top']
  const frameHeight = frame.height - (topGap + panelSpacing.bottom + panelSpacing.gapY * grid[0].nYLevels)
  const panelHeight = frameHeight / grid[0].nYLevels
  const frameWidth = frame.width - (panelSpacing.left + panelSpacing.legendWidth + panelSpacing.gapX * grid[0].nXLevels)
  const panelWidth = frameWidth / grid[0].nXLevels
  const title: {label: string; left: number; top: number; nCountries: number}[] = []
  grid.forEach(g => {
    g.left = g.xIndex ? panelWidth * g.xIndex + panelSpacing.gapX * (g.xIndex + 1) + 20 : panelSpacing.left
    g.top = g.yIndex ? panelHeight * g.yIndex + panelSpacing.gapY * (g.yIndex + 1) - 35 : topGap
    g.height = panelHeight
    g.width = panelWidth
    title.push({
      label: g.label,
      left: g.left - panelSpacing.textGapX,
      top: g.top - panelSpacing.textGapY,
      nCountries: g.nCountries,
    })
  })
  return {title, grid}
}

export default function Plot({
  input,
  view,
  countryInfo,
  modeOverride,
}: {
  input: PlotInput
  view: ViewDef
  countryInfo: Info
  modeOverride?: 'dark' | 'light'
}) {
  useEffect(() => {
    use([
      DatasetComponent,
      TitleComponent,
      GridComponent,
      TooltipComponent,
      ToolboxComponent,
      LegendComponent,
      LineChart,
      CanvasRenderer,
      GraphicComponent,
    ])
  }, [])
  const filter = useContext(FilterContext)
  const filterAction = useContext(FilterActionContext)
  const {mode} = useColorScheme()
  const useMode = modeOverride || mode
  const {series, fits, panels, range, varIndices} = input
  panelContainer.current = panels
  const container = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const chart = container.current ? init(container.current, useMode, {renderer: 'canvas'}) : null
    const resize = () => {
      if (chart) {
        const frame = chart.getDom().getBoundingClientRect()
        const current = chart.getOption()
        const grid = current.grid as Panel[]
        if (grid && grid.length) {
          chart.setOption(resizePanels(frame, grid))
          chart.resize()
        }
      }
    }
    if (chart)
      chart.on('click', params => {
        if (Array.isArray(params.data)) {
          const id = params.data[params.data.length - 1] as string
          if (id in countryInfo) filterAction({key: 'countries', value: {[id]: true}})
        }
      })
    window.addEventListener('resize', resize)
    return () => {
      if (chart) {
        chart.dispose()
      }
      window.removeEventListener('resize', resize)
    }
  }, [useMode, countryInfo, filterAction])
  const formatter = useCallback(
    ({marker, seriesName, value}: {marker: string; seriesName: string; value: number[]}) => {
      const info = view.color === 'country' && countryInfo[value[varIndices.country]]
      return (
        '<div class="tooltip-table">' +
        (view.color ? marker + (info ? info.name + ' (' + info.ISO_A3 + ')' : seriesName) : '') +
        '<table>' +
        (info ? '<tr><td>World Bank Region</td><td><strong>' + info.region + '</strong></td></tr>' : '') +
        ('year' in varIndices && view.x.base !== 'year' && view.y.base !== 'year'
          ? '<tr><td>Year</td><td><strong>' + value[varIndices.year] + '</strong></td></tr>'
          : '') +
        (view.symbol
          ? '<tr><td>' +
            view.symbol +
            '</td><td><strong>' +
            value[varIndices[view.symbol in varIndices ? view.symbol : 'level']] +
            '</strong></td></tr>'
          : '') +
        '<tr><td>' +
        view.x.name +
        (view.x.isGlobal ? '' : `<br><code class="variable-description">${view.x.description}</code>`) +
        '</td><td><strong>' +
        formatNumber(value[varIndices.x], view.x) +
        '</strong></td></tr><tr><td>' +
        view.y.name +
        (view.y.isGlobal ? '' : `<br><code class="variable-description">${view.y.description}</code>`) +
        '</td><td><strong>' +
        formatNumber(value[varIndices.y], view.y) +
        '</strong></td></tr></table></div>'
      )
    },
    [view, countryInfo, varIndices]
  )
  useEffect(() => {
    if (container.current) {
      const chart = getInstanceByDom(container.current)
      if (chart) {
        if (series.length) {
          assignRanges(range.x, baseXAxisOptions, view.lock_range)
          assignRanges(range.y, baseYAxisOptions, view.lock_range)
          const colors = useMode === 'dark' ? {bg: '#121212', text: '#ffffff'} : {bg: '#ffffff', text: '#000000'}
          panelSpacing.legendWidth = 0
          if (view.color) {
            series.forEach(s => {
              const len = (s.name as string).length
              if (len > panelSpacing.legendWidth) panelSpacing.legendWidth = len
            })
            panelSpacing.legendWidth += 4
            panelSpacing.legendWidth *= 4.6
          }
          const frame = container.current.getBoundingClientRect()
          const labelSize = frame.height < 500 || frame.width < 800 ? 0.7 : 1
          panelContainer.current = panels
          const {title, grid} = resizePanels(frame, panels)
          chart.setOption(
            {
              darkMode: useMode === 'dark',
              legend: {
                top: '55',
                align: 'right',
                right: 'right',
                orient: 'vertical',
                type: 'scroll',
                data: view.color ? [...new Set(series.map(s => s.name).sort())] : [],
              },
              backgroundColor: colors.bg,
              tooltip: {
                textStyle: {
                  color: colors.text,
                },
                backgroundColor: colors.bg + '60',
                borderWidth: 0,
                axisPointer: {
                  type: 'line',
                },
                formatter,
                position: tooltipPlacer,
                appendToBody: true,
              },
              xAxis: panels.map((_, i) => {
                return {
                  type: 'value',
                  gridIndex: i,
                  axisLabel: {
                    formatter: (x: number) => formatNumberAxis(x, view.x),
                  },
                  ...baseXAxisOptions,
                }
              }),
              yAxis: panels.map((_, i) => {
                return {
                  type: 'value',
                  gridIndex: i,
                  axisLabel: {
                    formatter: (x: number) => formatNumberAxis(x, view.y),
                  },
                  ...baseYAxisOptions,
                }
              }),
              graphic: [
                {
                  type: 'text',
                  rotation: Math.PI / 2,
                  left: 20,
                  top: 'center',
                  width: '100%',
                  style: {
                    text: view.y.name,
                    fill: colors.text,
                    font: `bold ${labelSize}em "Roboto","Helvetica","Arial",sans-serif`,
                    textAlign: 'center',
                  },
                },
                {
                  type: 'text',
                  left: 'center',
                  bottom: 20,
                  style: {
                    text: view.x.name,
                    fill: colors.text,
                    font: `bold ${labelSize}em "Roboto","Helvetica","Arial",sans-serif`,
                    textAlign: 'center',
                  },
                },
              ],
              title: title.map(({label, top, left, nCountries}) => {
                const data = (series[0].data && series[0].data.length ? series[0].data[0] : []) as string[]
                return {
                  text: label,
                  subtext:
                    (nCountries === 1 && data[varIndices.country] in countryInfo
                      ? `Data from ${countryInfo[data[varIndices.country]].name}`
                      : `Observations from ${nCountries} ${nCountries === 1 ? 'country' : 'countries'}`) +
                    (filter && filter.sectors.length < 5 ? ', sector = ' + filter.sectors.join(', ') : '') +
                    (filter && filter.sexes.length === 1 ? ', sex = ' + filter.sexes[0] : ''),
                  top,
                  left,
                  contain: true,
                  subtextStyle: {align: 'right', verticalAlign: 'center', width: '100%'},
                  textStyle: {fontSize: '1em', fontWeight: 'normal'},
                }
              }),
              grid,
              series: fits.length ? [...series, ...fits] : series,
              toolbox: {
                feature: {
                  saveAsImage: {
                    name: 'gender_growth_gap_' + view.y.toFileName() + (view.x ? '_' + view.x.toFileName() : ''),
                  },
                },
              },
            },
            true,
            true
          )
        } else {
          chart.clear()
        }
      }
    }
  }, [input, useMode, formatter, panels, fits, range, series, view, filter, countryInfo, varIndices.country])
  setTimeout(() => window.dispatchEvent(new Event('resize')), 100)
  return (
    <Box
      ref={container}
      sx={{
        width: '100%',
        height: '100%',
        minWidth: range.panel[0] * 500 + 'px',
        minHeight: range.panel[1] * 300 + 'px',
        overflow: 'hidden',
      }}
    />
  )
}
