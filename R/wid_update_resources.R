#' Update Resources
#'
#' Download resources from external sources:
#' \itemize{
#'   \item \code{wid_update_resources}: Update all resources.
#'   \item \code{wid_update_world_bank}: Country-level data from the World Bank.
#'   \item \code{wid_update_country_map}: GeoJSON map of countries.
#'   \item \code{wid_update_isic}: International Standard Industrial Classification (ISIC)
#'     code mappings.
#' }
#' @param out_dir Directory in which to save resources.
#' @param overwrite Logical; if \code{TRUE}, will re-download and replace existing resources.
#' @return Nothing; writes files to \code{out_dir}.
#' @examples
#' \dontrun{
#'
#'   wid_update_resources()
#' }
#' @export

wid_update_resources <- function(
  out_dir = getOption("WID_RESOURCE_DIR"),
  overwrite = FALSE
) {
  wid_update_country_map(out_dir, overwrite)
  wid_update_world_bank(out_dir, overwrite)
  wid_update_isic(out_dir, overwrite)
}
