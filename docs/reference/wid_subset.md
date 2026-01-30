# Subset Dataset

Select a subset of the dataset.

## Usage

``` r
wid_subset(db = NULL, ..., variables = NULL, surveys = NULL,
  min_year = -Inf, max_year = Inf, selection = NULL)
```

## Arguments

- db:

  The dataset to subset; an
  [`Dataset`](https://arrow.apache.org/docs/r/reference/Dataset.html) as
  returned from
  [`wid_open`](https://dissc-yale.github.io/WorkInData/reference/wid_open.md).

- ...:

  Conditions in the form of `variable operator value` (e.g.,
  `age > 50`).

- variables:

  A character vector containing the variables you want to require. That
  is, only observations with values for these variables will be
  included.

- surveys:

  A character vector of survey abbreviations to include.

- min_year:

  Earliest year to include.

- max_year:

  Latest year to include.

- selection:

  A character vector with country_year_survey IDs to be selected, or a
  matrix-like object consisting of 3 columns containing country, year,
  and survey IDs in that order.

## Value

A filtered version of `db` if it is provided, or a list with entries for
remaining `variables`, `surveys`, and `years`.

## Examples

``` r
# see what's available in a given year
wid_subset(max_year = 1998)
#> $variables
#>  [1] "age"            "country"        "education"      "id_ind"        
#>  [5] "main_activity"  "main_job_ind"   "marital_status" "n_child_5"     
#>  [9] "rural"          "sex"            "survey"         "survey_year"   
#> [13] "wgt"            "work"           "work_search"    "year"          
#> 
#> $surveys
#> [1] "BHPS"      "CASEN"     "CPS-IPUMS" "GLSS"      "IPUMS"     "KLIPS"    
#> [7] "LFS"       "NSS"      
#> 
#> $years
#>  [1] 1960 1962 1963 1967 1968 1969 1970 1971 1972 1973 1974 1975 1976 1977 1978
#> [16] 1979 1980 1981 1982 1983 1984 1985 1986 1987 1988 1989 1990 1991 1992 1993
#> [31] 1994 1995 1996 1997 1998
#> 

# see which variables and years are in a particular survey
wid_subset(surveys = "CASEN")
#> $variables
#>  [1] "age"            "country"        "education"      "id_ind"        
#>  [5] "main_activity"  "main_job_ind"   "marital_status" "n_child_5"     
#>  [9] "rural"          "sex"            "survey"         "wgt"           
#> [13] "work"           "work_search"    "year"          
#> 
#> $surveys
#> [1] "CASEN"
#> 
#> $years
#>  [1] 1990 1992 1994 1996 1998 2000 2003 2006 2009 2011 2013 2015 2017
#> 

# see which surveys and years have a particular variable
wid_subset(variables = "work_search")[-1]
#> $surveys
#>  [1] "BHPS"      "CASEN"     "CFPS"      "CPS-IPUMS" "ECAM"      "ECE"      
#>  [7] "ECH"       "ECVMA"     "EH"        "EHCVM"     "EICV"      "EMICOV"   
#> [13] "ENAHO"     "ENEMDU"    "ENES"      "ENOE"      "ENPE"      "EULFS"    
#> [19] "GEIH"      "GLSS"      "HILDA"     "HLFS"      "IBEP"      "IHS"      
#> [25] "ILCS"      "ILFS"      "IPUMS"     "KCHSP"     "KLIPS"     "LFCLS"    
#> [31] "LFS"       "LMD"       "LSMS"      "NBHS"      "NLFS"      "NSS"      
#> [37] "PLFS"      "PNAD"      "PSLM"      "RLMS"      "SILC"     
#> 
#> $years
#>  [1] 1960 1962 1963 1967 1968 1969 1970 1971 1972 1973 1974 1975 1976 1977 1978
#> [16] 1979 1980 1981 1982 1983 1984 1985 1986 1987 1988 1989 1990 1991 1992 1993
#> [31] 1994 1995 1996 1997 1998 1999 2000 2001 2002 2003 2004 2005 2006 2007 2008
#> [46] 2009 2010 2011 2012 2013 2014 2015 2016 2017 2018 2019 2020 2021 2022 2023
#> 

# filter to a subset of data
db_dir <- "../../../gender_growth_gap"
if (dir.exists(db_dir)) {
  wid_open(db_dir) |> wid_subset(age > 200) |> dplyr::collect()
}
#> # A tibble: 5 × 15
#>     age country education id_ind      main_activity  main_job_ind marital_status
#>   <int> <chr>   <chr>     <chr>       <chr>          <chr>        <chr>         
#> 1   653 IND     None      45727110201 Agriculture    31_class_111 Never Married 
#> 2   205 IND     Primary   41499210202 Out of Workfo… NA           Married / In-…
#> 3   262 IND     Graduate  41962220204 Out of Workfo… NA           Married / In-…
#> 4   302 IND     NA        43285110203 Industry       31_class_20… Married / In-…
#> 5   810 IND     NA        43977220104 Out of Workfo… NA           Never Married 
#> # ℹ 8 more variables: n_child_5 <int>, rural <lgl>, sex <lgl>, survey <chr>,
#> #   wgt <dbl>, work <lgl>, work_search <lgl>, year <int>
```
