import {Close, InfoOutline} from '@mui/icons-material'
import {
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import {useContext, useState} from 'react'
import {FilterContext, ViewContext, ViewDef, type FilterDef} from '../data/view'
import {variableInfo} from '../metadata'
import type {Variable} from '../data/variable'

function InfoCard({variable, view, filter}: {variable: Variable; view: ViewDef; filter: FilterDef}) {
  const info = variableInfo[variable.base]
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {variable.name}
        </Typography>
        <Table sx={{'& .MuiTypography-root': {fontSize: '.95em'}, '& td': {alignContent: 'start'}}} size="small">
          <TableBody>
            <TableRow>
              <TableCell>
                <Typography>Basis:</Typography>
              </TableCell>
              <TableCell>
                <Typography>{info.fullName}</Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography>Description:</Typography>
              </TableCell>
              <TableCell>
                <Typography>{variable.description}</Typography>
              </TableCell>
            </TableRow>
            {info.source ? (
              <TableRow>
                <TableCell>
                  <Typography>Source:</Typography>
                </TableCell>
                <TableCell>
                  <Typography>
                    <Link href={info.source_url} rel="noreferrer" target="_blank">
                      {info.source}
                    </Link>
                  </Typography>
                </TableCell>
              </TableRow>
            ) : variable.percent ? (
              <TableRow>
                <TableCell>
                  <Typography whiteSpace="nowrap">Percent Total:</Typography>
                </TableCell>
                <TableCell>
                  <Typography>
                    {(view.within_split && variable.subset.variable ? 'Within split' : 'Across splits') +
                      (variable.summary
                        ? ', ' +
                          (variable.summary.overall
                            ? 'all participants'
                            : `within ${
                                variable.summary.variable === 'sex' ? 'gender' : variable.summary.variable
                              } level`)
                        : '') +
                      ', including these activities: ' +
                      filter.sectors.join(', ')}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              <></>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export function InfoDisplay() {
  const view = useContext(ViewContext) as ViewDef
  const filter = useContext(FilterContext) as FilterDef
  const [open, setOpen] = useState(false)
  const close = () => setOpen(!open)
  return (
    <>
      <IconButton color="inherit" onClick={close} aria-label="more information about the current variables">
        <InfoOutline />
      </IconButton>
      {open && (
        <Dialog open={open} onClose={close} hideBackdrop>
          <DialogTitle>Variable Details</DialogTitle>
          <IconButton
            aria-label="close variable details"
            onClick={close}
            sx={{
              position: 'absolute',
              right: 8,
              top: 12,
            }}
          >
            <Close />
          </IconButton>
          <DialogContent sx={{width: 500, maxWidth: '100%', p: 0}}>
            <Stack>
              <InfoCard variable={view.y} view={view} filter={filter} />
              {view.as_plot && <InfoCard variable={view.x} view={view} filter={filter} />}
            </Stack>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
