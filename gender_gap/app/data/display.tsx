import {useContext, useMemo} from 'react'
import {DataContext, Resources} from './load'
import {makeSeries} from './make_series'
import Plot, {PlotInput} from '../parts/plot'
import {MapInput} from '../parts/map'
import {Box, Typography} from '@mui/material'
import {Maps} from '../parts/maps'
import {FilteredContext, ViewContext, type ViewDef} from './view'

function getColRef(ref: string, segments: {[index: string]: boolean}) {
  return ref ? (ref in segments ? 'level' : ref) : ''
}

export function DataDisplay({mode}: {mode?: 'dark' | 'light'}) {
  const full = useContext(DataContext) as Resources
  const view = useContext(ViewContext) as ViewDef
  const filtered = useContext(FilteredContext)
  const series: PlotInput | MapInput = useMemo(
    () =>
      makeSeries(
        filtered,
        view,
        {
          panelX: getColRef(view.x_panels, full.levels.demo_segments),
          panelY: getColRef(view.y_panels, full.levels.demo_segments),
          color: getColRef(view.color, full.levels.demo_segments),
          symbol: getColRef(view.symbol, full.levels.demo_segments),
        },
        full.countryInfo
      ),
    [view, filtered, full.levels.demo_segments, full.countryInfo]
  )

  return view.as_plot ? (
    <Plot input={series as PlotInput} view={view} countryInfo={full.countryInfo} modeOverride={mode} />
  ) : (
    <>
      <Typography variant="h6" sx={{position: 'absolute', width: '100%', textAlign: 'center'}}>
        {view.y.name}
      </Typography>
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexWrap: 'wrap',
          pt: 5,
          minWidth: series.range.panel[0] * 500 + 'px',
          minHeight: series.range.panel[1] * 300 + 'px',
        }}
      >
        <Maps view={view} full={full} final={series as MapInput} modeOverride={mode} />
      </Box>
    </>
  )
}
