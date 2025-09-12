import {Box, Button, CardContent, Link, Typography, useColorScheme} from '@mui/material'
import {FilterActionContext, urlParamsToString, ViewActionContext, type URLParams} from '../data/view'
import {Variable} from '../data/variable'
import {useContext} from 'react'
import {DataContext, type Resources} from '../data/load'
import {Sources} from '../parts/sources'

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
        summary: {variable: 'sex', level: 'Female', levelIndex: 0, adjust: '-'},
      }),
      color: 'country',
      symbol: '',
      x_panels: '',
      y_panels: '',
      time_agg: 'last',
      select_year: '2018',
      country_center: false,
      color_source: 'gdp',
      min_year: '1998',
      advanced: false,
      regression: 'polynomial',
    },
  },
  {
    title: '',
    comment: 'Splitting by education, we see that this pattern only appears in the lower education subset:',
    view: {
      as_plot: true,
      lock_range: true,
      x: new Variable({base: 'gdp_ppp', log: true}),
      y: new Variable({
        base: 'weight',
        percent: true,
        subset: {variable: 'main_activity', level: 'Out of Workforce', levelIndex: 2, adjust: '-'},
        summary: {variable: 'sex', level: 'Female', levelIndex: 0, adjust: '-'},
      }),
      color: 'country',
      symbol: '',
      x_panels: '',
      y_panels: 'education',
      time_agg: 'last',
      select_year: '2018',
      country_center: false,
      color_source: 'gdp',
      min_year: '1998',
      advanced: false,
      regression: 'linear',
    },
  },
  {
    title: 'Within Countries',
    comment:
      'Looking at trends over time within countries, we see that there is much more between-country variation than with:',
    view: {
      as_plot: true,
      lock_range: true,
      x: new Variable({base: 'gdp_ppp', log: true}),
      y: new Variable({
        base: 'weight',
        percent: true,
        subset: {variable: 'main_activity', level: 'Out of Workforce', levelIndex: 2, adjust: '-'},
        summary: {variable: 'sex', level: 'Female', levelIndex: 0, adjust: '-'},
      }),
      color: 'country',
      symbol: '',
      x_panels: '',
      y_panels: '',
      time_agg: 'all',
      select_year: '2018',
      country_center: false,
      color_source: 'gdp',
      min_year: '1998',
      advanced: false,
      countries: 'CHN,IND,MEX,USA,BRA',
      regression: 'linear',
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
        summary: {variable: 'sex', level: 'Female', levelIndex: 0, adjust: '-'},
      }),
      color: 'country',
      symbol: '',
      x_panels: '',
      y_panels: 'marital_status',
      time_agg: 'all',
      select_year: '2018',
      country_center: false,
      color_source: 'gdp',
      min_year: '1998',
      advanced: false,
      countries: 'CHN,IND,MEX,USA,BRA',
      regression: 'linear',
    },
  },
  {
    title: 'By Employment Sector',
    comment:
      'We can see different between-country relationships between GDP and sex gaps in participation rates within single employment sectors.' +
      ' For instance, where is a negative relationship within the industry sector:',
    view: {
      as_plot: true,
      lock_range: true,
      x: new Variable({base: 'gdp_ppp', log: true}),
      y: new Variable({
        base: 'weight',
        percent: true,
        subset: {variable: 'main_activity', level: 'Industry', levelIndex: 1, adjust: ''},
        summary: {variable: 'sex', level: 'Female', levelIndex: 0, adjust: '-'},
      }),
      color: 'country',
      symbol: '',
      x_panels: '',
      y_panels: '',
      time_agg: 'last',
      select_year: '2018',
      country_center: false,
      color_source: 'gdp',
      min_year: '1998',
      advanced: false,
      regression: 'linear',
    },
  },
  {
    title: '',
    comment: 'But a positive relationship within the non-market services sector:',
    view: {
      as_plot: true,
      lock_range: true,
      x: new Variable({base: 'gdp_ppp', log: true}),
      y: new Variable({
        base: 'weight',
        percent: true,
        subset: {variable: 'main_activity', level: 'Services - Non-Market', levelIndex: 4, adjust: ''},
        summary: {variable: 'sex', level: 'Female', levelIndex: 0, adjust: '-'},
      }),
      color: 'country',
      symbol: '',
      x_panels: '',
      y_panels: '',
      time_agg: 'last',
      select_year: '2018',
      country_center: false,
      color_source: 'gdp',
      min_year: '1998',
      advanced: false,
      regression: 'linear',
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
        <Sources sources={meta.sources} />
        <Typography variant="h5" sx={{pt: 1, pb: 1}}>
          Examples
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
                  // view.x.index = variableSpecs.findIndex(s => s.name === view.x.name)
                  // if (view.x.index === -1) {
                  //   view.x.index = variableSpecs.length
                  //   setVariableSpecs([...variableSpecs, view.x])
                  // }
                  // view.y.index = variableSpecs.findIndex(s => s.name === view.y.name)
                  // if (view.y.index === -1) {
                  //   view.y.index = variableSpecs.length
                  //   setVariableSpecs([...variableSpecs, view.y])
                  // }
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
