import {Box} from '@mui/material'
import {Resources} from '../data/load'
import type {MapInput} from './map'
import type {GeoJSON} from 'echarts/types/src/coord/geo/geoTypes.js'
import dynamic from 'next/dynamic'
import {ViewDef} from '../data/view'

const Map = dynamic(() => import('./map'))

export function Maps({
  full,
  view,
  final,
  modeOverride,
}: {
  full: Resources
  view: ViewDef
  final: MapInput
  modeOverride?: 'dark' | 'light'
}) {
  const width = (1 / final.range.panel[0]) * 99 + '%'
  const height = (1 / final.range.panel[1]) * 99 + '%'
  return final.series.map(series => {
    return (
      <Box key={series.id} sx={{height, width}}>
        <Map
          input={{series: [series], range: final.range, varIndices: final.varIndices}}
          map={full.map as GeoJSON}
          countryInfo={full.countryInfo}
          view={view}
          modeOverride={modeOverride}
        />
      </Box>
    )
  })
}
