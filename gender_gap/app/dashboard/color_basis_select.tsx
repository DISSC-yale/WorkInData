import {FormControl, InputLabel, MenuItem, Select, Tooltip, Typography} from '@mui/material'
import type {ViewAction} from '../data/view'

export function ColorBasis({
  current,
  viewAction,
  outlined,
}: {
  current: string
  viewAction: (action: ViewAction) => void
  outlined?: boolean
}) {
  return (
    <Tooltip title="Determines how colors are selected for each country." placement="top">
      <FormControl variant={outlined ? 'outlined' : 'filled'} fullWidth size="small">
        <InputLabel id="color_basis_select">Color Basis</InputLabel>
        <Select
          labelId="color_basis_select"
          label="Color Basis"
          value={current}
          onChange={e => {
            viewAction({key: 'color_source', value: e.target.value as 'gdp'})
          }}
        >
          <MenuItem value="gdp">
            <Typography>GDP per capita</Typography>
          </MenuItem>
          <MenuItem value="region">
            <Typography>Region</Typography>
          </MenuItem>
          <MenuItem value="income">
            <Typography>Income Classification</Typography>
          </MenuItem>
        </Select>
      </FormControl>
    </Tooltip>
  )
}
