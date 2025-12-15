import {
  Box,
  Button,
  CardActions,
  CardContent,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
  useColorScheme,
} from '@mui/material'
import {Variable} from '../data/variable'
import {useContext} from 'react'
import {Expandable} from '../parts/expandable'
import {Selector} from '../parts/selector'
import {DataContext, type Resources} from '../data/load'
import {AdvancedMenu} from './view_menu_advanced'
import {BasicMenu} from './view_menu_basic'
import {FilterActionContext, FilterContext, FilterDef, ViewActionContext, ViewContext, ViewDef} from '../data/view'
import {FilterCountry} from './filter_country'

export function DataMenu() {
  const view = useContext(ViewContext) as ViewDef
  const filter = useContext(FilterContext) as FilterDef
  const viewAction = useContext(ViewActionContext)
  const filterAction = useContext(FilterActionContext)
  const full = useContext(DataContext) as Resources

  const {mode} = useColorScheme()
  const restrictedView = () => {
    let isAdvanced = false
    const basicView = {...view, x: view.x.copy(), y: view.y.copy()}
    if (
      basicView.y.base !== 'weight' ||
      basicView.y.subset.variable !== 'main_activity' ||
      basicView.y.summary.variable !== 'sex'
    ) {
      isAdvanced = true
      basicView.y = new Variable(
        {
          base: 'weight',
          percent: true,
          subset: {variable: 'main_activity', level: 'Agriculture', adjust: ''},
          summary: {variable: 'sex', level: 'Female', adjust: '-'},
        },
        full.variableLevels
      )
    } else if (basicView.y.subset.adjust || basicView.y.subset.level === 'Out of Workforce') {
      basicView.y = new Variable(
        {
          base: 'weight',
          percent: true,
          subset: {variable: 'main_activity', level: 'Agriculture', adjust: ''},
          summary: {variable: 'sex', level: 'Female', adjust: '-'},
        },
        full.variableLevels
      )
    }
    if (basicView.x.base !== 'year' && !basicView.x.base.startsWith('gdp')) {
      isAdvanced = true
      basicView.x.update({key: 'base', value: 'gdp'})
    }
    if (basicView.color !== 'country') {
      isAdvanced = true
      basicView.color = 'country'
    }
    if (basicView.x_panels) {
      isAdvanced = true
      basicView.x_panels = ''
    }
    if (basicView.symbol) {
      isAdvanced = true
      basicView.symbol = ''
    }
    if (basicView.y_panels && !full.variableLevels.variable.includes(basicView.y_panels)) {
      isAdvanced = true
      basicView.y_panels = ''
    }
    if (basicView.country_center) {
      isAdvanced = true
      basicView.country_center = false
    }
    if (!basicView.within_split) {
      isAdvanced = true
      basicView.within_split = true
    }
    if (!basicView.lock_range) {
      isAdvanced = true
      basicView.lock_range = true
    }
    basicView.advanced = false
    return {view: basicView, isAdvanced}
  }
  if (!view.advanced) {
    const {isAdvanced} = restrictedView()
    if (isAdvanced) requestAnimationFrame(() => viewAction({key: 'advanced', value: true}))
    view.advanced = isAdvanced
  }
  return (
    <>
      <CardContent sx={{overflow: 'hidden', height: 'calc(100% - 60px)', pt: 0, pb: 0}}>
        <Box sx={{overflowY: 'auto', height: '100%'}}>
          <Typography variant="h6">Select and Arrange</Typography>
          <Stack spacing={1}>
            <Stack spacing={1} direction="row" sx={{justifyContent: 'space-between', p: 1}}>
              <FormControlLabel
                label="Display as Plot"
                labelPlacement="top"
                control={
                  <Switch
                    size="small"
                    checked={view.as_plot}
                    onChange={() => viewAction({key: 'as_plot', value: !view.as_plot})}
                  />
                }
              />
              <FormControlLabel
                label="Advanced Menu"
                labelPlacement="top"
                control={
                  <Switch
                    size="small"
                    checked={view.advanced}
                    onChange={() => {
                      if (view.advanced) {
                        const {view} = restrictedView()
                        viewAction({key: 'replace', view})
                      } else {
                        viewAction({key: 'advanced', value: !view.advanced})
                      }
                    }}
                  />
                }
              />
            </Stack>
            {view.advanced ? <AdvancedMenu /> : <BasicMenu />}
            <Button onClick={() => viewAction({key: 'reset'})}>Reset Selection</Button>
          </Stack>
          <Typography variant="h6" sx={{pb: 1}}>
            Filter
          </Typography>
          <Stack spacing={2}>
            {view.time_agg === 'specified' ? (
              <TextField
                label="Year"
                type="number"
                size="small"
                fullWidth
                value={view.select_year}
                slotProps={{htmlInput: {min: full.levels.baseYearRange[0], max: full.levels.baseYearRange[1], step: 1}}}
                onChange={e => viewAction({key: 'select_year', value: e.target.value})}
              />
            ) : (
              <Stack direction="row" spacing={1}>
                <TextField
                  label="Min Year"
                  type="number"
                  size="small"
                  fullWidth
                  value={filter.min_year}
                  slotProps={{htmlInput: {min: full.levels.baseYearRange[0], max: filter.max_year, step: 1}}}
                  onChange={e => filterAction({key: 'min_year', value: e.target.value})}
                />
                <TextField
                  label="Max Year"
                  type="number"
                  size="small"
                  fullWidth
                  value={filter.max_year}
                  slotProps={{htmlInput: {min: filter.min_year, max: full.levels.baseYearRange[1], step: 1}}}
                  onChange={e => filterAction({key: 'max_year', value: e.target.value})}
                />
              </Stack>
            )}
            <FilterCountry backgroundColor={mode === 'dark' ? '#353535' : '#ffffff'} />
            <Expandable>
              <Stack spacing={1}>
                <Selector
                  label="Sectors"
                  options={full.levels.sectors}
                  selection={filter.sectors}
                  update={value => filterAction({key: 'sectors', value})}
                />
                <Selector
                  label="Gender"
                  options={full.levels.sexes}
                  selection={filter.sexes}
                  update={value => filterAction({key: 'sexes', value})}
                />
              </Stack>
            </Expandable>
            <Button onClick={() => filterAction({key: 'reset'})}>Reset Filters</Button>
          </Stack>
        </Box>
      </CardContent>
      <CardActions>
        <Button
          fullWidth
          color="error"
          size="small"
          onClick={() => {
            window.history.replaceState(void 0, '', window.location.origin + window.location.pathname)
            window.location.reload()
          }}
        >
          Hard Reset
        </Button>
      </CardActions>
    </>
  )
}
