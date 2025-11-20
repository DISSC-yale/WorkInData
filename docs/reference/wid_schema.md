# Work In Data Schema

Make an Arrow schema to read the Work In Data files.

## Usage

``` r
wid_schema(original = FALSE)
```

## Arguments

- original:

  If `TRUE`, returns the schema of the original format, rather than that
  of the reformatted dataset.

## Value

An Arrow
[`schema`](https://arrow.apache.org/docs/r/reference/schema.html).

## Examples

``` r
wid_schema()
#> Schema
#> survey: string
#> year: int32
#> country: string
#> survey_year: int16
#> wgt: float
#> rural: bool
#> id_ind: string
#> age: int32
#> sex: bool
#> marital_status: string
#> n_child_5: int16
#> education: string
#> work: bool
#> work_search: bool
#> main_job_ind: string
#> main_activity: string
```
