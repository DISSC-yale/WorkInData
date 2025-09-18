import {
  Box,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  ListSubheader,
  MenuItem,
  Select,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material'
import {useContext, useMemo} from 'react'
import {variableInfo} from '../metadata'
import {FlipCameraAndroid} from '@mui/icons-material'
import {splitComponents, VariableSpecContext, ViewContext, ViewDef, ViewActionContext} from '../data/view'
import {DataContext, Resources} from '../data/load'
import {CustomVariable} from './custom_variable'
import {ColorBasis} from './color_basis_select'
import {RegressionSelect} from './regression_select'

export function AdvancedMenu() {
  const {levels} = useContext(DataContext) as Resources
  const view = useContext(ViewContext) as ViewDef
  const editView = useContext(ViewActionContext)
  const variableSpecs = useContext(VariableSpecContext)

  const variable = useMemo(() => {
    const v = ['', 'total']
    splitComponents.forEach(component => {
      const componentValue = view[component as 'color']
      if (componentValue in levels.demo_segments) {
        v[0] = component
        v[1] = componentValue
      }
    })
    return v
  }, [view, levels.demo_segments])
  const splitOptions = useMemo(() => {
    return [
      <MenuItem key="none" value="">
        None
      </MenuItem>,
      <MenuItem key="country" value="country">
        Country
      </MenuItem>,
      <MenuItem key="year" value="year">
        Year
      </MenuItem>,
      <ListSubheader key="top_level">Top-Level Splits</ListSubheader>,
      <MenuItem key="main_activity" value="main_activity">
        {variableInfo.main_activity.label}
      </MenuItem>,
      <MenuItem key="sex" value="sex">
        {variableInfo.sex.label}
      </MenuItem>,
      <Tooltip key="demo_seg" title="Only one may be active at a time." placement="left">
        <ListSubheader>Demographic Segment</ListSubheader>
      </Tooltip>,
      ...Object.keys(levels.demo_segments).map(option => (
        <MenuItem key={option} value={option}>
          {option ? variableInfo[option].label : 'None'}
        </MenuItem>
      )),
    ]
  }, [levels.demo_segments])
  const specOptions = variableSpecs.map((spec, i) => {
    const info = variableInfo[spec.base]
    return (
      <MenuItem key={spec.name + i} value={spec.name}>
        <Tooltip title={'Basis: ' + (info.fullName ? info.fullName : info.label)} placement="left">
          <Typography sx={{textOverflow: 'ellipsis', overflow: 'hidden'}}>{spec.name}</Typography>
        </Tooltip>
      </MenuItem>
    )
  })
  return (
    <>
      <Stack direction="row" sx={{alignItems: 'center'}}>
        <Stack spacing={1} sx={{width: view.as_plot ? 'calc(100% - 40px)' : '100%'}}>
          <Stack direction="row">
            <FormControl variant="outlined" fullWidth size="small">
              <InputLabel id="y_select">{view.as_plot ? 'Y-Axis' : 'Value'}</InputLabel>
              <Select
                labelId="y_select"
                label={view.as_plot ? 'Y-Axis' : 'Value'}
                value={view.y.name}
                onChange={e => {
                  const value = e.target.value
                  if (view.y.name === value) {
                    editView({key: 'x', value: view.y})
                  }
                  editView({
                    key: 'y',
                    value: variableSpecs.find(s => s.name === value) || variableSpecs[0],
                  })
                }}
              >
                {specOptions}
              </Select>
            </FormControl>
            <CustomVariable spec={view.y} update={() => editView({key: 'y', value: view.y})} />
          </Stack>
          {view.as_plot && (
            <Stack direction="row">
              <FormControl variant="outlined" fullWidth size="small">
                <InputLabel id="x_select">X-Axis</InputLabel>
                <Select
                  labelId="x_select"
                  label="X-Axis"
                  value={view.x.name}
                  onChange={e => {
                    const value = e.target.value
                    if (view.x.name === value) {
                      editView({key: 'y', value: view.x})
                    }
                    editView({
                      key: 'x',
                      value: variableSpecs.find(s => s.name === value) || variableSpecs[0],
                    })
                  }}
                >
                  {specOptions}
                </Select>
              </FormControl>
              <CustomVariable spec={view.x} update={() => editView({key: 'x', value: view.x})} />
            </Stack>
          )}
        </Stack>
        {view.as_plot && (
          <IconButton
            aria-label="flip plot axes"
            onClick={() => {
              editView({key: 'x', value: view.y})
              editView({key: 'y', value: view.x})
            }}
          >
            <FlipCameraAndroid />
          </IconButton>
        )}
      </Stack>
      {view.as_plot && (
        <Stack spacing={1}>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Determines the color of points / lines, and appears in the legend." placement="left">
              <FormControl variant="filled" fullWidth size="small" sx={view.color === 'country' ? {width: 175} : {}}>
                <InputLabel id="color_select">Color</InputLabel>
                <Select
                  labelId="color_select"
                  label="Color"
                  value={view.color}
                  onChange={e => {
                    const value = e.target.value || ''
                    if (variable[0] && value in levels.demo_segments) {
                      editView({key: variable[0] as 'color', value: ''})
                    } else {
                      if (value) {
                        if (view.symbol === value) editView({key: 'symbol', value: view.color})
                      } else {
                        if (view.symbol) editView({key: 'symbol', value: ''})
                      }
                    }
                    editView({key: 'color', value})
                  }}
                >
                  {splitOptions.filter(e => e.key !== 'year')}
                </Select>
              </FormControl>
            </Tooltip>
            {view.color === 'country' && <ColorBasis current={view.color_source} viewAction={editView} />}
          </Stack>
          {view.color && (
            <Tooltip
              title="Determines the symbol, differentiating points / lines with the same color."
              placement="left"
            >
              <FormControl variant="filled" fullWidth size="small">
                <InputLabel id="symbol_select">Symbol</InputLabel>
                <Select
                  labelId="symbol_select"
                  label="Symbol"
                  value={view.symbol}
                  onChange={e => {
                    const value = e.target.value || ''
                    if (variable[0] && value in levels.demo_segments) {
                      editView({key: variable[0] as 'color', value: ''})
                    } else if (value && view.color === value) editView({key: 'color', value: view.symbol})
                    editView({key: 'symbol', value})
                  }}
                >
                  {splitOptions.filter(e => e.key !== 'year')}
                </Select>
              </FormControl>
            </Tooltip>
          )}
        </Stack>
      )}
      <Stack direction="row" sx={{alignItems: 'center'}}>
        <Stack spacing={1} sx={{width: '100%'}}>
          <FormControl variant="filled" fullWidth size="small">
            <InputLabel id="x_panels_select">Horizontal Panels</InputLabel>
            <Select
              labelId="x_panels_select"
              label="Horizontal Panels"
              value={view.x_panels}
              onChange={e => {
                const value = e.target.value || ''
                if (variable[0] && value in levels.demo_segments) {
                  editView({key: variable[0] as 'color', value: ''})
                } else if (value && view.y_panels === value) {
                  editView({key: 'y_panels', value: view.x_panels})
                }
                editView({key: 'x_panels', value})
              }}
            >
              {splitOptions}
            </Select>
          </FormControl>
          <FormControl variant="filled" fullWidth size="small">
            <InputLabel id="y_panels_select">Vertical Panels</InputLabel>
            <Select
              labelId="y_panels_select"
              label="Vertical Panels"
              value={view.y_panels}
              onChange={e => {
                const value = e.target.value || ''
                if (variable[0] && value in levels.demo_segments) {
                  editView({key: variable[0] as 'color', value: ''})
                } else if (value && view.x_panels === value) {
                  editView({key: 'x_panels', value: view.y_panels})
                }
                editView({key: 'y_panels', value})
              }}
            >
              {splitOptions}
            </Select>
          </FormControl>
        </Stack>
        <IconButton
          aria-label="flip panel variables"
          onClick={() => {
            editView({key: 'x_panels', value: view.y_panels})
            editView({key: 'y_panels', value: view.x_panels})
          }}
        >
          <FlipCameraAndroid />
        </IconButton>
      </Stack>
      <Tooltip
        title={
          'How to handle values from multiple years; display all, or select' +
          ' / derive a single value. On a map, all is the same as average.'
        }
        placement="left"
      >
        <FormControl size="small" variant="filled" fullWidth>
          <InputLabel id="time_agg_select">Time Handling</InputLabel>
          <Select
            labelId="time_agg_select"
            label="Time Handling"
            value={view.as_plot ? view.time_agg : view.time_agg === 'all' ? 'mean' : view.time_agg}
            onChange={e => {
              editView({key: 'time_agg', value: e.target.value as 'last'})
            }}
          >
            <MenuItem value="all" disabled={!view.as_plot}>
              All Years
            </MenuItem>
            <MenuItem value="first">Earliest Year</MenuItem>
            <MenuItem value="specified">Specified Year</MenuItem>
            <MenuItem value="last">Latest Year</MenuItem>
            <MenuItem value="mean">Average Across Years</MenuItem>
          </Select>
        </FormControl>
      </Tooltip>
      <Box sx={{pt: 2}}>
        <RegressionSelect current={view.regression} viewAction={editView} />
      </Box>
      {view.as_plot && view.time_agg === 'all' && (view.color === 'country' || view.symbol === 'country') && (
        <FormControlLabel
          label="Country Mean Center"
          labelPlacement="start"
          control={
            <Switch
              checked={view.country_center}
              onChange={() => editView({key: 'country_center', value: !view.country_center})}
            />
          }
        />
      )}
      {view.as_plot && (view.x_panels || view.y_panels) && (
        <FormControlLabel
          label="Common Axis Ranges"
          labelPlacement="start"
          control={
            <Switch checked={view.lock_range} onChange={() => editView({key: 'lock_range', value: !view.lock_range})} />
          }
        />
      )}
    </>
  )
}
