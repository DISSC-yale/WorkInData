import {Box, Button} from '@mui/material'
import {useState} from 'react'

export function Expandable({children, startExpanded}: Readonly<{children: React.ReactNode; startExpanded?: boolean}>) {
  const [expanded, setExpanded] = useState(!!startExpanded)
  return (
    <Box>
      {expanded && children}
      <Button size="small" color="secondary" fullWidth onClick={() => setExpanded(!expanded)}>
        show {expanded ? 'less' : 'more'}
      </Button>
    </Box>
  )
}
