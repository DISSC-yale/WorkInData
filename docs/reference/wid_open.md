# Open Dataset

Open the Work in Data dataset.

## Usage

``` r
wid_open(location = "work-in-data", ...,
  key = Sys.getenv("AWS_ACCESS_KEY_ID"),
  secret = Sys.getenv("AWS_SECRET_ACCESS_KEY"))
```

## Arguments

- location:

  Local or remote path to the dataset.

- ...:

  Passes additional arguments to
  [`s3_bucket`](https://arrow.apache.org/docs/r/reference/s3_bucket.html).

- key:

  Your AWS access key; defaults to the `AWS_ACCESS_KEY_ID` environment
  variable.

- secret:

  Your AWS secret key; defaults to the `AWS_SECRET_ACCESS_KEY`
  environment variable.

## Value

The Work in Data
[`Dataset`](https://arrow.apache.org/docs/r/reference/Dataset.html).

## Examples

``` r
if (FALSE) { # \dontrun{

  wid_open("/nfs/roberts/pi/dissc/work-in-data/gender_growth_gap")
} # }
```
