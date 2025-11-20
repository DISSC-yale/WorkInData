# Get CDS Links

Scrape links to individual CDS reports from school websites.

## Usage

``` r
get_report_links(school, out_dir, url = NULL, overwrite = FALSE)
```

## Arguments

- school:

  Name of the school.

- out_dir:

  Path to an output directory.

- url:

  Link to the school's CDS page, containing links to individual reports.

- overwrite:

  Logical; if `TRUE`, will always try to retrieve fresh links, rather
  than using a previous pull.

## Value

A list, which is also saved as `{out_dir}/{school}/links.json`:

- **`school`**: Name of the school.

- **`url`**: Link to the school's CDS page.

- **`retrieved`**: Time the links were retrieved.

- **`links`**: A vector of extracted links.

## Examples

``` r
if (dir.exists("../../data/source")) {
  report_links <- get_report_links(
    "yale", "../../data/source", "https://oir.yale.edu/common-data-set"
  )
  report_links
}
#> $school
#> [1] "yale"
#> 
#> $url
#> [1] "https://oir.yale.edu/common-data-set"
#> 
#> $retrieved
#> [1] "Wed Aug 28 08:54:06 2024"
#> 
#> $links
#>  [1] "https://oir.yale.edu/sites/default/files/cds_yale_2023-24_vf_20240320.pdf"    
#>  [2] "https://oir.yale.edu/sites/default/files/cds_yale_2022-2023_vf_10062023.pdf"  
#>  [3] "https://oir.yale.edu/sites/default/files/yale_cds_2021-2022_vf_06062022_0.pdf"
#>  [4] "https://oir.yale.edu/sites/default/files/cds_2020-2021_yale_vf_030521.pdf"    
#>  [5] "https://oir.yale.edu/sites/default/files/cds_2019-2020_yale_vf_030420.pdf"    
#>  [6] "https://oir.yale.edu/sites/default/files/cds_yale_2018-2019.pdf"              
#>  [7] "https://oir.yale.edu/sites/default/files/cds_2017-2018.pdf"                   
#>  [8] "https://oir.yale.edu/sites/default/files/cds2016-2017.pdf"                    
#>  [9] "https://oir.yale.edu/sites/default/files/cds2015_2016_0.pdf"                  
#> [10] "https://oir.yale.edu/sites/default/files/cds2014_2015_0.pdf"                  
#> [11] "https://oir.yale.edu/sites/default/files/cds2013_2014.pdf"                    
#> [12] "https://oir.yale.edu/sites/default/files/cds2012_2013.pdf"                    
#> [13] "https://oir.yale.edu/sites/default/files/cds2011_2012_3.pdf"                  
#> [14] "https://oir.yale.edu/sites/default/files/cds2010_2011_1.pdf"                  
#> [15] "https://oir.yale.edu/sites/default/files/cds2009_2010_1.pdf"                  
#> [16] "https://oir.yale.edu/sites/default/files/cds2008_2009_1.pdf"                  
#> 
```
