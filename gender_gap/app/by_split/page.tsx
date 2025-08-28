'use client'

import {Box, createTheme, CssBaseline, Link, Stack, ThemeProvider, Typography} from '@mui/material'
import Splits from './splits'
import {DataView} from '../data/view'
import {DATA_VERSION} from '../metadata'

const FONT_URL = 'https://egc.yale.edu/themes/custom/economics/assets/dist/fonts/'

const theme = createTheme({
  typography: {
    fontFamily: 'Mallory, Fallback',
    body1: {
      fontSize: '18px',
      lineHeight: 1.8,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: 'Mallory';
          font-weight: 300;
          src: url(${FONT_URL}Mallory-Light.woff2) format('woff2');
        }
        @font-face {
          font-family: 'Mallory';
          font-weight: 700;
          src: url(${FONT_URL}Mallory-Bold.woff2) format('woff2');
        }
        @font-face {
          font-family: Fallback;
          src: local('Verdana');
          size-adjust: 95.5%;
        }
      `,
    },
  },
  colorSchemes: {
    light: {palette: {mode: 'light', primary: {main: '#286dc0'}, secondary: {main: '#286dc0'}}},
  },
})

export default function Home() {
  return (
    <ThemeProvider theme={theme} defaultMode="light" noSsr>
      <CssBaseline enableColorScheme />
      <Box>
        <Stack spacing={2} sx={{mb: 3}}>
          <Typography>
            How are gender gaps in labor force participation, sectoral employment, and unemployment, affected by Gross
            Domestic Product (GDP) per capita? How do these patterns differ across global regions? Do gender gaps in
            these labor market indicators hold for higher ages or education levels, or when controlling for marital or
            urban/rural status?
          </Typography>
          <Typography>
            This project sheds light on these questions, by visualizing data from the{' '}
            <Link href="https://sites.google.com/site/gottliebcharles/work-in-data" rel="noreferrer" target="_blank">
              Harmonized World Labor Force Surveys
            </Link>{' '}
            (HWLFS; aggregated{' '}
            <Typography component="code" sx={{fontFamily: 'monospace', whiteSpace: 'nowrap'}}>
              {DATA_VERSION}
            </Typography>
            ) which were originally compiled by{' '}
            <Link
              href="https://sites.google.com/site/gottliebcharles/Charles-Gottlieb"
              rel="noreferrer"
              target="_blank"
            >
              Charles Gottlieb
            </Link>{' '}
            to understand the nature of work and livelihoods across the world. Use this interactive data visualization
            portal to learn about how gender gaps in labor markets vary globally.
          </Typography>
          <Typography>
            The HWLFS database contains demographic, educational, and employment information at the individual level,
            from 110 countries across 20 years, drawn from a combination of IPUMS, household surveys and labour force
            surveys from national statistical offices and the World Bank.
          </Typography>
        </Stack>
        <DataView>
          <Splits />
        </DataView>
      </Box>
    </ThemeProvider>
  )
}
