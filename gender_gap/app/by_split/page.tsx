'use client'

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  createTheme,
  CssBaseline,
  Link,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  ThemeProvider,
  Typography,
} from '@mui/material'
import Splits from './splits'
import {DataView} from '../data/view'
import {ExpandMore} from '@mui/icons-material'

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
          <Typography>
            This project draws on the{' '}
            <Link href="https://sites.google.com/site/gottliebcharles/work-in-data" rel="noreferrer" target="_blank">
              Harmonized World Labor Force Surveys
            </Link>{' '}
            (HWLFS; work-in-data)
            {', '}
            an initiative that harmonizes labor market and time use microdata across countries.
          </Typography>
          <Typography>
            The HWLFS database behind this portal draws from a combination of IPUMS, household surveys, and labour force
            surveys from national statistical offices, regional statistical hubs, and the World Bank. Scroll down for a
            table of data source citations.
          </Typography>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />} aria-controls="howto-split" id="howto-split_header">
              <Typography>How To Use</Typography>
            </AccordionSummary>
            <AccordionDetails id="howto-split">
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Typography>1.</Typography>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography>Choose a split</Typography>}
                    secondary={
                      <Typography>
                        Choose how you’d like to break down the results, splitting by age, education, marital status,
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
                    primary={<Typography>Choose an outcome</Typography>}
                    secondary={
                      <Typography>
                        Select a labor market outcome: work in agriculture, industry, or services, unemployment, or out
                        of the labor force. Outcomes are expressed as shares of the working-age population age 15-65.
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
                        Choose if you want to see the gender gap, gender ratio, share of men or share of women for this
                        outcome.
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
                        Use the country filter to include or exclude specific countries and regions. By default, the
                        latest available year is selected, but you can choose a specific year, the earliest year, or all
                        years.
                      </Typography>
                    }
                  />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>
        </Stack>
        <DataView>
          <Splits />
        </DataView>
      </Box>
    </ThemeProvider>
  )
}
