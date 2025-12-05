'use client'

import {Box, Link, Typography} from '@mui/material'
import {DataGrid, type GridRenderCellParams} from '@mui/x-data-grid'
import {useContext} from 'react'
import {DataContext, type Resources} from '../data/load'

type MetadataRow = {
  id: number
  country: string
  year: number
  survey: string
  survey_link: string
  survey_name: string
}
const cols = [
  {field: 'country', headerName: 'Country'},
  {field: 'year', headerName: 'Year'},
  {
    field: 'survey',
    headerName: 'Survey',
    width: 500,
    renderCell: (params: GridRenderCellParams<MetadataRow>) => {
      const row = params.row
      const label = row.survey_name ? row.survey_name + ` (${row.survey})` : row.survey
      return row.survey_link && row.survey_link.startsWith('http') ? (
        <Link target="_blank" rel="noreferrer" href={row.survey_link}>
          {label}
        </Link>
      ) : (
        label
      )
    },
  },
  {field: 'survey_name', headerName: 'Name'},
  {field: 'survey_link', headerName: 'Link'},
  {field: 'country_year_present', headerName: 'Country-Year Included', width: 200},
  {field: 'sector_presence', headerName: 'Percent Sector Present', width: 200},
]

export default function Sources() {
  const {meta} = useContext(DataContext) as Resources
  return (
    <Box component="main" sx={{position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, maxWidth: '100%'}}>
      <DataGrid
        sx={{'& .MuiDataGrid-toolbar': {flexDirection: 'row-reverse'}}}
        rows={(meta.sources.objects() as MetadataRow[]).map((row, i) => {
          row.id = i
          return row
        })}
        columns={cols}
        disableRowSelectionOnClick
        disableDensitySelector
        disableColumnMenu
        showToolbar
        disableColumnFilter
        disableColumnSelector
        pageSizeOptions={[100]}
        density="compact"
        slotProps={{
          toolbar: {
            printOptions: {disableToolbarButton: true},
            csvOptions: {allColumns: true, fileName: 'wid_gender_gap_sources'},
          },
        }}
        initialState={{
          columns: {
            columnVisibilityModel: {
              survey_name: false,
              survey_link: false,
            },
          },
          filter: {
            filterModel: {
              items: [],
              quickFilterExcludeHiddenColumns: false,
            },
          },
        }}
      />
      <Typography
        variant="h6"
        sx={{
          position: 'fixed',
          top: 10,
          left: 10,
          right: 320,
          whiteSpace: 'nowrap',
        }}
      >
        Source Surveys
      </Typography>
    </Box>
  )
}
