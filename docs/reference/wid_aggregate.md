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
#> cell cutoff removed 1 of 264 rows, which excludes 23 of 5348590 people.
#> # A tibble: 263 × 8
#> # Groups:   country, year, sex, main_activity [24]
#>    country  year sex    main_activity         variable level  count      weight
#>    <chr>   <int> <chr>  <chr>                 <chr>    <chr>  <int>       <dbl>
#>  1 IND      2004 Male   Agriculture           total    all    34942 23626406539
#>  2 IND      2004 Male   Industry              total    all    10992  7169138951
#>  3 IND      2004 Male   Out of Workforce      total    all    71458 44921362764
#>  4 IND      2004 Male   Services - Market     total    all    31819 17580381594
#>  5 IND      2004 Male   Services - Non-Market total    all     2090  1213388628
#>  6 IND      2004 Male   Unemployed            total    all     3358  1410530988
#>  7 IND      2004 Female Agriculture           total    all    14886 10872332572
#>  8 IND      2004 Female Industry              total    all     2969  2018753456
#>  9 IND      2004 Female Out of Workforce      total    all   118035 73812218107
#> 10 IND      2004 Female Services - Market     total    all     4839  2550226703
#> # ℹ 253 more rows
```
