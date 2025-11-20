# Get Started

## Cluster setup

The microdata are stored on Yale’s Grace HPC cluster.

Assuming you have a Yale identity, see the [YCRC
guide](https://docs.ycrc.yale.edu/clusters-at-yale/) to get started on
the cluster.

The package requires Arrow, which is available on the cluster in modules
(e.g., `Arrow/16`).

## Using the data

Start by installing the package if needed:

``` r
# install.packages("remotes")
remotes::install_github("dissc-yale/WorkInData")
```

Then load the library and connect to the data:

``` r
library(WorkInData)

data <- wid_open("/gpfs/gibbs/pi/dissc/work-in-data/gender_growth_gap")
```

Here, `data` is a regular [Arrow
Dataset](https://arrow.apache.org/docs/r/reference/open_dataset.html),
so you can use `dplyr` to interact with it, but the `wid_subset`
function can be used to filter more efficiently.

For instance, we might look at working status among those with a
graduate degree in 2018 by age and sex:

``` r
data_small <- data |>
  wid_subset(year == 2018, education == "Graduate") |>
  dplyr::select(age, sex, work) |>
  dplyr::collect()

data_small
#> # A tibble: 217,271 × 3
#>      age sex   work 
#>    <int> <lgl> <lgl>
#>  1    40 FALSE TRUE 
#>  2    40 FALSE FALSE
#>  3    59 FALSE TRUE 
#>  4    24 TRUE  FALSE
#>  5    55 TRUE  TRUE 
#>  6    40 TRUE  TRUE 
#>  7    42 FALSE TRUE 
#>  8    30 FALSE TRUE 
#>  9    51 FALSE TRUE 
#> 10    36 FALSE TRUE 
#> # ℹ 217,261 more rows
```

``` r
with(data_small, table(
  c("Yonger", "Older")[(age > mean(age, na.rm = TRUE)) + 1L],
  c("Male", "Female")[sex + 1L],
  work
))
#> , , work = FALSE
#> 
#>         
#>          Female  Male
#>   Older   19551 20005
#>   Yonger  17869  7537
#> 
#> , , work = TRUE
#> 
#>         
#>          Female  Male
#>   Older   28801 34676
#>   Yonger  45667 41441
```
