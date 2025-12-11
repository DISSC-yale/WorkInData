import {FormControl, InputLabel, ListSubheader, MenuItem, Select, Typography} from '@mui/material'
import {useContext, useMemo} from 'react'
import {activityLabels, sexSummaries, variableInfo} from '../metadata'
import {Variable} from '../data/variable'
import {ViewActionContext, ViewContext, type ViewDef} from '../data/view'
import {DataContext, type Resources} from '../data/load'
import {ColorBasis} from './color_basis_select'
import {RegressionSelect} from './regression_select'

const xSelections = {
  year: {label: 'Year', base: 'year'},
  gdpfalse: {label: 'GDP per capita', base: 'gdp', log: false},
  gdptrue: {label: 'Log GDP per capita', base: 'gdp', log: true},
  gdp_pppfalse: {label: 'GDP per capita in PPP', base: 'gdp_ppp', log: false},
  gdp_ppptrue: {label: 'Log GDP per capita in PPP', base: 'gdp_ppp', log: true},
}

const xSelectItems = Object.keys(xSelections).map(k => {
  const {label} = xSelections[k as 'year']
  return (
    <MenuItem key={k} value={k}>
      {label}
    </MenuItem>
  )
})

export function BasicMenu({simple}: {simple?: boolean}) {
  const {levels} = useContext(DataContext) as Resources
  const view = useContext(ViewContext) as ViewDef
  const editView = useContext(ViewActionContext)

  const activities = useMemo(
    () => [
      <ListSubheader>Specific Activities</ListSubheader>,
      ...Object.keys(activityLabels)
        .filter(activity => activity[0] !== '0')
        .map(activity => (
          <MenuItem key={activity} value={activity}>
            {activityLabels[activity as 'Unemployed']}
          </MenuItem>
        )),
      <ListSubheader>Aggregate Activities</ListSubheader>,
      <MenuItem key="Employed" value="Agriculture,Industry,Services">
        Employed
      </MenuItem>,
      <MenuItem key="In Laborforce" value="Agriculture,Industry,Services,Unemployed">
        In Labor Force
      </MenuItem>,
    ],
    []
  )
  const sexSummary = useMemo(
    () =>
      Object.keys(sexSummaries).map(id => (
        <MenuItem key={id} value={id}>
          {sexSummaries[id as 'Male'].label}
        </MenuItem>
      )),
    []
  )
  const demoSegments = useMemo(
    () =>
      ['', ...Object.keys(levels.demo_segments)].map(option => (
        <MenuItem key={option} value={option}>
          {option in variableInfo ? variableInfo[option].label : 'None'}
        </MenuItem>
      )),
    [levels.demo_segments]
  )

  return (
    <>
      <Typography fontWeight="bold">1. Outcome (Y-Axis)</Typography>
      <FormControl variant="outlined" fullWidth size="small">
        <InputLabel id="basic_y_subset_select">Main Activity</InputLabel>
        <Select
          labelId="basic_y_subset_select"
          label="Main Activity"
          value={view.y.subset.level as string}
          onChange={e => {
            const value = e.target.value.split(',').sort()
            view.y = view.y.copy()
            view.y.updateLevel('subset', {key: 'level', value, levels: levels.sectors})
            view.y.updateLevel('subset', {key: 'adjust', value: ''})
            editView({key: 'y', value: view.y})
          }}
        >
          {activities}
        </Select>
      </FormControl>
      <FormControl variant="outlined" fullWidth size="small">
        <InputLabel id="basic_y_summary_select">Gender Summary</InputLabel>
        <Select
          labelId="basic_y_summary_select"
          label="Gender Summary"
          value={view.y.summary.level + view.y.summary.adjust}
          onChange={e => {
            const spec = sexSummaries[e.target.value as 'Male']
            view.y = view.y.copy()
            view.y.updateLevel('summary', {key: 'level', value: spec.level, levels: levels.sexes})
            view.y.updateLevel('summary', {key: 'adjust', value: spec.adjust as ''})
            editView({key: 'y', value: view.y})
          }}
        >
          {sexSummary}
        </Select>
      </FormControl>
      {view.as_plot && (
        <>
          <Typography fontWeight="bold">2. By (X-Axis)</Typography>
          <FormControl variant="outlined" fullWidth size="small">
            <InputLabel id="basic_x_select">External Variable</InputLabel>
            <Select
              labelId="basic_x_select"
              label="External Variable"
              value={view.x.base + (view.x.base === 'year' ? '' : view.x.log)}
              onChange={e => {
                editView({key: 'x', value: new Variable(xSelections[e.target.value as 'year'])})
              }}
            >
              {xSelectItems}
            </Select>
          </FormControl>
          <Typography fontWeight="bold">3. Styling</Typography>
          <ColorBasis current={view.color_source} viewAction={editView} outlined={true} />
          <RegressionSelect current={view.regression} viewAction={editView} />
        </>
      )}
      {!simple && (
        <>
          <Typography fontWeight="bold">{view.as_plot ? 4 : 2}. Split By</Typography>
          <FormControl variant="outlined" fullWidth size="small">
            <InputLabel id="basic_y_panel_select">Demographic Subset</InputLabel>
            <Select
              labelId="basic_y_panel_select"
              label="Demographic Subset"
              value={view.y_panels}
              onChange={e => editView({key: 'y_panels', value: e.target.value})}
            >
              {demoSegments}
            </Select>
          </FormControl>
          <Typography fontWeight="bold">{view.as_plot ? 5 : 3}. Time Handling</Typography>
          <FormControl size="small" fullWidth>
            <InputLabel id="basic_time_agg_select">Year Per Country</InputLabel>
            <Select
              labelId="basic_time_agg_select"
              label="Year Per Country"
              value={view.as_plot ? view.time_agg : view.time_agg === 'all' ? 'mean' : view.time_agg}
              onChange={e => {
                editView({key: 'time_agg', value: e.target.value as 'last'})
              }}
            >
              <MenuItem value="all" disabled={!view.as_plot}>
                All Years
              </MenuItem>
              <MenuItem value="first">Earliest Year</MenuItem>
              <MenuItem value="specified">Specified Year</MenuItem>
              <MenuItem value="last">Latest Year</MenuItem>
              <MenuItem value="mean">Average Across Years</MenuItem>
            </Select>
          </FormControl>
        </>
      )}
    </>
  )
}
