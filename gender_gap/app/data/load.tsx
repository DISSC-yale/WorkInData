'use client'

import {ColumnTable, loadJSON, not} from 'arquero'
import type {GeoJSON} from 'echarts/types/src/coord/geo/geoTypes.js'
import {createContext, useEffect, useState} from 'react'
import {selectableVariables} from '../metadata'
import {unique} from '../utils'
import {Backdrop, LinearProgress, Stack, Typography} from '@mui/material'

export type Info = {[index: string]: {[index: string]: string}}
type Metadata = {updated: string; md5: string; sources: ColumnTable}
export type Resources = {
  meta: Metadata
  data: ColumnTable
  map: GeoJSON
  countryInfo: Info
  variableLevels: {[index: string]: string[]}
  levels: Levels
}
export type Levels = {
  countries: {[index: string]: boolean}
  demo_segments: {[index: string]: boolean}
  years: number[]
  sectors: string[]
  sexes: string[]
  baseYearRange: string[]
  selectable: string[]
}
export const DataContext = createContext<Resources | null>(null)
const prefix = '/WorkInData/gender_gap/'

export function Data({children}: Readonly<{children?: React.ReactNode}>) {
  const [meta, setMeta] = useState<Metadata | null>(null)
  const [genderGrowthGap, setGenderGrowthGap] = useState<ColumnTable | null>(null)
  const [worldBank, setWorldBank] = useState<ColumnTable | null>(null)
  const [map, setMap] = useState<GeoJSON | null>(null)
  useEffect(() => {
    loadJSON(prefix + 'data.json.gz').then(res => setGenderGrowthGap(res))
    loadJSON(prefix + 'world_bank.json.gz').then(res => setWorldBank(res))
    fetch(prefix + 'countries.geojson').then(async res => setMap(await res.json()))
    fetch(prefix + 'metadata.json.gz').then(async res => {
      const blob = await res.blob()
      const metadata = await new Response(await blob.stream().pipeThrough(new DecompressionStream('gzip'))).json()
      metadata.sources = new ColumnTable(metadata.sources)
      setMeta(metadata)
    })
  }, [])
  if (genderGrowthGap && worldBank && meta && map) {
    const countryInfo: Info = {}
    map.features.forEach(f => (countryInfo[f.properties.ISO_A3] = f.properties))
    const baseData = genderGrowthGap
      .derive({country_year: 'd.country + d.year'})
      .join(worldBank.derive({country_year: 'd.country + d.year'}).select(not('country', 'year')), 'country_year')
    const data = baseData.select(not('country_year'))
    const variableLevels: {[index: string]: string[]} = {none: [], '': []}
    data.columnNames().forEach(v => {
      if ('string' === typeof data.get(v, 0)) {
        variableLevels[v] = [...new Set(data.array(v))].sort()
      }
    })
    const levels = (() => {
      const countries: {[index: string]: boolean} = {}
      const values = [...new Set(data.array('country'))]
      values.forEach(country => {
        if (!(country in countryInfo))
          countryInfo[country] = {name: country, region: country == 'MLT' ? 'Europe & Central Asia' : 'Unknown'}
      })
      values
        .sort((a, b) => {
          const a_info = countryInfo[a]
          const b_info = countryInfo[b]
          return a_info.region + a_info.name > b_info.region + b_info.name ? 1 : -1
        })
        .forEach(country => (countries[country] = true))
      const demo_segments: {[index: string]: boolean} = {}
      ;[...new Set(data.array('variable'))]
        .filter(l => l !== 'total')
        .sort()
        .forEach(l => (demo_segments[l] = true))
      const years = unique(data, 'year') as number[]
      return {
        countries,
        demo_segments,
        years,
        sectors: unique(data, 'main_activity'),
        sexes: unique(data, 'sex'),
        baseYearRange: ['' + Math.min(...years), '' + Math.max(...years)],
        selectable: [...selectableVariables, ...Object.keys(demo_segments)],
      }
    })()
    const full = {meta, data, map, countryInfo, variableLevels, levels}
    return <DataContext.Provider value={full}>{children}</DataContext.Provider>
  }
  return (
    <Backdrop open={true}>
      <Stack sx={{margin: 'auto', marginTop: 10, maxWidth: 350}}>
        <Typography variant="h5">Loading Data...</Typography>
        <LinearProgress />
      </Stack>
    </Backdrop>
  )
}
