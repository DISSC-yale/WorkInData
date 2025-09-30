import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Divider,
  IconButton,
  LinearProgress,
  Link,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import {useContext, useMemo} from 'react'
import {ChevronLeft, ChevronRight, ExpandMore} from '@mui/icons-material'
import {DataContext} from '../data/load'
import {ViewActionContext, ViewContext} from '../data/view'
import {variableInfo} from '../metadata'
import {DataDisplay} from '../data/display'
import {BasicMenu} from '../dashboard/view_menu_basic'
import {Export} from '../parts/export'
import {FilterCountry} from '../dashboard/filter_country'
import {Sources} from '../parts/sources'

const splitDescriptions = {
  age: 'age 35 or over, to those under 35',
  children_under_5: 'from households with children under 5, to those with no children under 5',
  education: 'with a secondary education or less, to those with post-secondary education',
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
  const changeYear = (forward: boolean, value?: string) => {
    const range = full.levels.baseYearRange
    if (!value) {
      value = view.select_year
      if (forward) {
        if (view.time_agg === 'last') return
        value =
          view.select_year < range[1]
            ? view.time_agg === 'specified'
              ? '' + (+view.select_year + 1)
              : view.select_year
            : 'last'
      } else {
        value =
          view.select_year > range[0]
            ? view.time_agg === 'specified'
              ? '' + (+view.select_year - 1)
              : view.select_year
            : 'first'
      }
    }
    if (value === 'first' || value === 'last') {
      editView({key: 'time_agg', value})
    } else {
      if (view.time_agg !== 'specified') {
        editView({key: 'time_agg', value: 'specified'})
      }
      editView({key: 'select_year', value})
    }
  }
  return (
    <Stack spacing={2}>
      <Typography>
        This project draws on the{' '}
        <Link href="https://sites.google.com/site/gottliebcharles/work-in-data" rel="noreferrer" target="_blank">
          Harmonized World Labor Force Surveys
        </Link>{' '}
        (HWLFS; work-in-data), an initiative that harmonizes labor market and time use microdata across countries. HWLFS
        draws from a combination of IPUMS, household surveys, and labour force surveys from national statistical
        offices, regional statistical hubs, and the World Bank. See the table of data{' '}
        <Sources sources={full.meta.sources} type="intext" /> for specific citations.
      </Typography>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />} aria-controls="howto-split" id="howto-split_header">
          <Typography>How To Use</Typography>
        </AccordionSummary>
        <AccordionDetails id="howto-split">
          <Typography>
            This demonstration version has a demographic lens, showing how shares of working-age women and men in five
            labor market outcomes vary across age, education, marital status, rural/urban location, and the presence of
            young children in the household. A{' '}
            <Link href="https://dissc-yale.github.io/WorkInData/gender_gap/" rel="noreferrer" target="_blank">
              full version
            </Link>{' '}
            of the portal is also available, which begins with labor market outcomes and later has an option to drill
            down into demographic splits.
          </Typography>
          <List>
            <ListItem>
              <ListItemAvatar>
                <Typography>1.</Typography>
              </ListItemAvatar>
              <ListItemText
                primary={<Typography>Choose a demographic split</Typography>}
                secondary={
                  <Typography>
                    Choose how you would like to split the labor market outcome by age, education, marital status,
                    rural/urban location, or whether these individuals live in a household with children under 5.
                  </Typography>
                }
              />
            </ListItem>
            <ListItem>
              <ListItemAvatar>
                <Typography>2.</Typography>
              </ListItemAvatar>
              <ListItemText
                primary={<Typography>Choose a labor market outcome</Typography>}
                secondary={
                  <Typography>
                    Select a labor market outcome: work in agriculture, industry, or services, unemployment, or out of
                    the labor force. Outcomes are expressed as shares of the working-age population age 15-65.
                  </Typography>
                }
              />
            </ListItem>
            <ListItem>
              <ListItemAvatar>
                <Typography>3.</Typography>
              </ListItemAvatar>
              <ListItemText
                primary={<Typography>Choose a gender gap</Typography>}
                secondary={
                  <Typography>
                    Compare the outcome by year, GDP per capita (PPP), GDP per capita (current USD), or by log versions
                    of these.
                  </Typography>
                }
              />
            </ListItem>
            <ListItem>
              <ListItemAvatar>
                <Typography>4.</Typography>
              </ListItemAvatar>
              <ListItemText
                primary={<Typography>Set the x-axis</Typography>}
                secondary={
                  <Typography>
                    Compare the outcome by GDP per capita (PPP), GDP per capita (current USD), or by log versions of
                    these.
                  </Typography>
                }
              />
            </ListItem>
            <ListItem>
              <ListItemAvatar>
                <Typography>5.</Typography>
              </ListItemAvatar>
              <ListItemText
                primary={<Typography>Set the country filter and year (optional)</Typography>}
                secondary={
                  <Typography>
                    Use the country filter to include or exclude specific countries and regions. By default, the latest
                    available year is selected, but you can choose a specific year, the earliest year, or all years.
                  </Typography>
                }
              />
            </ListItem>
          </List>
        </AccordionDetails>
      </Accordion>
      <Stack direction="row" spacing={1}>
        <Typography sx={{alignSelf: 'center', fontWeight: 700}}>Demographic Splits: </Typography>
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

      <Typography>
        The figure below shows the relationship between the{' '}
        {view.y.summary.adjust === '-'
          ? 'gender gap'
          : view.y.summary.adjust === '/'
          ? 'gender ratio'
          : view.y.summary.level.toLowerCase() + ' share'}{' '}
        in {view.y.subset.level.toLowerCase()} and {view.x.base === 'year' ? 'year' : 'GDP per capita'}
        {view.y_panels in splitDescriptions
          ? ', comparing individuals ' + splitDescriptions[view.y_panels as 'rural']
          : ''}
        . The menu options allow you to change the labor market outcome shown, change the way GDP per capita is
        displayed, introduce a different color for each global region, change the set of countries which are shown, and
        change the set of years from which data are drawn (below the figure).
      </Typography>
      <Stack sx={{height: 600}} direction="row" spacing={2}>
        <DataDisplay mode="light" />
        <Stack spacing={1} sx={{minWidth: 270}}>
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
      <Stack direction="row" spacing={1} sx={{justifyContent: 'space-between', pr: 1, pl: 1}}>
        <Stack direction="row">
          <Typography sx={{alignSelf: 'center', fontWeight: 700, pr: 2}}>Year: </Typography>
          <ToggleButtonGroup
            value={view.time_agg}
            aria-label="show all times"
            exclusive
            size="small"
            onChange={(_, value) => editView({key: 'time_agg', value: value ? 'all' : 'last'})}
          >
            <ToggleButton value="all" aria-label="show first year" color={view.time_agg == 'all' ? 'info' : 'standard'}>
              All
            </ToggleButton>
          </ToggleButtonGroup>
          <IconButton onClick={() => changeYear(false)} aria-label="back a year">
            <ChevronLeft />
          </IconButton>
          <ToggleButtonGroup
            value={view.time_agg === 'specified' ? view.select_year : view.time_agg}
            sx={{'& .MuiButtonBase-root': {pr: 2, pl: 2}}}
            aria-label="time handling options"
            exclusive
            size="small"
            onChange={(_, value) => changeYear(true, value)}
          >
            <ToggleButton
              value="first"
              aria-label="show first year"
              color={view.time_agg == 'first' ? 'info' : 'standard'}
            >
              First
            </ToggleButton>
            <ToggleButton
              sx={{textDecoration: view.time_agg === 'specified' ? '' : 'line-through'}}
              value={view.select_year}
              color={view.time_agg == 'specified' ? 'info' : 'standard'}
              aria-label="show a specified year"
            >
              {view.select_year}
            </ToggleButton>
            <ToggleButton
              value="last"
              aria-label="show latest year"
              color={view.time_agg == 'last' ? 'info' : 'standard'}
            >
              Last
            </ToggleButton>
          </ToggleButtonGroup>
          <IconButton onClick={() => changeYear(true)} aria-label="forward a year">
            <ChevronRight />
          </IconButton>
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
          <Sources sources={full.meta.sources} />
        </Stack>
      </Stack>
    </Stack>
  )
}
