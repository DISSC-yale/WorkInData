import {activityLabels, sexSummaries, variableInfo} from '../metadata'

export const globalVariables = {year: true, gdp: true, gdp_ppp: true, population: true}
export type LevelSpec = {
  variable: string
  level: string
  levelIndex?: number
  adjust: '' | '-' | '/'
  overall?: boolean
}
const defaultLevelSpec: LevelSpec = {variable: '', level: '', levelIndex: 0, adjust: '-'}
const patternSpecStart = /^\[/
const patternSpecEnd = /\)$/
const patternFirstLetter = /^(.)/

export class Variable {
  name = ''
  description = ''
  isGlobal = true
  index = 0

  base = 'year'
  percent = true
  log = true
  subset: LevelSpec = {...defaultLevelSpec}
  summary: LevelSpec = {...defaultLevelSpec}

  constructor(spec: Partial<Variable> | string, levels?: {[index: string]: string[]}) {
    if (typeof spec === 'string') {
      const baseParts = spec.replace(patternSpecStart, '').replace(patternSpecEnd, '').split(':')
      this.base = baseParts[0]
      this.percent = this.base[0] === '%'
      if (this.percent) this.base = this.base.replace('%', '')
      if (!(this.base in variableInfo)) this.base = 'year'
      this.isGlobal = this.base in globalVariables
      if (this.isGlobal) {
        this.percent = true
        this.log = baseParts.length > 1
      } else if (levels) {
        if (baseParts[1]) this.subset = this.parseLevel(baseParts[1], levels)
        if (baseParts[2]) this.summary = this.parseLevel(baseParts[2], levels)
      }
    } else {
      Object.keys(spec).forEach(k => {
        if (k in this) {
          if (k === 'subset' || k === 'summary') {
            this[k] = {...spec[k]} as LevelSpec
            if (levels) {
              this[k].levelIndex = levels[this[k].variable].indexOf(this[k].level)
              if (this[k].levelIndex === -1) this[k] = {...defaultLevelSpec}
            }
          } else {
            this[k as 'base'] = spec[k as 'base'] as string
          }
        }
      })
      this.isGlobal = this.base in globalVariables
    }
    this.updateName()
  }
  update({key, value}: {key: 'base'; value: string} | {key: 'percent' | 'log'; value: boolean}) {
    this[key as 'log'] = value as boolean
    if (key === 'base') {
      this.isGlobal = this.base in globalVariables
      if (this.isGlobal) {
        this.subset = {...defaultLevelSpec}
        this.summary = {...defaultLevelSpec}
      }
    }
    this.updateName()
  }
  updateLevel(
    which: 'subset' | 'summary',
    slot:
      | {key: 'remove'}
      | {key: 'variable' | 'level'; value: string; levels: string[]}
      | {key: 'adjust'; value: '' | '-' | '/'}
      | {key: 'overall'; value: boolean}
  ) {
    if (slot.key === 'remove') {
      this[which] = {...defaultLevelSpec}
    } else {
      const spec = this[which]
      spec[slot.key as 'level'] = slot.value as string
      if ('levels' in slot) {
        if (slot.key === 'variable') {
          spec.level = slot.levels[0]
          spec.levelIndex = 0
        } else {
          spec.levelIndex = slot.levels.indexOf(spec.level)
        }
      }
    }
    this.updateName()
  }
  parseLevel(part: string, allLevels: {[index: string]: string[]}) {
    const subsetParts = part.split('.')
    const adjust = subsetParts[0][0] === '!' ? '-' : subsetParts[0][0] === '|' ? '/' : ''
    const variable = adjust ? subsetParts[0].substring(1) : subsetParts[0]
    const levelIndex = +subsetParts[1].replace('t', '')
    const levels = allLevels[variable]
    return {
      variable,
      levelIndex,
      level: levelIndex >= levels.length ? '' : levels[levelIndex],
      adjust,
      overall: subsetParts[1].endsWith('t'),
    } as LevelSpec
  }
  baseFormula() {
    return this.isGlobal || !this.subset.variable ? 'd.' + this.base : `d.${this.base} * ${this.subsetFormula()}`
  }
  formula(baseRef: string) {
    if (this.base === 'year') return 'd.' + baseRef
    if (this.isGlobal) return this.log ? `log(d.${baseRef})` : 'd.' + baseRef
    return this.percent
      ? `d.${baseRef} / d.${baseRef}${this.summary.variable && !this.summary.overall ? '_summary' : ''}_sum * 100`
      : `sum(d.${baseRef})`
  }
  updateName() {
    let name = variableInfo[this.base].label_long || variableInfo[this.base].label
    if (this.isGlobal) {
      if (this.base != 'year' && this.log) name += ', log'
    } else if (this.subset.variable || this.summary.variable) {
      if (this.subset.variable) name = Variable.activityLabel(this.subset)
      const valueType =
        (this.percent ? (!this.summary.variable || !this.summary.overall ? '%' : ' overall %') : '') +
        (this.base === 'weight' ? '' : (this.percent ? ' ' : '') + this.base)
      if (this.summary.variable) {
        name +=
          ': ' +
          sexSummaries[(this.summary.level + this.summary.adjust) as 'Male'].label +
          (valueType ? ', ' + valueType : '')
      } else if (valueType) name += ', ' + valueType
    } else if (this.percent) {
      name += ', %'
    }
    this.name = name
    this.updateDescription()
  }
  updateDescription() {
    if (this.isGlobal) {
      this.description =
        (this.base === 'year' || !this.log ? '' : 'Log of ') +
        (variableInfo[this.base].label_long || variableInfo[this.base].label)
    } else {
      const peopleRef = [
        (this.summary.variable ? (this.summary.level === 'Male' ? 'men' : 'women') : 'people') + ` (${this.base})`,
      ]
      if (this.summary.variable && this.summary.adjust !== '') {
        peopleRef.push((peopleRef[0].includes('women') ? 'men' : 'women') + ` (${this.base})`)
      }
      const subsetRef = this.subset.variable
        ? this.subset.level === 'Unemployed'
          ? this.subset.adjust === '-'
            ? 'employed or not looking for work'
            : 'unemployed and looking for work'
          : this.subset.level === 'Out of Workforce'
          ? this.subset.adjust === '-'
            ? 'employed or looking for work'
            : 'not employed or looking for work'
          : ` ${this.subset.adjust === '-' ? 'not ' : ''}employed in ` + this.subset.level
        : ''
      this.description =
        peopleRef
          .map(p =>
            this.summary.overall
              ? (this.percent ? `percent of people (${this.base})` : '') +
                (subsetRef ? ' ' + subsetRef.toLowerCase() : '') +
                (this.percent ? ' and are ' : '') +
                p
              : (this.percent ? 'percent of ' : '') + p + (subsetRef ? ' ' + subsetRef.toLowerCase() : '')
          )
          .join(this.summary.adjust === '-' ? ' minus ' : this.summary.adjust === '/' ? ' divided by ' : '')
          .replace(patternFirstLetter, l => l.toUpperCase()) + '.'
    }
  }
  levelToString(which: 'subset' | 'summary') {
    const spec = this[which]
    return spec && spec.variable
      ? `${spec.adjust ? (spec.adjust === '-' ? '!' : '|') : ''}${spec.variable}.${spec.levelIndex}${
          spec.overall ? 't' : ''
        }`
      : ''
  }
  toString() {
    return `${!this.isGlobal && this.percent ? '%' : ''}${this.base}${
      this.base === 'year'
        ? ''
        : this.isGlobal
        ? this.log
          ? ':log'
          : ''
        : ':' + this.levelToString('subset') + ':' + this.levelToString('summary')
    }`
  }
  subsetFormula() {
    return `(d.${this.subset.variable}${this.subset.adjust === '-' ? '!==' : '==='}"${this.subset.level}")`
  }
  summaryFormula(base: string) {
    return this.summary.adjust === '-'
      ? `d.${base} * ((d.${this.summary.variable}==="${this.summary.level}") + -1 * (d.${this.summary.variable}!=="${this.summary.level}"))`
      : `d.${base} * (d.${this.summary.variable}==="${this.summary.level}")`
  }
  offLevelFormula(base: string) {
    return `sum(d.${base} * (d.${this.summary.variable}!=="${this.summary.level}"))`
  }
  copy() {
    return new Variable(this)
  }
  static activityLabel(spec: LevelSpec) {
    return spec.adjust === '-'
      ? spec.level && spec.level === 'Out of Workforce'
        ? 'Labor Force Participation'
        : 'Not ' + activityLabels[spec.level as 'Industry']
      : activityLabels[spec.level as 'Industry'] + (spec.adjust === '/' ? ' Proportion' : '')
  }
}
