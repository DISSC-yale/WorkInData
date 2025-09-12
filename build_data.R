library(WorkInData)

# rebuild dataset
validated <- vroom::vroom("../validated_surveys.csv")
selection <- do.call(
  paste,
  c(as.list(validated[, c("country", "year", "survey")]), sep = "_")
)
wid_reformat("../data_cleaned", "../gender_growth_gap", selection)

# gender gap site resources
out_dir <- "gender_gap/public/"

## aggregate dataset
publishable <- vroom::vroom("../publishable_surveys.csv")
publishable <- publishable[!is.na(publishable[[1L]]), ]
publishable$publishable <- tolower(publishable$`Useable for portal?`) == "yes"
publishable <- publishable[, c(
  "Country",
  "Year",
  "Survey",
  "publishable",
  "Survey Name",
  "Data sharing agreement - link"
)]
colnames(publishable) <- c(
  "country",
  "year",
  "survey",
  "publishable",
  "survey_name",
  "survey_link"
)
subset_usability <- publishable[
  publishable$publishable,
  c("country", "year", "survey")
]
agg <- wid_aggregate(
  "../gender_growth_gap",
  age > 14,
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

## prepare external data if aggregate has changed
meta_file <- paste0(out_dir, "metadata.json.gz")
meta <- jsonlite::read_json(meta_file)
hash <- tools::md5sum(paste0(out_dir, "data.json.gz"))[[1]]
if (meta$md5 != hash) {
  meta$updated <- Sys.Date()
  meta$md5 <- hash
  validated$validated <- TRUE
  sources <- merge(
    validated[, c("country", "year", "survey", "validated")],
    publishable,
    all = TRUE
  )
  sources$validated[is.na(sources$validated)] <- FALSE
  sources$publishable[is.na(sources$publishable)] <- FALSE
  meta$sources <- sources
  jsonlite::write_json(
    meta,
    gzfile(meta_file),
    dataframe = "column",
    auto_unbox = TRUE
  )

  ### country-level data
  if (!requireNamespace("WDI")) install.packages("WDI")
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
  country_info_file <- paste0("../resources/CLASS.xlsx")
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
    scico::scico(
      length(countries),
      palette = "roma",
      end = .95,
      direction = -1
    ),
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

  ## copy updated files to site distribution
  files <- c(
    "metadata.json.gz",
    "data.json.gz",
    "work_bank.json.gz",
    "countries.geojson"
  )
  for (file in files) {
    file.copy(
      paste0(out_dir, file),
      paste0("docs/gender_gap/", file),
      overwrite = TRUE
    )
  }

  ## update package summaries

  ### rebuild sysdata
  load("R/sysdata.rda")

  wid_summaries <- wid_make_summaries("../gender_growth_gap")
  isic_to_section <- wid_update_isic("../resources")
  save(wid_summaries, isic_to_section, file = "R/sysdata.rda", compress = "xz")

  ### rebuild report
  devtools::install(".", upgrade = "never")
  wid_make_report("../gender_growth_gap")
  pkgdown::build_site()
}
