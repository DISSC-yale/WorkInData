import {Autocomplete, Box, Button, Checkbox, createFilterOptions, Stack, TextField, Typography} from '@mui/material'
import {useCallback, useContext, useMemo} from 'react'
import {DataContext, type Resources} from '../data/load'
import {FilterActionContext, FilterContext, FilterDef} from '../data/view'

type countryOption = {key: string; searchString: string; name: string; region: string}
const filterOptions = createFilterOptions({stringify: (option: countryOption) => option.searchString})
const countryOptions: {[index: string]: countryOption} = {}

export function FilterCountry({backgroundColor}: {backgroundColor: string}) {
  const filter = useContext(FilterContext) as FilterDef
  const filterAction = useContext(FilterActionContext)
  const full = useContext(DataContext) as Resources
  const makeCountryOption = useCallback(
    (country: string) => {
      if (!(country in countryOptions)) {
        const info = full.countryInfo[country]
        countryOptions[country] = info
          ? {key: country, searchString: JSON.stringify(info), name: info.name, region: info.region}
          : {key: country, searchString: country, name: country, region: 'unknown'}
      }
      return countryOptions[country]
    },
    [full.countryInfo]
  )
  const allCountries: countryOption[] = useMemo(
    () => Object.keys(full.levels.countries).map(makeCountryOption),
    [full.levels.countries]
  )
  const filteredCountries = useMemo(
    () => Object.keys(filter.countries).map(makeCountryOption),
    [allCountries, filter.countries]
  )

  const countryGroupSelected = useCallback(
    (group: string) => {
      const selected = filter.countries
      let checked = true
      allCountries.forEach(country => {
        if (checked && country.region === group) {
          checked = country.key in selected
        }
      })
      return checked
    },
    [full, filter.countries]
  )
  return (
    <Stack direction="row">
      <Autocomplete
        options={allCountries}
        groupBy={option => option.region}
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
                    const value = {...filter.countries}
                    allCountries.forEach(country => {
                      if (country.region === params.group) {
                        if (checked) {
                          value[country.key] = true
                        } else {
                          delete value[country.key]
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
              <Typography fontSize="small">
                {option.name + (option.name === option.key ? '' : ' (' + option.key + ')')}
              </Typography>
            </li>
          )
        }}
        getOptionLabel={option => option.key}
        renderInput={params => <TextField {...params} label="Countries" />}
        filterOptions={filterOptions}
        value={filteredCountries}
        renderValue={() => (
          <Typography sx={{p: 1, pt: 0, pb: 0, whiteSpace: 'nowrap'}}>
            {filteredCountries.length} / {allCountries.length}
          </Typography>
        )}
        multiple
        disableCloseOnSelect
        fullWidth
        size="small"
        onChange={(_, selection) => {
          const value: {[index: string]: boolean} = {}
          selection.forEach(country => (value[country.key] = true))
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
