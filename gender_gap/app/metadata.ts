export const variableInfo: {
  [index: string]: {label: string; label_long?: string; fullName?: string; source?: string; source_url?: string}
} = {
  country: {label: 'Country'},
  year: {label: 'Year', fullName: 'Year the survey was conducted.'},
  count: {label: 'Participant Count', fullName: 'Number of survey participants within segments.'},
  weight: {label: 'Weight Sum', fullName: 'Sum of survey weights within segments.'},
  gdp: {
    label: 'GDP per capita (current US$)',
    fullName: 'Gross Domestic Product Per Capita (in current US$)',
    source: 'World Bank',
    source_url: 'https://data.worldbank.org/indicator/SP.POP.TOTL',
  },
  gdp_ppp: {
    label: 'GDP per capita (PPP, current international $)',
    label_long: 'GDP per capita (purchasing power parity, current international $)',
    fullName: 'Gross Domestic Product Per Capita (Purchasing Power Parity, current international $)',
    source: 'World Bank',
    source_url: 'https://data.worldbank.org/indicator/NY.GDP.MKTP.PP.CD',
  },
  population: {
    label: 'Total Population',
    fullName: 'Total Population (World Bank)',
    source: 'World Bank',
    source_url: 'https://data.worldbank.org/indicator/NY.GDP.PCAP.CD',
  },
  main_activity: {label: 'Main Activity'},
  sex: {label: 'Gender'},
  age: {label: 'Age'},
  children_under_5: {label: 'Children Under 5'},
  education: {label: 'Education'},
  marital_status: {label: 'Marital Status'},
  rural: {label: 'Rural / Urban'},
}

export const activityLabels = {
  Agriculture: 'Agriculture',
  Industry: 'Industry',
  Services: 'Services',
  Unemployed: 'Unemployed',
  'Out of Workforce': 'Out of Labor Force',
  '0,1,3': 'Employed',
  '0,1,3,4': 'In Labor Force',
}
export const selectableVariables = ['country', 'year', 'main_activity', 'sex']
export const sexSummaries = {
  'Male-': {label: 'Gap (Male - Female)', level: 'Male', adjust: '-'},
  'Female-': {label: 'Gap (Female - Male)', level: 'Female', adjust: '-'},
  'Female/': {label: 'Ratio (Female / Male)', level: 'Female', adjust: '/'},
  'Male/': {label: 'Ratio (Male / Female)', level: 'Male', adjust: '/'},
  Female: {label: 'Share of women', level: 'Female', adjust: ''},
  Male: {label: 'Share of men', level: 'Male', adjust: ''},
}
