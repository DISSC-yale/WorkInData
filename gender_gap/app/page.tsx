'use client'

import {Box, Button, Card, CardHeader, Drawer, IconButton} from '@mui/material'
import {useState} from 'react'
import {Close} from '@mui/icons-material'
import NavBar from './parts/nav_bar'
import {Export} from './parts/export'
import {DataMenu} from './dashboard/data_menu'
import {About} from './dashboard/about'
import {DataView} from './data/view'
import {DataDisplay} from './data/display'

const DRAWER_WIDTH = 310
let resizeAnimationFrame: number | NodeJS.Timeout = -1

export default function Dashboard() {
  const [showAbout, setShowAbout] = useState(false)
  const [rightPos, setRightPos] = useState(DRAWER_WIDTH)
  const resize = () => {
    setRightPos(rightPos ? 0 : DRAWER_WIDTH)
    setShowAbout(false)
    resizeAnimationFrame = setInterval(() => window.dispatchEvent(new Event('resize')))
    setTimeout(() => clearInterval(resizeAnimationFrame), 500)
  }
  setTimeout(() => window.dispatchEvent(new Event('resize')), 100)
  return (
    <DataView>
      <NavBar>
        <Export />
        <Button
          color="inherit"
          disableRipple
          variant="text"
          onClick={() => {
            if (rightPos) {
              setShowAbout(!showAbout)
            } else {
              resize()
              setShowAbout(true)
            }
          }}
        >
          {showAbout ? 'Data Menu' : 'About'}
        </Button>
        <Button
          disableRipple
          variant="text"
          color="inherit"
          sx={{width: rightPos ? DRAWER_WIDTH - 7 : 'auto'}}
          onClick={() => {
            setShowAbout(false)
            resize()
          }}
        >
          Data Menu
        </Button>
      </NavBar>
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          top: 48,
          left: 0,
          right: rightPos + 'px',
          transition: 'right 200ms',
          overflow: 'auto',
          pt: 1,
        }}
      >
        <DataDisplay />
      </Box>
      <Drawer variant="persistent" open={!!rightPos} anchor="right" sx={{height: '100%'}}>
        <Card sx={{width: DRAWER_WIDTH + 'px', height: '100%', pb: 5}}>
          <CardHeader
            title={showAbout ? 'About' : 'Data Menu'}
            sx={{p: 1}}
            action={
              <IconButton
                aria-label={'Close ' + (showAbout ? 'about' : 'data menu') + ' panel'}
                onClick={showAbout ? () => setShowAbout(false) : resize}
                className="close-button"
              >
                <Close />
              </IconButton>
            }
          />
          {showAbout ? <About /> : <DataMenu />}
        </Card>
      </Drawer>
    </DataView>
  )
}
