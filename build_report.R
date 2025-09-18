if (!requireNamespace("curl")) {
  install.packages("curl")
}
WorkInData::wid_make_report("../gender_growth_gap")
pkgdown::build_site(preview = FALSE)