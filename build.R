# rebuild
system2("air", "format .")
styler::style_pkg(filetype = "Rmd")
spelling::spell_check_package()
devtools::document()
pkgdown::build_site(lazy = TRUE)

## rebuild sysdata
load("R/sysdata.rda")

wid_summaries <- wid_make_summaries("../gender_growth_gap")
isic_to_section <- wid_update_isic("../resources")
save(wid_summaries, isic_to_section, file = "R/sysdata.rda", compress = "xz")

### after package rebuild with new sysdata
wid_make_report("../gender_growth_gap")
