#' @rdname wid_update_resources
#' @export

wid_update_world_bank <- function(
  out_dir = getOption("WID_RESOURCE_DIR"),
  overwrite = FALSE
) {
  out_file <- paste0(out_dir, "/GDP.csv.xz")
  if (overwrite || !file.exists(out_file)) {
    if (requireNamespace("WDI")) {
      dir.create(out_dir, FALSE, TRUE)
      data <- WDI::WDI(
        indicator = c(
          gdp_per_capita_local = "NY.GDP.PCAP.CN",
          gdp_per_capita_us = "NY.GDP.PCAP.CD",
          gdp_per_capita_const = "NY.GDP.PCAP.PP.CD",
          population = "SP.POP.TOTL"
        ),
        start = 1998
      )
      data <- data[data$iso3c != "", -(1:2)]
      utils::write.csv(
        data,
        xzfile(paste0(out_dir, "/GDP.csv.xz")),
        row.names = FALSE
      )
    } else {
      message("install the `WDI` package to download World Bank data")
    }
  }
  utils::read.csv(out_file)
}
