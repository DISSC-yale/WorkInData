# see what's available in a given year
wid_subset(max_year = 1998)

# see which variables and years are in a particular survey
wid_subset(surveys = "CASEN")

# see which surveys and years have a particular variable
wid_subset(variables = "work_search")[-1]

# filter to a subset of data
if (dir.exists("../../../gender_growth_gap")) {
  wid_open("../../../gender_growth_gap") |>
    wid_subset(age > 200) |>
    dplyr::collect()
}
