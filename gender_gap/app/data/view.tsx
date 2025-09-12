import {type ActionDispatch, createContext, useContext, useMemo, useReducer, useState} from 'react'
import {Variable} from './variable'
import {DataContext, Resources} from './load'
import {ColumnTable} from 'arquero'

export type Variants = 'raw' | 'log' | 'percent' | 'gap' | 'lfp' | 'lfp_gap'
export type TimeAgg = 'all' | 'first' | 'specified' | 'last' | 'mean'
export type ViewDef = {
  as_plot: boolean
  lock_range: boolean
  x: Variable
  y: Variable
  color: string
  symbol: string
  x_panels: string
  y_panels: string
  time_agg: TimeAgg
  select_year: string
  country_center: boolean
  color_source: 'gdp' | 'region' | 'income'
  advanced: boolean
  regression: 'none' | 'linear' | 'exponential' | 'logarithmic' | 'polynomial'
}

export type FilterDef = {
  demo_seg: string
  countries: {[index: string]: boolean}
  sectors: string[]
  sexes: string[]
  min_year: string
  max_year: string
}

export type ViewAction =
  | {key: 'reset'}
  | {key: 'replace'; view: ViewDef}
  | {key: 'x' | 'y'; value: Variable}
  | {
      key: 'color' | 'symbol' | 'x_panels' | 'y_panels' | 'select_year'
      value: string
    }
  | {key: 'time_agg'; value: TimeAgg}
  | {key: 'color_source'; value: 'gdp' | 'region' | 'level'}
  | {key: 'as_plot' | 'lock_range' | 'country_center' | 'advanced'; value: boolean}
  | {key: 'regression'; value: 'none' | 'linear' | 'exponential' | 'logarithmic' | 'polynomial'}
export type FilterAction =
  | {key: 'reset'}
  | {key: 'replace'; filter: URLParams}
  | {key: 'demo_seg' | 'min_year' | 'max_year'; value: string}
  | {key: 'countries'; value: {[index: string]: boolean}}
  | {key: 'sectors' | 'sexes'; value: string[]}
const defaultView: ViewDef = {
  as_plot: true,
  lock_range: true,
  x: new Variable({base: 'gdp', log: true, index: 2}),
  y: new Variable({
    base: 'weight',
    percent: true,
    subset: {variable: 'main_activity', level: 'Agriculture', levelIndex: 0, adjust: ''},
    summary: {variable: 'sex', level: 'Male', levelIndex: 1, adjust: '-'},
    index: 6,
  }),
  color: 'country',
  symbol: '',
  x_panels: '',
  y_panels: '',
  time_agg: 'last',
  select_year: '2018',
  country_center: false,
  color_source: 'region',
  advanced: false,
  regression: 'polynomial',
}
const defaultXY = {x: defaultView.x.toString(), y: defaultView.y.toString()}
const binaryParams = {as_plot: true, lock_range: true, country_center: true, advanced: true}

export type URLParams = ViewDef & {
  demo_seg?: string
  countries?: string
  sectors?: string
  sexes?: string
  min_year?: string
  max_year?: string
  time_agg?: TimeAgg
  select_year?: string
}
const defaultParams: URLParams = {
  ...{...defaultView},
  countries: '',
  sectors: 'Agriculture,Industry,Out of Workforce,Services,Unemployed',
  sexes: 'Female,Male',
  demo_seg: 'total',
  min_year: '1998',
  max_year: '2018',
}
export function urlParamsToString(params: URLParams) {
  const p: string[] = []
  Object.keys(params).forEach(v => {
    if (v === 'x' || v === 'y') {
      const value = params[v].toString()
      if (value !== defaultXY[v]) {
        p.push(v + '=' + value)
      }
    } else {
      const value = params[v as 'color']
      if (value !== defaultParams[v as 'color']) {
        p.push(v + '=' + value)
      }
    }
  })
  return '?' + p.join('&')
}
const updateUrlParams = (params: URLParams) => {
  requestAnimationFrame(() => window.history.replaceState(void 0, '', urlParamsToString(params)))
}

export const ViewActionContext = createContext<ActionDispatch<[action: ViewAction]>>(() => {})
export const ViewContext = createContext<ViewDef | null>(null)
export const FilterActionContext = createContext<ActionDispatch<[action: FilterAction]>>(() => {})
export const FilterContext = createContext<FilterDef | null>(null)
export const FilteredContext = createContext(new ColumnTable({}))
export const VariableSpecContext = createContext<Variable[]>([])

export const splitComponents = ['x_panels', 'y_panels', 'symbol', 'color']

const yearSelectors = {
  first: 'd.year === min(d.year)',
  last: 'd.year === max(d.year)',
}

export function DataView({children}: Readonly<{children?: React.ReactNode}>) {
  const full = useContext(DataContext) as Resources

  const [variableSpecs, setVariableSpecs] = useState<Variable[]>(
    (
      [
        {base: 'year'},
        {base: 'population', log: false},
        {base: 'gdp', log: true},
        {base: 'gdp_ppp', log: true},
        {base: 'weight', percent: true},
        {
          base: 'weight',
          percent: true,
          subset: {variable: 'main_activity', level: 'Agriculture', adjust: ''},
        },
        {
          base: 'weight',
          percent: true,
          subset: {variable: 'main_activity', level: 'Agriculture', adjust: ''},
          summary: {variable: 'sex', level: 'Female', adjust: '-'},
        },
      ] as Partial<Variable>[]
    ).map((s, i) => {
      s.index = i
      return new Variable(s, full.variableLevels)
    })
  )

  const urlParams = useMemo(() => {
    const params = {...defaultParams}
    const search = window.location.search
    if (search) {
      search
        .substring(1)
        .split('&')
        .forEach(a => {
          const parts = a.split('=')
          const e = parts[0] as keyof URLParams
          if (e in params) {
            if (e in binaryParams) {
              params[e as 'as_plot'] = parts.length === 1 || parts[1] === 'true'
            } else if ('x' === e || 'y' === e) {
              const spec = new Variable(parts[1], full.variableLevels)
              spec.index = variableSpecs.findIndex(s => s.name === spec.name)
              if (spec.index === -1) {
                spec.index = variableSpecs.length
                setVariableSpecs([...variableSpecs, spec])
              }
              params[e] = spec
            } else {
              params[e as 'color'] = parts[1]
            }
          }
        })
    }
    return params
  }, [full.variableLevels, variableSpecs])
  const editView = (state: ViewDef, action: ViewAction) => {
    if (action.key === 'reset') {
      const newState = {
        ...defaultParams,
        ...urlParams,
        x: defaultParams.x.copy(),
        y: defaultParams.y.copy(),
        as_plot: state.as_plot,
        advanced: state.advanced,
      }
      updateUrlParams(newState)
      return newState
    }
    if (action.key === 'replace') {
      updateUrlParams({...defaultParams, ...urlParams, ...action.view})
      return {...action.view}
    }
    const newState = {...urlParams, ...state, [action.key]: action.value}
    if (variableSpecs.findIndex(s => s.name === newState.x.name) === -1) {
      setVariableSpecs([...variableSpecs, newState.x])
    }
    if (variableSpecs.findIndex(s => s.name === newState.y.name) === -1) {
      setVariableSpecs([...variableSpecs, newState.y])
    }
    updateUrlParams(newState)
    return newState
  }
  const urlParamsToFilter = (urlParams: URLParams) => {
    return {
      demo_seg: urlParams.demo_seg || defaultParams.demo_seg,
      min_year: urlParams.min_year || defaultParams.min_year,
      max_year: urlParams.max_year || defaultParams.max_year,
      countries: (() => {
        if (urlParams.countries) {
          const selectCountries: {[index: string]: boolean} = {}
          urlParams.countries.split(',').forEach(c => (selectCountries[c] = true))
          return selectCountries
        } else {
          return {...full.levels.countries}
        }
      })(),
      sectors: (() => {
        if (urlParams.sectors) {
          return urlParams.sectors
            .replaceAll('%20', ' ')
            .split(',')
            .filter(x => full.levels.sectors.includes(x))
        } else {
          return [...full.levels.sectors]
        }
      })(),
      sexes: (() => {
        if (urlParams.sexes) {
          return urlParams.sexes
            .replaceAll('%20', ' ')
            .split(',')
            .filter(x => full.levels.sexes.includes(x))
        } else {
          return [...full.levels.sexes]
        }
      })(),
    } as FilterDef
  }
  const editFilter = (state: FilterDef, action: FilterAction) => {
    if (action.key === 'reset') {
      return {
        demo_seg: 'total',
        min_year: full.levels.baseYearRange[0],
        max_year: full.levels.baseYearRange[1],
        countries: {...full.levels.countries},
        sectors: [...full.levels.sectors],
        sexes: [...full.levels.sexes],
      } as FilterDef
    }
    if (action.key === 'replace') {
      updateUrlParams({...view, ...action.filter})
      return urlParamsToFilter(action.filter)
    }
    if (action.key === 'countries') {
      urlParams.countries = Object.keys(action.value).length < 10 ? Object.keys(action.value).join(',') : ''
      updateUrlParams({...view, countries: urlParams.countries})
    } else if (action.key === 'sectors' || action.key === 'sexes') {
      urlParams[action.key] = action.value.sort().join(',')
      updateUrlParams({...view, [action.key]: urlParams[action.key]})
    } else {
      urlParams[action.key as 'color'] = action.value as string
      updateUrlParams({...view, [action.key]: urlParams[action.key]})
    }
    return {...state, [action.key]: action.value} as FilterDef
  }
  const [view, viewAction] = useReducer(
    editView,
    (() => {
      const initial = {...defaultView, x: defaultView.x.copy(), y: defaultView.y.copy()}
      Object.keys(urlParams).forEach(k => {
        if (k in initial) initial[k as 'color'] = urlParams[k as 'color']
      })
      return initial
    })()
  )
  const [filter, filterAction] = useReducer(editFilter, urlParamsToFilter(urlParams))

  const variable = useMemo(() => {
    const v = ['', 'total']
    splitComponents.forEach(component => {
      const componentValue = view[component as 'color']
      if (componentValue in full.levels.demo_segments) {
        v[0] = component
        v[1] = componentValue
      }
    })
    return v
  }, [view, full.levels.demo_segments])
  const subset = useMemo(() => {
    return full.data.filter(`d.variable === "${variable[1]}"`)
  }, [variable, full.data])

  const filtered = useMemo(() => {
    const selectSectors: {[index: string]: boolean} = {}
    filter.sectors.forEach(s => (selectSectors[s] = true))
    const selectSexes: {[index: string]: boolean} = {}
    filter.sexes.forEach(s => (selectSexes[s] = true))
    const filtered = subset
      .params({c: filter.countries, s: selectSexes, a: selectSectors})
      .filter('(d, p) => d.country in p.c && d.sex in p.s && d.main_activity in p.a')
      .filter(
        view.time_agg === 'specified'
          ? 'd.year === ' + (view.select_year || 0)
          : `d.year >= ${filter.min_year} && d.year <= ${filter.max_year}`
      )
    return view.time_agg in yearSelectors
      ? filtered.groupby('country').filter(yearSelectors[view.time_agg as 'first'])
      : filtered
  }, [subset, filter, view.time_agg, view.select_year])

  return (
    <ViewActionContext.Provider value={viewAction}>
      <ViewContext.Provider value={view}>
        <FilterActionContext.Provider value={filterAction}>
          <FilterContext.Provider value={filter}>
            <FilteredContext.Provider value={filtered}>
              <VariableSpecContext value={variableSpecs}>{children}</VariableSpecContext>
            </FilteredContext.Provider>
          </FilterContext.Provider>
        </FilterActionContext.Provider>
      </ViewContext.Provider>
    </ViewActionContext.Provider>
  )
}
