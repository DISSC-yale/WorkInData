# Update Resources

Download resources from external sources:

- `wid_update_resources`: Update all resources.

- `wid_update_world_bank`: Country-level data from the World Bank (using
  the [WDI package](https://vincentarelbundock.github.io/WDI)).

- `wid_update_country_map`: GeoJSON map of countries from [Natural Earth
  Vector](https://github.com/nvkelso/natural-earth-vector).

- `wid_update_isic`: International Standard Industrial Classification
  (ISIC) code mappings from the [United Nations Statistics
  Division](https://unstats.un.org/unsd/classifications/Econ/).

## Usage

``` r
wid_update_country_map(out_dir = getOption("WID_RESOURCE_DIR"),
  overwrite = FALSE, simplify = FALSE)

wid_update_isic(out_dir = getOption("WID_RESOURCE_DIR"), overwrite = FALSE)

wid_update_resources(out_dir = getOption("WID_RESOURCE_DIR"),
  overwrite = FALSE)

wid_update_world_bank(out_dir = getOption("WID_RESOURCE_DIR"),
  overwrite = FALSE)
```

## Arguments

- out_dir:

  Directory in which to save resources.

- overwrite:

  Logical; if `TRUE`, will re-download and replace existing resources.

- simplify:

  Logical; if `TRUE`, will simplify the shapes.

## Value

Nothing; writes files to `out_dir`.

## Examples

``` r
if (FALSE) { # \dontrun{

  wid_update_resources()
} # }
```
