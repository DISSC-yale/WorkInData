# Reformat Original Data

Convert original Work In Data cleaned files to a parquet dataset.

## Usage

``` r
wid_reformat(original_dir, reformat_dir, selection = NULL,
  isic_prefixes = list(), cores = parallel::detectCores() - 2,
  overwrite = FALSE)
```

## Arguments

- original_dir:

  Directory containing cleaned data.

- reformat_dir:

  Directory to save the dataset files in.

- selection:

  Character vector specifying a subset of files to include (e.g.,
  `c("AGO_2008_IBEP", "ALB_20.._LFS", "2024")`).

- isic_prefixes:

  A list mapping country_year_survey IDs to ISIC prefixes (`30_`, `31_`,
  or `40_`, for revisions `3`, `3.1`, or `4`).

- cores:

  Number of CPU cores to use during processing.

- overwrite:

  Logical; if `TRUE`, will rewrite existing partitions.

## Value

Nothing; writes files to `reformat_dir`.

## Examples

``` r
if (FALSE) { # \dontrun{

  wid_reformat("../data_cleaned", "../gender_growth_gap")
} # }
```
