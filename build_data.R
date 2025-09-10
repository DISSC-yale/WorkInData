library(WorkInData)

# rebuild dataset
subset <- readxl::read_excel("../gender_gap_paper_variable_survey_info.xlsx", 2)
selection <- do.call(paste, c(as.list(subset), sep = "_"))
wid_reformat("../data_cleaned", "../gender_growth_gap", selection)

# gender gap site resources
out_dir <- "gender_gap/public/"

## aggregate dataset
subset_usability <- readxl::read_excel(
  "../EGC - Gender & Growth Gaps - HWLFS Data Sharing Agreements.xlsx",
  6
)[, c("Country", "Year", "Survey")]
agg <- wid_aggregate(
  "../gender_growth_gap",
  age > 15,
  age < 66,
  selection = subset_usability
)
vroom::vroom_write(agg, "../wid_gender_growth_gap_agg.csv.xz", ",")
jsonlite::write_json(
  agg,
  gzfile(paste0(out_dir, "data.json.gz")),
  dataframe = "columns"
)

### prepare test data
jsonlite::write_json(
  with(
    agg[agg$country == "MEX" & agg$year == 2018 & agg$variable == "total", ],
    as.list(structure(count, names = paste(sex, main_activity, sep = ".")))
  ),
  paste0(out_dir, "../cypress/fixtures/data.json"),
  auto_unbox = TRUE
)

## prepare external data

### country-level data
gdp <- wid_update_world_bank("../resources")
gdp <- gdp[, c(
  "iso3c",
  "year",
  "gdp_per_capita_us",
  "gdp_per_capita_const",
  "population"
)]
colnames(gdp) <- c("country", "year", "gdp", "gdp_ppp", "population")
gdp <- gdp[gdp$country %in% agg$country, ]
jsonlite::write_json(
  gdp,
  gzfile(paste0(out_dir, "world_bank.json.gz")),
  dataframe = "columns"
)

### country map
country_info_file <- paste0("../CLASS.xlsx")
if (!file.exists(country_info_file)) {
  download.file(
    "https://datacatalogfiles.worldbank.org/ddh-published/0037712/DR0090755/CLASS.xlsx",
    country_info_file,
    mode = "wb"
  )
}
country_info <- readxl::read_excel(country_info_file)
country_info <- country_info[, c(
  "Code",
  "Economy",
  "Region",
  "Income group"
)]
colnames(country_info) <- c("ISO_A3", "name", "region", "income")

map <- wid_update_country_map("../resources")
map <- map[map$ISO_A3 %in% country_info$ISO_A3, "ISO_A3"]
map <- merge(map, country_info)

countries <- unique(gdp$country[order(gdp$gdp)])
palette <- structure(
  scico::scico(length(countries), palette = "roma", end = .95, direction = -1),
  names = countries
)
region <- sort(unique(map$region))
region_color <- structure(
  scico::scico(length(region), palette = "roma", end = .95),
  names = region
)
income <- sort(unique(map$income))
income_color <- structure(
  scico::scico(length(income), palette = "roma", end = .95),
  names = income
)

map$color <- palette[map$ISO_A3]
map$color[is.na(map$color)] <- "#9c9c9c"
map$income_color <- income_color[map$income]
map$income_color[is.na(map$income_color)] <- "#9c9c9c"
map$region_color <- region_color[map$region]
map$region_color[is.na(map$region_color)] <- "#9c9c9c"

unlink(paste0(out_dir, "countries.geojson"))
sf::st_write(map, paste0(out_dir, "countries.geojson"))
