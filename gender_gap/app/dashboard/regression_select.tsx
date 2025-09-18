import {FormControl, InputLabel, MenuItem, Select, Typography} from '@mui/material'
import type {ViewAction} from '../data/view'

export function RegressionSelect({current, viewAction}: {current: string; viewAction: (action: ViewAction) => void}) {
  return (
    <FormControl variant="outlined" fullWidth size="small">
      <InputLabel id="regression_select">Regression Type</InputLabel>
      <Select
        labelId="regression_select"
        label="Regression Type"
        value={current}
        onChange={e => {
          viewAction({key: 'regression', value: e.target.value as 'none'})
        }}
      >
        <MenuItem value="none">
          <Typography>None</Typography>
        </MenuItem>
        <MenuItem value="linear">
          <Typography>Linear</Typography>
        </MenuItem>
        <MenuItem value="logarithmic">
          <Typography>Logarithmic</Typography>
        </MenuItem>
        <MenuItem value="polynomial">
          <Typography>Quadratic</Typography>
        </MenuItem>
      </Select>
    </FormControl>
  )
}
