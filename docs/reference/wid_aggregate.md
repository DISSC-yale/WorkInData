# Aggregate Dataset

Create aggregates from the dataset.

## Usage

``` r
wid_aggregate(data_dir, ..., levels = list(), cell_cutoff = 30,
  selection = NULL, cores = parallel::detectCores() - 2)
```

## Arguments

- data_dir:

  Path to the dataset, to be opened by
  [`wid_open`](https://dissc-yale.github.io/WorkInData/reference/wid_open.md).

- ...:

  Arguments to pass to
  [`wid_subset`](https://dissc-yale.github.io/WorkInData/reference/wid_subset.md).

- levels:

  A list containing new or redefined summaries to include. The name of
  each entry determines the `variable` value, with named vectors
  defining each `level` (e.g.,
  `` list(age = c(`Under 20` = "age < 20", `Over 60` = "age > 60")) ``).

- cell_cutoff:

  Minimal cell size to retain; cells with `count < cell_cutoff` will be
  removed.

- selection:

  A character vector of country_year_survey IDs to be selected, or a
  matrix-like object consisting of 3 columns containing country, year,
  and survey IDs in that order.

- cores:

  Number of CPU cores to use.

## Value

An aggregated version of `db`.

## Examples

``` r
# aggregate a subset of the full dataset
db_dir <- "../../../gender_growth_gap"
if (dir.exists(db_dir)) {
  selection <- data.frame(
    country = c("IND", "IND"),
    year = c(2004, 2005),
    survey = c("NSS", "NSS")
  )
  wid_aggregate(db_dir, selection = selection)
}
#> Error in unserialize(node$con): error reading from connection
```
