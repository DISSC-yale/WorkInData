'use client'

import {
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material'
import {variableInfo} from '../metadata'
import {useContext, useState} from 'react'
import {Close, Edit} from '@mui/icons-material'
import {DataContext} from '../data/load'
import {Variable} from '../data/variable'

const adjustOptions = [
  <MenuItem key="" value="">
    None
  </MenuItem>,
  <MenuItem key="-" value="-">
    Subtract
  </MenuItem>,
]
const adjustSummaryOptions = [
  <MenuItem key="" value="">
    None
  </MenuItem>,
  <MenuItem key="-" value="-">
    Subtract
  </MenuItem>,
  <MenuItem key="/" value="/">
    Divide
  </MenuItem>,
]

export function CustomVariable({spec, update}: {spec?: Variable; update: () => void}) {
  const full = useContext(DataContext)
  const [open, setOpen] = useState(false)
  if (!full || !spec) return <></>
  const {variableLevels} = full
  const close = () => setOpen(!open)
  return (
    <>
      <IconButton onClick={close} size="small" aria-label="edit variable">
        <Edit />
      </IconButton>
      {open && (
        <Dialog open={open} onClose={close} hideBackdrop>
          <DialogTitle>Variable Customization</DialogTitle>
          <IconButton
            aria-label="close custom variable menu"
            onClick={close}
            sx={{
              position: 'absolute',
              right: 8,
              top: 12,
            }}
          >
            <Close />
          </IconButton>
          <DialogContent sx={{minWidth: 500, maxWidth: '100%', pt: 0}}>
            <Stack spacing={2}>
              <Typography sx={{textAlign: 'center', fontWeight: 'bold', opacity: 0.7, whiteSpace: 'nowrap'}}>
                {spec.name}
              </Typography>
              <Typography sx={{textAlign: 'center', opacity: 0.7, pb: 1, fontSize: '.8em'}}>
                {spec.description}
              </Typography>
              <FormControl variant="outlined" fullWidth size="small">
                <InputLabel id="base_select">Base Variable</InputLabel>
                <Select
                  labelId="base_select"
                  label="Base Variable"
                  value={spec.base}
                  onChange={e => {
                    spec.update({key: 'base', value: e.target.value})
                    update()
                  }}
                >
                  {['count', 'weight', 'gdp', 'gdp_ppp', 'population'].map(v => (
                    <MenuItem key={v} value={v}>
                      <Tooltip title={v in variableInfo ? variableInfo[v].label : v} placement="left">
                        <Typography>{v}</Typography>
                      </Tooltip>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {spec.base === 'year' ? (
                <></>
              ) : spec.isGlobal ? (
                <>
                  <FormControlLabel
                    label="Log"
                    labelPlacement="start"
                    control={
                      <Switch
                        checked={spec.log}
                        onChange={() => {
                          spec.update({key: 'log', value: !spec.log})
                          update()
                        }}
                      />
                    }
                  />
                </>
              ) : (
                <Stack spacing={1}>
                  <FormControlLabel
                    label="Percent"
                    labelPlacement="start"
                    control={
                      <Switch
                        checked={spec.percent}
                        onChange={() => {
                          spec.update({key: 'percent', value: !spec.percent})
                          update()
                        }}
                      />
                    }
                  />
                  <FormControlLabel
                    label="Main Activity Proportion"
                    sx={{flexDirection: 'row'}}
                    control={
                      <Switch
                        checked={!!spec.subset.variable}
                        onChange={() => {
                          if (spec.subset.variable) {
                            spec.updateLevel('subset', {key: 'remove'})
                          } else {
                            spec.updateLevel('subset', {
                              key: 'variable',
                              value: 'main_activity',
                              levels: variableLevels.main_activity,
                            })
                          }
                          update()
                        }}
                      />
                    }
                  />
                  <Stack direction="row" spacing={1}>
                    {spec.subset && spec.subset.variable && (
                      <>
                        <FormControl variant="outlined" fullWidth size="small">
                          <InputLabel id="subset_select">Main Activity</InputLabel>
                          <Select
                            labelId="subset_select"
                            label="Main Activity"
                            value={spec.subset ? spec.subset.level : ''}
                            onChange={e => {
                              spec.updateLevel('subset', {
                                key: 'level',
                                value: e.target.value,
                                levels: variableLevels[spec.subset.variable],
                              })
                              update()
                            }}
                          >
                            {spec.subset &&
                              variableLevels[spec.subset.variable].map(v => (
                                <MenuItem key={v} value={v}>
                                  <Tooltip title={v in variableInfo ? variableInfo[v].label : v} placement="left">
                                    <Typography>{v}</Typography>
                                  </Tooltip>
                                </MenuItem>
                              ))}
                          </Select>
                        </FormControl>
                        <FormControl variant="outlined" fullWidth size="small" sx={{width: 200}}>
                          <InputLabel id="subset_adj_select">Calculation</InputLabel>
                          <Select
                            labelId="subset_adj_select"
                            label="Calculation"
                            value={spec.subset ? spec.subset.adjust : ''}
                            onChange={e => {
                              spec.updateLevel('subset', {
                                key: 'adjust',
                                value: e.target.value as '',
                              })
                              update()
                            }}
                          >
                            {adjustOptions}
                          </Select>
                        </FormControl>
                      </>
                    )}
                  </Stack>
                  <FormControlLabel
                    label="Summarize By Sex"
                    sx={{flexDirection: 'row'}}
                    control={
                      <Switch
                        checked={!!spec.summary.variable}
                        onChange={() => {
                          if (spec.summary.variable) {
                            spec.updateLevel('summary', {key: 'remove'})
                          } else {
                            spec.updateLevel('summary', {
                              key: 'variable',
                              value: 'sex',
                              levels: variableLevels.sex,
                            })
                          }
                          update()
                        }}
                      />
                    }
                  />
                  <Stack direction="row" spacing={1} sx={{'& span': {whiteSpace: 'nowrap'}}}>
                    {spec.summary && spec.summary.variable && (
                      <>
                        <FormControl variant="outlined" fullWidth size="small">
                          <InputLabel id="summary_select">Reference Category</InputLabel>
                          <Select
                            labelId="summary_select"
                            label="Reference Category"
                            value={spec.summary ? spec.summary.level : ''}
                            onChange={e => {
                              spec.updateLevel('summary', {
                                key: 'level',
                                value: e.target.value,
                                levels: variableLevels[spec.summary.variable],
                              })
                              update()
                            }}
                          >
                            {spec.summary &&
                              variableLevels[spec.summary.variable].map(v => (
                                <MenuItem key={v} value={v}>
                                  <Tooltip title={v in variableInfo ? variableInfo[v].label : v} placement="left">
                                    <Typography>{v}</Typography>
                                  </Tooltip>
                                </MenuItem>
                              ))}
                          </Select>
                        </FormControl>
                        <FormControl variant="outlined" fullWidth size="small" sx={{width: 300}}>
                          <InputLabel id="summary_adj_select">Calculation</InputLabel>
                          <Select
                            labelId="summary_adj_select"
                            label="Calculation"
                            value={spec.summary ? spec.summary.adjust : ''}
                            onChange={e => {
                              spec.updateLevel('summary', {
                                key: 'adjust',
                                value: e.target.value as '',
                              })
                              update()
                            }}
                          >
                            {adjustSummaryOptions}
                          </Select>
                        </FormControl>
                        {spec.percent && (
                          <FormControlLabel
                            label="Within-Group Totals"
                            labelPlacement="top"
                            sx={{'& .MuiTypography-root': {fontSize: '.8em'}}}
                            control={
                              <Switch
                                size="small"
                                checked={!spec.summary.overall}
                                onChange={() => {
                                  spec.updateLevel('summary', {
                                    key: 'overall',
                                    value: !spec.summary.overall,
                                  })
                                  update()
                                }}
                              />
                            }
                          />
                        )}
                      </>
                    )}
                  </Stack>
                </Stack>
              )}
            </Stack>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
