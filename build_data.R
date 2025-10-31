library(WorkInData)

# rebuild dataset

## prepare ISIC prefix map
survey_info <- readRDS("../resources/all_surveys.rds")$surveys
survey_info$isic_prefix <- c(
  "40_",
  "40_division_",
  "40_group_",
  "40_class_",
  "30_",
  "30_division_",
  "30_group_",
  "30_class_",
  "31_",
  "31_division_",
  "31_group_",
  "31_class_",
  "40_"
)[survey_info$main_job_ind_code]

survey_info <- survey_info[!is.na(survey_info$isic_prefix), ]
isic_prefixes <- as.list(structure(
  survey_info$isic_prefix,
  names = do.call(
    paste,
    c(
      as.list(survey_info[, c("country", "year", "survey")]),
      sep = "_"
    )
  )
))

## reformat data
out_dir <- "gender_gap/public/"
validated <- vroom::vroom("../validated_surveys.csv")
selection <- do.call(
  paste,
  c(as.list(validated[, c("country", "year", "survey")]), sep = "_")
)
unlink("../gender_growth_gap_temp", recursive = TRUE)
wid_reformat(
  "../data_cleaned",
  "../gender_growth_gap_temp",
  selection,
  isic_prefixes
)

meta_file <- paste0(out_dir, "metadata.json.gz")
meta <- jsonlite::read_json(meta_file)
current_archive <- paste0("../versions/", meta$updated)
if (!dir.exists(current_archive)) {
  file.rename("../gender_growth_gap", current_archive)
} else {
  unlink("../gender_growth_gap", recursive = TRUE)
}
file.rename("../gender_growth_gap_temp", "../gender_growth_gap")

# gender gap site resources

## aggregate dataset
publishable <- vroom::vroom("../publishable_surveys.csv")
publishable <- publishable[
  !is.na(publishable[[1L]]) &
    tolower(publishable$`Useable for portal?`) == "yes",
  c(
    "Country",
    "Year",
    "Survey",
    "Survey Name",
    "Link"
  )
]
colnames(publishable) <- c(
  "country",
  "year",
  "survey",
  "survey_name",
  "survey_link"
)

### additional employment share cutoff
employment_shares <- wid_open("../gender_growth_gap") |>
  wid_subset(!is.na(work), work) |>
  dplyr::group_by(country, year, survey) |>
  dplyr::summarize(
    sector_presence = sum(as.numeric(!is.na(main_activity))) / n() * 100
  ) |>
  dplyr::collect()
publishable <- merge(publishable, employment_shares, all.x = TRUE)

agg <- wid_aggregate(
  "../gender_growth_gap",
  age > 14,
  age < 65,
  selection = publishable[
    !is.na(publishable$sector_presence) &
      publishable$sector_presence >= 80,
    c("country", "year", "survey")
  ]
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
hash <- tools::md5sum(paste0(out_dir, "data.json.gz"))[[1]]
if (meta$md5 != hash) {
  meta$updated <- Sys.Date()
  meta$md5 <- hash
  sources <- merge(
    validated[, c("country", "year", "survey")],
    publishable
  )
  sources$country_year_present <- do.call(
    paste,
    sources[, c("country", "year")]
  ) %in%
    do.call(paste, agg[, c("country", "year")])
  meta$sources <- sources
  jsonlite::write_json(
    meta,
    gzfile(meta_file),
    dataframe = "column",
    auto_unbox = TRUE
  )

  ### country-level data
  if (!requireNamespace("WDI")) {
    install.packages("WDI")
  }
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
}
