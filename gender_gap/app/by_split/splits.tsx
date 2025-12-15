import {
  Button,
  Divider,
  IconButton,
  LinearProgress,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import {useContext, useMemo} from 'react'
import {ChevronLeft, ChevronRight} from '@mui/icons-material'
import {DataContext} from '../data/load'
import {ViewActionContext, ViewContext} from '../data/view'
import {variableInfo} from '../metadata'
import {DataDisplay} from '../data/display'
import {BasicMenu} from '../dashboard/view_menu_basic'
import {Export} from '../parts/export'
import {FilterCountry} from '../dashboard/filter_country'
import {Variable} from '../data/variable'

const splitDescriptions = {
  age: 'age 35 or over, to those under 35',
  children_under_5: 'from households with children under 5, to those with no children under 5',
  education: 'with a vocational degree or less, to those with post-secondary degree',
  marital_status: 'married, in-union, or cohabiting, to those who are divorces, separated, widowed, or never married',
  rural: 'who live in urban areas, to those who live in rural areas',
}

export default function Splits() {
  const full = useContext(DataContext)
  const view = useContext(ViewContext)
  const editView = useContext(ViewActionContext)
  const demoSplits = useMemo(() => {
    if (!full) return []
    return full.variableLevels.variable
      .filter(v => v !== 'total')
      .map(v => (
        <ToggleButton key={v} value={v}>
          {variableInfo[v].label}
        </ToggleButton>
      ))
  }, [full])
  if (!full || !view) {
    return (
      <Stack sx={{margin: 'auto', marginTop: 10, maxWidth: 350}}>
        <Typography variant="h5">Loading Data...</Typography>
        <LinearProgress />
      </Stack>
    )
  }
  const changeYear = (forward: boolean) => {
    const range = full.levels.baseYearRange
    const value = +view.select_year
    if (forward) {
      if (view.select_year < range[1]) {
        editView({key: 'select_year', value: '' + (value + 1)})
      }
    } else {
      if (view.select_year > range[0]) {
        editView({key: 'select_year', value: '' + (value - 1)})
      }
    }
  }
  return (
    <Stack spacing={2} component="main" sx={{pr: 1}}>
      <Typography>
        The figure below shows the relationship between the {Variable.activityLabel(view.y.subset).toLowerCase()}{' '}
        {view.y.summary.adjust === '-'
          ? 'gender gap'
          : view.y.summary.adjust === '/'
          ? 'gender ratio'
          : (view.y.summary.level as string).toLowerCase() + ' share'}{' '}
        and {view.x.base === 'year' ? 'year' : 'GDP per capita'}
        {view.y_panels in splitDescriptions
          ? ', comparing individuals ' + splitDescriptions[view.y_panels as 'rural']
          : ''}
        . The menu options allow you to change the labor market outcome shown, change the way GDP per capita is
        displayed, introduce a different color for each global region, change the set of countries which are shown, and
        change the set of years from which data are drawn (below the figure).
      </Typography>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          "& button[aria-pressed='true']": {
            backgroundColor: '#d6ecfe !important',
            borderColor: '#000',
            borderWidth: 2,
          },
        }}
      >
        <Typography sx={{alignSelf: 'center', fontWeight: 700}}>Demographic Splits: </Typography>
        <ToggleButtonGroup
          value="total"
          exclusive
          size="small"
          onChange={() => editView({key: 'y_panels', value: ''})}
          aria-label="clear demographic split"
        >
          <ToggleButton value="" selected={!view.y_panels || view.y_panels === 'total'}>
            None
          </ToggleButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup
          value={view.y_panels || 'total'}
          exclusive
          size="small"
          onChange={(_, value) => editView({key: 'y_panels', value: value || ''})}
          aria-label="demographic split"
        >
          {demoSplits}
        </ToggleButtonGroup>
      </Stack>
      <Stack sx={{height: 600}} direction="row" spacing={2}>
        <DataDisplay mode="light" />
        <Stack spacing={1} sx={{minWidth: 280}}>
          <BasicMenu simple={true} />
          <Typography fontWeight="bold">Filter</Typography>
          <FilterCountry backgroundColor="#ffffff" />
          <Divider sx={{pt: 1.5}} />
          <Export />
          <Typography
            component="code"
            sx={{fontFamily: 'monospace', whiteSpace: 'nowrap', fontSize: '.6em', textAlign: 'right', p: 1}}
          >
            Data updated {full.meta.updated}
          </Typography>
        </Stack>
      </Stack>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          justifyContent: 'space-between',
          pr: 1,
          pl: 1,
          "& button[aria-pressed='true']": {backgroundColor: '#d6ecfe !important', borderColor: '#000', borderWidth: 2},
        }}
      >
        <Stack direction="row">
          <Typography sx={{alignSelf: 'center', fontWeight: 700, pr: 2}}>Year: </Typography>
          <ToggleButtonGroup
            value={view.time_agg}
            sx={{'& .MuiButtonBase-root': {pr: 2, pl: 2}}}
            aria-label="time handling options"
            exclusive
            size="small"
            onChange={(_, value) => value && editView({key: 'time_agg', value})}
          >
            <ToggleButton value="all" aria-label="show all years">
              All
            </ToggleButton>
            <ToggleButton value="first" aria-label="show first year">
              First
            </ToggleButton>
            <ToggleButton value="last" aria-label="show latest year">
              Last
            </ToggleButton>
            <ToggleButton value="specified" aria-label="show specified year">
              Specified
            </ToggleButton>
          </ToggleButtonGroup>
          {view.time_agg === 'specified' && (
            <Stack direction="row">
              <IconButton onClick={() => changeYear(false)} aria-label="back a year">
                <ChevronLeft />
              </IconButton>
              <TextField
                label="Year"
                type="number"
                size="small"
                fullWidth
                value={view.select_year}
                slotProps={{htmlInput: {min: full.levels.baseYearRange[0], max: full.levels.baseYearRange[1], step: 1}}}
                onChange={e => editView({key: 'select_year', value: e.target.value})}
              />
              <IconButton onClick={() => changeYear(true)} aria-label="forward a year">
                <ChevronRight />
              </IconButton>
            </Stack>
          )}
        </Stack>
        <Stack direction="row" spacing={2}>
          <Button
            sx={{float: 'right'}}
            href="https://dissc-yale.github.io/WorkInData/gender_gap"
            rel="noreferrer"
            target="_blank"
            variant="contained"
          >
            Full Dashboard
          </Button>
          <Button href="sources" target="_blank" rel="noreferrer" variant="outlined">
            Sources
          </Button>
        </Stack>
      </Stack>
    </Stack>
  )
}
