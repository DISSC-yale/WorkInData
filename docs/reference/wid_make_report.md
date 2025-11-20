# Report Variable Summaries

Generate a report of variable summaries.

## Usage

``` r
wid_make_report(reformat_dir, output = "vignettes/articles/variables.Rmd")
```

## Arguments

- reformat_dir:

  Path to the reformatted dataset.

- output:

  Path to write the report to.

## Value

Nothing; creates `output` file.

## Examples

``` r
if (FALSE) { # \dontrun{

  wid_make_report("../gender_growth_gap")
} # }
```
