import {Box, Button, CardContent, Link, Stack, Typography, useColorScheme} from '@mui/material'
import {FilterActionContext, urlParamsToString, ViewActionContext, type URLParams} from '../data/view'
import {Variable} from '../data/variable'
import {useContext} from 'react'
import {DataContext, type Resources} from '../data/load'

const exampleParams: {title: string; comment: string; view: URLParams}[] = [
  {
    title: 'Between Countries',
    comment:
      'First, when looking between countries, we can see a standard u-shaped relationship between' +
      ' gender gap in labor force participation (LFP) and gross domestic product per capita (GDP):',
    view: {
      as_plot: true,
      lock_range: true,
      x: new Variable({base: 'gdp_ppp', log: true}),
      y: new Variable({
        base: 'weight',
        percent: true,
        subset: {variable: 'main_activity', level: 'Out of Workforce', levelIndex: 2, adjust: '-'},
        summary: {variable: 'sex', level: 'Male', levelIndex: 1, adjust: '-'},
      }),
      color: 'country',
      symbol: '',
      x_panels: '',
      y_panels: '',
      time_agg: 'last',
      select_year: '2023',
      country_center: false,
      color_source: 'gdp',
      min_year: '1998',
      advanced: false,
      regression: 'polynomial',
      within_split: true,
    },
  },
  {
    title: '',
    comment: 'Splitting by education, we see that this pattern mainly appears in the lower education subset:',
    view: {
      as_plot: true,
      lock_range: true,
      x: new Variable({base: 'gdp_ppp', log: true}),
      y: new Variable({
        base: 'weight',
        percent: true,
        subset: {variable: 'main_activity', level: 'Out of Workforce', levelIndex: 2, adjust: '-'},
        summary: {variable: 'sex', level: 'Male', levelIndex: 1, adjust: '-'},
      }),
      color: 'country',
      symbol: '',
      x_panels: '',
      y_panels: 'education',
      time_agg: 'last',
      select_year: '2023',
      country_center: false,
      color_source: 'gdp',
      min_year: '1998',
      advanced: false,
      regression: 'polynomial',
      within_split: true,
    },
  },
  {
    title: 'Within Countries',
    comment:
      'Looking at trends over time within countries, we see that there is more between-country variation than within-country variation:',
    view: {
      as_plot: true,
      lock_range: true,
      x: new Variable({base: 'gdp_ppp', log: true}),
      y: new Variable({
        base: 'weight',
        percent: true,
        subset: {variable: 'main_activity', level: 'Out of Workforce', levelIndex: 2, adjust: '-'},
        summary: {variable: 'sex', level: 'Male', levelIndex: 1, adjust: '-'},
      }),
      color: 'country',
      symbol: '',
      x_panels: '',
      y_panels: '',
      time_agg: 'all',
      select_year: '2023',
      country_center: false,
      color_source: 'gdp',
      min_year: '1998',
      advanced: false,
      countries: 'CHN,IND,MEX,USA,BRA',
      regression: 'polynomial',
      within_split: true,
    },
  },
  {
    title: '',
    comment: 'There seems to be more of a relationship between LFP and GDP among those who are married or cohabiting:',
    view: {
      as_plot: true,
      lock_range: true,
      x: new Variable({base: 'gdp_ppp', log: true}),
      y: new Variable({
        base: 'weight',
        percent: true,
        subset: {variable: 'main_activity', level: 'Out of Workforce', levelIndex: 2, adjust: '-'},
        summary: {variable: 'sex', level: 'Male', levelIndex: 1, adjust: '-'},
      }),
      color: 'country',
      symbol: '',
      x_panels: '',
      y_panels: 'marital_status',
      time_agg: 'all',
      select_year: '2023',
      country_center: false,
      color_source: 'gdp',
      min_year: '1998',
      advanced: false,
      countries: 'CHN,IND,MEX,USA,BRA',
      regression: 'polynomial',
      within_split: true,
    },
  },
  {
    title: 'By Employment Sector',
    comment:
      'We can see different between-country relationships between log GDP per capita (PPP) and gender gaps in participation rates within single employment sectors.' +
      ' For instance, gender gaps in industry are positively associated with GDP per capita:',
    view: {
      as_plot: true,
      lock_range: true,
      x: new Variable({base: 'gdp_ppp', log: true}),
      y: new Variable({
        base: 'weight',
        percent: true,
        subset: {variable: 'main_activity', level: 'Industry', levelIndex: 1, adjust: ''},
        summary: {variable: 'sex', level: 'Male', levelIndex: 1, adjust: '-'},
      }),
      color: 'country',
      symbol: '',
      x_panels: '',
      y_panels: '',
      time_agg: 'last',
      select_year: '2023',
      country_center: false,
      color_source: 'gdp',
      min_year: '1998',
      advanced: false,
      regression: 'polynomial',
      within_split: true,
    },
  },
  {
    title: '',
    comment: 'However, gender gaps in services are more negatively associated with GDP per capita (PPP):',
    view: {
      as_plot: true,
      lock_range: true,
      x: new Variable({base: 'gdp_ppp', log: true}),
      y: new Variable({
        base: 'weight',
        percent: true,
        subset: {variable: 'main_activity', level: 'Services', levelIndex: 3, adjust: ''},
        summary: {variable: 'sex', level: 'Male', levelIndex: 1, adjust: '-'},
      }),
      color: 'country',
      symbol: '',
      x_panels: '',
      y_panels: '',
      time_agg: 'last',
      select_year: '2023',
      country_center: false,
      color_source: 'gdp',
      min_year: '1998',
      advanced: false,
      regression: 'polynomial',
      within_split: true,
    },
  },
]

export function About() {
  const {mode} = useColorScheme()
  const filterAction = useContext(FilterActionContext)
  const viewAction = useContext(ViewActionContext)
  const {meta} = useContext(DataContext) as Resources
  const baseUrl = window.location.origin + window.location.pathname
  return (
    <CardContent
      sx={{
        overflow: 'hidden',
        height: '100%',
        pt: 0,
        pb: 0,
        '& .code': {
          fontSize: '.7em',
          wordBreak: 'break-all',
          p: 1,
          borderRadius: 2,
          backgroundColor: mode === 'dark' ? '#000000' : '#f3f3f3',
          textTransform: 'none',
          textAlign: 'left',
          userSelect: 'text',
        },
      }}
    >
      <Box sx={{overflowY: 'auto', height: '100%'}}>
        <Stack spacing={1}>
          <Typography>
            This site was built by the Yale{' '}
            <Link href="https://egc.yale.edu/" rel="noreferrer" target="_blank">
              Economic Growth Center
            </Link>
            .
          </Typography>
          <Typography>
            Data are aggregates created from the{' '}
            <Link href="https://sites.google.com/site/gottliebcharles/work-in-data" rel="noreferrer" target="_blank">
              Work in Data
            </Link>{' '}
            dataset on{' '}
            <Typography component="code" sx={{fontFamily: 'monospace', whiteSpace: 'nowrap'}}>
              {meta.updated}
            </Typography>
            .
          </Typography>
          <Button href="sources" target="_blank" rel="noreferrer" variant="outlined">
            Sources
          </Button>

          <Typography variant="h5" sx={{pt: 1, pb: 1}}>
            Links
          </Typography>
          <Button
            href="https://egc.yale.edu/gender-and-labor"
            rel="noreferrer"
            target="_blank"
            variant="outlined"
            fullWidth
          >
            Simplified Display
          </Button>
          <Button
            href="https://dissc-yale.github.io/WorkInData/"
            rel="noreferrer"
            target="_blank"
            variant="outlined"
            fullWidth
          >
            Documentation
          </Button>
          <Button
            href="https://github.com/DISSC-yale/WorkInData"
            rel="noreferrer"
            target="_blank"
            variant="outlined"
            fullWidth
          >
            Source Code
          </Button>
        </Stack>
        <Typography variant="h5" sx={{pt: 1, pb: 1}}>
          Examples
        </Typography>
        <Typography variant="body2">
          The following walks through a few examples of things we might explore in the data.
        </Typography>
        {exampleParams.map(({title, comment, view}, i) => {
          return (
            <Box sx={{pb: 1}} key={i}>
              {title && (
                <Typography variant="h6" fontWeight="bold">
                  {title}
                </Typography>
              )}
              <Typography variant="body2">{comment}</Typography>
              <Button
                className="code"
                onClick={() => {
                  filterAction({key: 'replace', filter: view})
                  viewAction({key: 'replace', view})
                }}
              >
                {baseUrl}
                {urlParamsToString(view)}
              </Button>
            </Box>
          )
        })}
      </Box>
    </CardContent>
  )
}
