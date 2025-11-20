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
#> cell cutoff removed 0 of 220 rows, which excludes 0 of 5348590 people.
#> # A tibble: 220 × 8
#> # Groups:   country, year, sex, main_activity [20]
#>    country  year sex    main_activity    variable level  count      weight
#>    <chr>   <int> <chr>  <chr>            <chr>    <chr>  <int>       <dbl>
#>  1 IND      2004 Male   Agriculture      total    all    34942 23626406539
#>  2 IND      2004 Male   Industry         total    all    16314 11037425591
#>  3 IND      2004 Male   Out of Workforce total    all    71458 44921362764
#>  4 IND      2004 Male   Services         total    all    28587 14925483582
#>  5 IND      2004 Male   Unemployed       total    all     3358  1410530988
#>  6 IND      2004 Female Agriculture      total    all    14886 10872332572
#>  7 IND      2004 Female Industry         total    all     3504  2487577454
#>  8 IND      2004 Female Out of Workforce total    all   118035 73812218107
#>  9 IND      2004 Female Services         total    all     5347  2833352056
#> 10 IND      2004 Female Unemployed       total    all     1340   543395196
#> # ℹ 210 more rows
```
