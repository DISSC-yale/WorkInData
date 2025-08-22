import {Autocomplete, Box, Button, Checkbox, Stack, TextField, Typography} from '@mui/material'
import {useCallback, useContext} from 'react'
import {DataContext, type Resources} from '../data/load'
import {FilterActionContext, FilterContext, FilterDef} from '../data/view'

export function FilterCountry({backgroundColor}: {backgroundColor: string}) {
  const filter = useContext(FilterContext) as FilterDef
  const filterAction = useContext(FilterActionContext)
  const full = useContext(DataContext) as Resources

  const countryGroupSelected = useCallback(
    (group: string) => {
      const {countryInfo} = full
      const selected = filter.countries
      let checked = true
      Object.keys(full.levels.countries).forEach(country => {
        if (checked && country in countryInfo && countryInfo[country].region === group) {
          checked = country in selected
        }
      })
      return checked
    },
    [full, filter.countries]
  )
  return (
    <Stack direction="row">
      <Autocomplete
        options={Object.keys(full.levels.countries)}
        groupBy={option => (option in full.countryInfo ? full.countryInfo[option].region : 'unknown')}
        sx={{'& li': {p: 0}}}
        renderGroup={params => {
          return (
            <Box key={params.key}>
              <Stack
                direction="row"
                sx={{
                  position: 'sticky',
                  top: '-8px',
                  backgroundColor,
                  alignItems: 'center',
                  zIndex: 1,
                }}
              >
                <Checkbox
                  key={params.group}
                  onChange={(_, checked) => {
                    const {countryInfo} = full
                    const value = {...filter.countries}
                    Object.keys(full.levels.countries).forEach(country => {
                      if (countryInfo[country].region === params.group) {
                        if (checked) {
                          value[country] = true
                        } else {
                          delete value[country]
                        }
                      }
                    })
                    filterAction({key: 'countries', value})
                  }}
                  checked={countryGroupSelected(params.group)}
                />
                <Typography fontSize="small">{params.group}</Typography>
              </Stack>
              {params.children}
            </Box>
          )
        }}
        renderOption={(props, option, {selected}) => {
          const {key, ...optionProps} = props
          return (
            <li key={key} {...optionProps} style={{paddingTop: 0, paddingBottom: 0}}>
              <Checkbox checked={selected} size="small" />
              <Typography fontSize="small">{full.countryInfo[option].name + ' (' + option + ')'}</Typography>
            </li>
          )
        }}
        renderInput={params => <TextField {...params} label="Countries" />}
        value={Object.keys(filter.countries)}
        renderValue={() => (
          <Typography sx={{p: 1, pt: 0, pb: 0, whiteSpace: 'nowrap'}}>
            {Object.keys(filter.countries).length} / {Object.keys(full.levels.countries).length}
          </Typography>
        )}
        multiple
        disableCloseOnSelect
        fullWidth
        size="small"
        onChange={(_, selection) => {
          const value: {[index: string]: boolean} = {}
          selection.forEach(country => (value[country] = true))
          filterAction({key: 'countries', value})
        }}
      ></Autocomplete>
      <Button
        size="small"
        variant="contained"
        onClick={() => filterAction({key: 'countries', value: full.levels.countries})}
      >
        All
      </Button>
    </Stack>
  )
}
