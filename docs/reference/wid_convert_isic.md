# Convert ISIC Codes

Convert International Standard Industrial Classification (ISIC) codes to
aggregate economic activity categories, based on classifications from
the [United Nations Statistics
Division](https://unstats.un.org/unsd/classifications/Econ/).

## Usage

``` r
wid_convert_isic(codes, level = 4L, full_label = FALSE)
```

## Arguments

- codes:

  A character vector of original ISIC codes, which can be at the
  section, division, group, class, or 4-digit level. The latest unique
  classification will be used unless the original code has a revision
  and/or code type prefix: `revision_type_code`, where `revision` is one
  of `40_`, `31_`, or `30_` for revisions `4`, `3.1`, or `3`, and `type`
  is one of `division`, `group`, or `class`.

- level:

  Level of dis-aggregation (determining number of categories):

  |     |                                                    |
  |-----|----------------------------------------------------|
  | `1` | Section-level (21 categories).                     |
  | `2` | Lowest activity-level (6 categories).              |
  | `3` | Split service sectors (4 categories).              |
  | `4` | Agriculture, Industry, or Services (3 categories). |
  | `5` | Agricultural or not (2 categories).                |

- full_label:

  Logical; if `TRUE`, will return full text labels rather than short
  codes.

## Value

A character vector containing short code or labels.

## Examples

``` r
# revision 4 sections by default
(codes <- LETTERS[1:21])
#>  [1] "A" "B" "C" "D" "E" "F" "G" "H" "I" "J" "K" "L" "M" "N" "O" "P" "Q" "R" "S"
#> [20] "T" "U"
wid_convert_isic(codes)
#>  [1] "A" "I" "I" "I" "I" "I" "S" "S" "S" "S" "S" "S" "S" "S" "S" "S" "S" "S" "S"
#> [20] "S" "S"
wid_convert_isic(codes, 1, full_label = TRUE)
#>  [1] "Agriculture"      "Mining"           "Manufacturing"    "Electrical"      
#>  [5] "Water"            "Construction"     "Trade"            "Transportation"  
#>  [9] "Service"          "Information"      "Financial"        "Property"        
#> [13] "Professional"     "Administrative"   "Public"           "Education"       
#> [17] "Health"           "Arts"             "Other"            "Households"      
#> [21] "Extraterritorial"
wid_convert_isic(codes, 2, full_label = TRUE)
#>  [1] "Agriculture"              "Industry - Resources"    
#>  [3] "Industry - Manufacturing" "Industry - Resources"    
#>  [5] "Industry - Resources"     "Industry - Construction" 
#>  [7] "Services - Market"        "Services - Market"       
#>  [9] "Services - Market"        "Services - Market"       
#> [11] "Services - Market"        "Services - Market"       
#> [13] "Services - Market"        "Services - Market"       
#> [15] "Services - Non-Market"    "Services - Non-Market"   
#> [17] "Services - Non-Market"    "Services - Non-Market"   
#> [19] "Services - Non-Market"    "Services - Non-Market"   
#> [21] "Services - Non-Market"   

# disambiguating in the case of overlaps
wid_convert_isic("111", 4, full_label = TRUE)
#> [1] "Industry"
wid_convert_isic("0111", 4, full_label = TRUE)
#> [1] "Agriculture"
wid_convert_isic("31_class_111", 4, full_label = TRUE)
#> [1] "Agriculture"
```
