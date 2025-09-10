# see what's available in a given year
wid_subset(max_year = 1998)

# see which variables and years are in a particular survey
wid_subset(surveys = "CASEN")

# see which surveys and years have a particular variable
wid_subset(variables = "work_search")[-1]

# filter to a subset of data
db_dir <- "../../../gender_growth_gap"
if (dir.exists(db_dir)) {
  wid_open(db_dir) |> wid_subset(age > 200) |> dplyr::collect()
}
