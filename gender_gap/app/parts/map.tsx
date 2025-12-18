'use client'

import {use, init, getInstanceByDom} from 'echarts/core'
import {MapChart, type MapSeriesOption} from 'echarts/charts'
import {
  GeoComponent,
  GridComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  VisualMapComponent,
} from 'echarts/components'
import {Box, useColorScheme} from '@mui/material'
import {useContext, useEffect, useRef} from 'react'
import {getMap, registerMap} from 'echarts'
import {CanvasRenderer} from 'echarts/renderers'
import type {Info} from '../data/load'
import type {GeoJSON} from 'echarts/types/src/coord/geo/geoTypes.js'
import {formatNumber, tooltipPlacer} from '../utils'
import {FilterContext, ViewDef} from '../data/view'

export type MapInput = {
  series: MapSeriesOption[]
  range: {x: number[]; y: number[]; panel: number[]}
  varIndices: {[index: string]: number}
}
export default function Map({
  input,
  map,
  countryInfo,
  view,
  modeOverride,
}: {
  input: MapInput
  map: GeoJSON
  countryInfo: Info
  view: ViewDef
  modeOverride?: 'dark' | 'light'
}) {
  useEffect(() => {
    use([
      TitleComponent,
      GridComponent,
      TooltipComponent,
      ToolboxComponent,
      GeoComponent,
      MapChart,
      CanvasRenderer,
      VisualMapComponent,
    ])
  }, [])
  const {mode} = useColorScheme()
  const useMode = modeOverride || mode
  const filter = useContext(FilterContext)
  const container = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const chart = container.current ? init(container.current, useMode, {renderer: 'canvas'}) : null
    if (!getMap('countries')) registerMap('countries', map)
    const resize = () => chart && chart.resize()
    window.addEventListener('resize', resize)
    return () => {
      if (chart) {
        chart.dispose()
      }
      window.removeEventListener('resize', resize)
    }
  }, [useMode, map])
  useEffect(() => {
    if (container.current) {
      const chart = getInstanceByDom(container.current)
      if (chart) {
        if (input.series.length) {
          const {series, range, varIndices} = input
          const balance = view.y.summary.variable && view.y.summary.adjust === '-'
          const cap = Math.max(...range.y.map(v => Math.abs(v)))
          const colors = useMode === 'dark' ? {bg: '#121212', text: '#ffffff'} : {bg: '#ffffff', text: '#000000'}
          const data = (series[0].data && series[0].data.length ? series[0].data : []) as string[]
          const nCountries = series[0].data ? series[0].data.length : 0
          chart.setOption(
            {
              backgroundColor: colors.bg,
              title: {
                text: series[0].name,
                subtext:
                  (nCountries === 1 && data[varIndices.country] in countryInfo
                    ? `Data from ${countryInfo[data[varIndices.country]].name}`
                    : `Observations from ${nCountries} ${nCountries === 1 ? 'country' : 'countries'}`) +
                  (filter && filter.sectors.length < 5 ? ', sector = ' + filter.sectors.join(', ') : '') +
                  (filter && filter.sexes.length === 1 ? ', sex = ' + filter.sexes[0] : ''),
                textStyle: {fontSize: '1em', fontWeight: 'normal'},
                left: 'center',
              },
              tooltip: {
                trigger: 'item',
                textStyle: {
                  color: colors.text,
                },
                backgroundColor: colors.bg,
                borderWidth: 0,
                formatter: ({marker, name, data}: {marker: string; name: string; data: {[index: string]: number}}) => {
                  return (
                    '<div class="tooltip-table">' +
                    marker +
                    (name in countryInfo ? countryInfo[name].name + ' (' + name + ')' : '') +
                    '<table><tr><td>Word Bank Region</td><td><strong>' +
                    countryInfo[name].region +
                    '</strong></td></tr>' +
                    (data.year ? '<tr><td>Year</td><td><strong>' + data.year + '</strong></td></tr>' : '') +
                    '<tr><td>' +
                    view.y.name +
                    (data && 'value' in data
                      ? ', ' +
                        (view.time_agg === 'mean' || view.time_agg === 'all' ? 'average' : data.year) +
                        (view.y.isGlobal ? '' : `<br><code class="variable-description">${view.y.description}</code>`) +
                        '</td><td><strong>' +
                        formatNumber(data.value, view.y) +
                        '</strong>'
                      : '</td><td><strong>unknown</strong>') +
                    '</td></tr></table></div>'
                  )
                },
                position: tooltipPlacer,
                appendToBody: true,
              },
              visualMap: {
                name: view.y.name,
                calculable: true,
                min: balance ? -cap : range.y[0],
                max: balance ? cap : range.y[1],
                inRange: {
                  color: ['#7E1700', '#C8E9B6', '#1549A2'],
                },
              },
              series,
              toolbox: {
                feature: {
                  saveAsImage: {
                    name: 'gender_growth_gap_' + view.y.toFileName() + '_map',
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
  }, [input, useMode, countryInfo, view, filter])
  return <Box ref={container} sx={{width: '100%', height: '100%', minHeight: '10px'}} />
}
