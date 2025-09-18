import {Close} from '@mui/icons-material'
import {Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Link, Typography} from '@mui/material'
import {DataGrid, type GridRenderCellParams} from '@mui/x-data-grid'
import type {ColumnTable} from 'arquero'
import {useState} from 'react'
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

export function Sources({sources, inText}: {sources: ColumnTable; inText?: boolean}) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(!open)
  return (
    <>
      {inText ? (
        <Link onClick={close} sx={{display: 'inline', cursor: 'pointer'}} component="a">
          sources
        </Link>
      ) : (
        <Button color="inherit" onClick={close} variant="outlined" size="small">
          <Typography>sources</Typography>
        </Button>
      )}
      {open && (
        <Dialog open={open} onClose={close} fullScreen>
          <DialogTitle>Data Sources</DialogTitle>
          <IconButton
            aria-label="close export menu"
            onClick={close}
            sx={{
              position: 'absolute',
              right: 8,
              top: 12,
            }}
          >
            <Close />
          </IconButton>
          <DialogContent>
            <Box sx={{height: '100%', overflow: 'hidden'}}>
              <DataGrid
                className="bottom-search datagrid-vertical"
                rows={(sources.objects() as MetadataRow[]).map((row, i) => {
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
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
