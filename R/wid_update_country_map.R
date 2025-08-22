#' @rdname wid_update_resources
#' @param simplify Logical; if \code{TRUE}, will simplify the shapes.
#' @export

wid_update_country_map <- function(
  out_dir = getOption("WID_RESOURCE_DIR"),
  overwrite = FALSE,
  simplify = FALSE
) {
  out_file <- paste0(out_dir, "/countries.geojson")
  if (requireNamespace("sf")) {
    if (overwrite || !file.exists(out_file)) {
      dir.create(out_dir, FALSE, TRUE)
      unlink(out_file)
      map <- sf::st_read(paste0(
        "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/refs/heads/master/",
        "geojson/ne_110m_admin_0_countries.geojson"
      ))
      map <- map[, c("ISO_A3", "ISO_A3_EH", "NAME", "REGION_WB", "SUBREGION")]
      su <- map$ISO_A3 == "-99"
      map$ISO_A3[su] <- map$ISO_A3_EH[su]
      map <- map[, -2L]
      if (simplify) {
        if (requireNamespace("rmapshaper")) {
          map <- rmapshaper::ms_simplify(map, .8, keep_shapes = TRUE)
        } else {
          message("install the `rmapshaper` package to simplify the map")
        }
      }
      sf::st_write(map, out_file)
    }
    sf::st_read(out_file)
  } else {
    message("install the `sf` package to download/load the country map")
  }
}
