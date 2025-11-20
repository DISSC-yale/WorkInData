# Summarize Dataset

Calculate summaries of the reformatted dataset.

## Usage

``` r
wid_make_summaries(reformat_dir, manifest_dir = NULL, by_sex = FALSE,
  cores = parallel::detectCores() - 5)
```

## Arguments

- reformat_dir:

  Directory containing the reformatted dataset.

- manifest_dir:

  Directory to write summaries to.

- by_sex:

  Logical; if `TRUE`, will further break down summaries by sex.

- cores:

  Number of CPU cores to use during processing.

## Value

A list with entries for each variable:

- `type` Value type.

- `missing` Number of missing values across the entire dataset.

- `value_summary` Summary of the values, depending on type. For
  categorical variables, this will be observation counts for each level.
  For continuous variables, this will be the min, mean, standard
  deviation, median, and max. For identifier-like variables (character
  vectors with many unique values), this will be the alphabetically
  first and last value, and the number of unique values.

- `by_survey` Value summaries within each survey and year which have any
  observations.

## Examples

``` r
if (FALSE) { # \dontrun{

  wid_make_summaries("../gender_growth_gap", "explore/public", by_sex = TRUE)
} # }
```
