import {Close, Download} from '@mui/icons-material'
import {
  Autocomplete,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
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
  TextField,
  Typography,
} from '@mui/material'
import {ColumnTable} from 'arquero'
import {useContext, useMemo, useState} from 'react'
import {DataContext, Resources} from '../data/load'
import {FilteredContext, ViewContext, ViewDef} from '../data/view'

function makePartialName(filtered: ColumnTable, view: ViewDef, version: string) {
  return `wid_ggg_${version}${
    view.time_agg === 'all' ? '' : '_' + (view.time_agg === 'specified' ? view.select_year : view.time_agg + '-time')
  }_${filtered.get('variable', 0)}_${filtered.numRows()}`
}
export function Export() {
  const full = useContext(DataContext) as Resources
  const view = useContext(ViewContext) as ViewDef
  const filtered = useContext(FilteredContext)

  const [open, setOpen] = useState(false)
  const [fullExport, setFullExport] = useState(false)
  const [delimiter, setDelimiter] = useState(',')
  const allColumns = useMemo(() => full.data.columnNames(), [full.data])
  const [columns, setColumns] = useState(allColumns)
  const [filename, setFilename] = useState('')
  const defaultNames = useMemo(() => {
    const partial = makePartialName(filtered, view, full.meta.updated)
    setFilename(partial)
    setColumns(allColumns.filter(col => (view.time_agg === 'mean' ? col !== 'year' : true)))
    return {
      partial,
      full: `wid_ggg_${full.meta.updated}${
        view.time_agg === 'all'
          ? ''
          : '_' + (view.time_agg === 'specified' ? view.select_year : view.time_agg + '-time')
      }`,
    }
  }, [filtered, view, allColumns, full.meta.updated])
  const close = () => setOpen(!open)
  const data = fullExport ? full.data : filtered
  return (
    <>
      <Button color="inherit" onClick={close} startIcon={<Download />}>
        Export
      </Button>
      {open && (
        <Dialog open={open} onClose={close} hideBackdrop>
          <DialogTitle>Data Export</DialogTitle>
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
          <DialogContent sx={{width: 500, maxWidth: '100%'}}>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1}>
                <TextField
                  fullWidth
                  size="small"
                  label="Filename"
                  value={filename}
                  onChange={e => setFilename(e.target.value)}
                >
                  {filename}
                </TextField>
                <FormControl sx={{width: 110}} variant="outlined" fullWidth size="small">
                  <InputLabel id="separator_select">Type</InputLabel>
                  <Select
                    labelId="separator_select"
                    label="Type"
                    value={delimiter}
                    onChange={e => setDelimiter(e.target.value)}
                  >
                    <MenuItem value=",">CSV</MenuItem>
                    <MenuItem value="\t">TSV</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
              <Autocomplete
                options={allColumns}
                sx={{'& li': {p: 0}}}
                renderOption={(props, option, {selected}) => {
                  const {key, ...optionProps} = props
                  return (
                    <MenuItem key={key} disabled={view.time_agg === 'mean' && option === 'year'} {...optionProps}>
                      <Checkbox checked={selected} />
                      {option}
                    </MenuItem>
                  )
                }}
                renderInput={params => <TextField {...params} label="Columns" />}
                value={columns}
                renderValue={() => <Typography sx={{p: 1, pt: 0, pb: 0}}>Selected: {columns.length}</Typography>}
                multiple
                disableCloseOnSelect
                fullWidth
                size="small"
                onChange={(_, selection) => setColumns(selection)}
              ></Autocomplete>
              <FormControlLabel
                sx={{float: 'right'}}
                label="Full Dataset"
                labelPlacement="start"
                control={
                  <Switch
                    checked={fullExport}
                    onChange={() => {
                      if (filename === defaultNames[fullExport ? 'full' : 'partial']) {
                        defaultNames.partial = makePartialName(filtered, view, full.meta.updated)
                        setFilename(defaultNames[fullExport ? 'partial' : 'full'])
                      }
                      setFullExport(!fullExport)
                    }}
                  />
                }
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{justifyContent: 'right'}}>
            <Typography>
              {delimiter === ',' ? 'CSV' : 'TSV'} file with {data.numRows()} rows
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                const e = document.createElement('a')
                document.body.appendChild(e)
                e.rel = 'noreferrer'
                e.target = '_blank'
                e.download = filename + (delimiter === ',' ? '.csv' : '.tsv')
                e.href = URL.createObjectURL(
                  new Blob([data.toCSV({delimiter, columns})], {type: 'text/csv; charset=utf-8'})
                )
                setTimeout(function () {
                  e.dispatchEvent(new MouseEvent('click'))
                  URL.revokeObjectURL.bind(null, e.href)
                  document.body.removeChild(e)
                }, 0)
              }}
            >
              Download
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  )
}
