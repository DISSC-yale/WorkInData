# rebuild
system2("air", "format .")
styler::style_pkg(filetype = "Rmd")
spelling::spell_check_package()
devtools::document()
pkgdown::build_site(lazy = TRUE)
