'use client'

import {Box, createTheme, CssBaseline, Stack, ThemeProvider, Typography} from '@mui/material'
import Splits from './splits'
import {DataView} from '../data/view'

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
            How do gender gaps in labor markets evolve with development? Do these patterns differ across regions? How do
            gender gaps vary across demographic groups?
          </Typography>
        </Stack>
        <DataView>
          <Splits />
        </DataView>
      </Box>
    </ThemeProvider>
  )
}
