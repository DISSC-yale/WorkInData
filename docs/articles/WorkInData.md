# Get Started

## Cluster setup

The microdata are stored on Yale’s Bouchet HPC cluster.

Assuming you have a Yale identity, see the [YCRC
guide](https://docs.ycrc.yale.edu/clusters-at-yale/) to get started on
the cluster.

The package requires Arrow, which is available on the cluster in modules
(e.g., `Arrow/17`).

## Using the data

Start by installing the package if needed:

``` r
# install.packages("remotes")
remotes::install_github("dissc-yale/WorkInData")
```

Then load the library and connect to the data:

``` r
library(WorkInData)

data <- wid_open("/nfs/roberts/pi/dissc/work-in-data/gender_growth_gap")
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
#> # A tibble: 183,116 × 3
#>      age sex   work 
#>    <int> <lgl> <lgl>
#>  1    35 TRUE  TRUE 
#>  2    26 FALSE TRUE 
#>  3    36 TRUE  TRUE 
#>  4    65 TRUE  TRUE 
#>  5    70 FALSE TRUE 
#>  6    56 TRUE  FALSE
#>  7    41 FALSE TRUE 
#>  8    41 TRUE  TRUE 
#>  9    64 FALSE TRUE 
#> 10    24 TRUE  TRUE 
#> # ℹ 183,106 more rows
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
#>   Older   16773 17459
#>   Yonger  11098  5688
#> 
#> , , work = TRUE
#> 
#>         
#>          Female  Male
#>   Older   22331 26608
#>   Yonger  45226 36459
```
