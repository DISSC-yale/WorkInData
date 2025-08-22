'use client'

import {CssBaseline, ThemeProvider, createTheme} from '@mui/material'

const theme = createTheme({
  colorSchemes: {
    dark: {palette: {mode: 'dark', primary: {main: '#a5cdff'}, secondary: {main: '#68abff'}}},
    light: {palette: {mode: 'light', primary: {main: '#286dc0'}, secondary: {main: '#286dc0'}}},
  },
})

export default function Theme({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <ThemeProvider theme={theme} defaultMode="dark" noSsr>
      <div suppressHydrationWarning={true}>
        <CssBaseline enableColorScheme />
      </div>
      {children}
    </ThemeProvider>
  )
}
