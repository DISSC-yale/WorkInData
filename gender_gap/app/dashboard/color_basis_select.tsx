import {FormControl, InputLabel, MenuItem, Select, Tooltip} from '@mui/material'
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
          autoFocus={false}
          MenuProps={{autoFocus: false, disableAutoFocus: true}}
          onFocus={e => {
            console.log('hgddhg')
          }}
          onChange={e => {
            viewAction({key: 'color_source', value: e.target.value as 'gdp'})
          }}
        >
          <MenuItem value="gdp">GDP per capita</MenuItem>
          <MenuItem value="region">Region</MenuItem>
          <MenuItem value="income">Income</MenuItem>
        </Select>
      </FormControl>
    </Tooltip>
  )
}
