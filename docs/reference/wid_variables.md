# Work In Data Variables

Retrieve information about variables.

## Usage

``` r
wid_variables()
```

## Value

A list of variable info:

- `name`: Display name.

- `description`: Description of the variable.

- `type`: Arrow data type.

- `summary_type`: Type of the summary.

- `summary`: A summary, as created by
  [`wid_make_summaries`](https://dissc-yale.github.io/WorkInData/reference/wid_make_summaries.md).

## Examples

``` r
names(wid_variables())
#>  [1] "survey"         "year"           "country"        "survey_year"   
#>  [5] "wgt"            "rural"          "id_ind"         "age"           
#>  [9] "sex"            "marital_status" "n_child_5"      "education"     
#> [13] "work"           "work_search"    "main_job_ind"   "main_activity" 
wid_variables()[["work"]][c(
  "name", "category", "description", "type", "conversion", "summary_type"
)]
#> $name
#> [1] "Working"
#> 
#> $category
#> [1] "Work"
#> 
#> $description
#> [1] "Whether the respondent worked in the reference period."
#> 
#> $type
#> [1] "int8"
#> 
#> $conversion
#> $conversion$type
#> [1] "bool"
#> 
#> $conversion$true_value
#> [1] 1
#> 
#> 
#> $summary_type
#> [1] "table"
#> 
```
