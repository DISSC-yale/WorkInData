# Download CDS Reports

Download the CDS PDF reports from a given school, using URLs retrieved
with
[`get_report_links`](https://dissc-yale.github.io/WorkInData/reference/get_report_links.md).

## Usage

``` r
download_reports(school, out_dir, overwrite = FALSE, verbose = TRUE)
```

## Arguments

- school:

  Name of the school.

- out_dir:

  Path to an output directory, which should contain the output of
  [`get_report_links`](https://dissc-yale.github.io/WorkInData/reference/get_report_links.md).

- overwrite:

  Logical; if `TRUE`, will always try to download all reports.

- verbose:

  Logical; if `FALSE`, will not show status messages.

## Value

A list with an entry for each report, which is also saved as
`{out_dir}/{school}/manifest.json`:

- **`url`**: Link to the report.

- **`retrieved`**: Time the report was downloaded.

- **`md5`**: MD5 sum of the report.

## Examples

``` r
if (dir.exists("../../data/source")) {
  manifest <- download_reports("yale", "../../data/source")
  manifest[1:2]
}
#> checking 16 files...
#>   - cds_yale_2023-24_vf_20240320.pdf retrieved Wed Aug 28 08:55:33 2024
#>   - cds_yale_2022-2023_vf_10062023.pdf retrieved Wed Aug 28 08:55:33 2024
#>   - yale_cds_2021-2022_vf_06062022_0.pdf retrieved Wed Aug 28 08:55:33 2024
#>   - cds_2020-2021_yale_vf_030521.pdf retrieved Wed Aug 28 08:55:33 2024
#>   - cds_2019-2020_yale_vf_030420.pdf retrieved Wed Aug 28 08:55:33 2024
#>   - cds_yale_2018-2019.pdf retrieved Wed Aug 28 08:55:34 2024
#>   - cds_2017-2018.pdf retrieved Wed Aug 28 08:55:34 2024
#>   - cds2016-2017.pdf retrieved Wed Aug 28 08:55:34 2024
#>   - cds2015_2016_0.pdf retrieved Wed Aug 28 08:55:34 2024
#>   - cds2014_2015_0.pdf retrieved Wed Aug 28 08:55:34 2024
#>   - cds2013_2014.pdf retrieved Wed Aug 28 08:55:34 2024
#>   - cds2012_2013.pdf retrieved Wed Aug 28 08:55:34 2024
#>   - cds2011_2012_3.pdf retrieved Wed Aug 28 08:55:34 2024
#>   - cds2010_2011_1.pdf retrieved Wed Aug 28 08:55:34 2024
#>   - cds2009_2010_1.pdf retrieved Wed Aug 28 08:55:35 2024
#>   - cds2008_2009_1.pdf retrieved Wed Aug 28 08:55:35 2024
#> $`cds_yale_2023-24_vf_20240320.pdf`
#> $`cds_yale_2023-24_vf_20240320.pdf`$url
#> [1] "https://oir.yale.edu/sites/default/files/cds_yale_2023-24_vf_20240320.pdf"
#> 
#> $`cds_yale_2023-24_vf_20240320.pdf`$retrieved
#> [1] "Wed Aug 28 08:55:33 2024"
#> 
#> $`cds_yale_2023-24_vf_20240320.pdf`$md5
#> [1] "d5c8a7c3cddbe19fca77bf9cc738eff5"
#> 
#> 
#> $`cds_yale_2022-2023_vf_10062023.pdf`
#> $`cds_yale_2022-2023_vf_10062023.pdf`$url
#> [1] "https://oir.yale.edu/sites/default/files/cds_yale_2022-2023_vf_10062023.pdf"
#> 
#> $`cds_yale_2022-2023_vf_10062023.pdf`$retrieved
#> [1] "Wed Aug 28 08:55:33 2024"
#> 
#> $`cds_yale_2022-2023_vf_10062023.pdf`$md5
#> [1] "5b77852508b6d9a2d3c62ae5882a117c"
#> 
#> 
```
