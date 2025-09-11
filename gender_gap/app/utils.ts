import type {ColumnTable} from 'arquero'
import type {Variable} from './data/variable'
import type {LineSeriesOption} from 'echarts'

const formatter = Intl.NumberFormat().format
export function formatNumber(x: number, variable?: Variable): string | number {
  if (variable) {
    if (variable.base === 'year') return x
    if (variable.isGlobal && variable.log) return `${formatNumber(Math.round(Math.E ** x))} (${formatNumber(x)})`
  }
  return x % 1 === 0 ? formatter(x) : Math.abs(x) > 1e3 ? formatter(+x.toFixed(2)) : x.toFixed(2)
}

export function unique(d: ColumnTable, variable: string) {
  return [...new Set(d.array(variable))].sort()
}

export function tooltipPlacer(pos: number[], params: LineSeriesOption, dom: HTMLElement) {
  const tooltipRect = dom.getBoundingClientRect()
  const halfSize = tooltipRect.width / 2
  const setPosition = {
    top: pos[1] - (pos[1] < window.innerHeight / 2 ? -20 : tooltipRect.height + 20),
    left: pos[0] - (pos[0] > halfSize ? (window.innerWidth - pos[0] > halfSize ? halfSize : halfSize * 2) : -20),
  }
  return setPosition
}
