if (!requireNamespace("curl")) {
  install.packages("curl")
}
WorkInData::wid_make_report("../gender_growth_gap")
unlink(paste0("docs/articles/", c("variables", "WorkInData"), ".html"))
pkgdown::build_site(lazy = TRUE, preview = FALSE)
