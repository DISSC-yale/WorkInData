#' Work In Data Variables
#'
#' Retrieve information about variables.
#' @return A list of variable info:
#' \itemize{
#'   \item \code{name}: Display name.
#'   \item \code{description}: Description of the variable.
#'   \item \code{type}: Arrow data type.
#'   \item \code{summary_type}: Type of the summary.
#'   \item \code{summary}: A summary, as created by \code{\link{wid_make_summaries}}.
#' }
#' @examples
#' names(wid_variables())
#' wid_variables()[["work"]][c(
#'   "name", "category", "description", "type", "conversion", "summary_type"
#' )]
#' @export

wid_variables <- function() {
  variable_specs <- jsonlite::read_json(
    system.file("variables.json", package = "WorkInData"),
    simplifyVector = TRUE
  )[names(wid_schema())]
  for (variable in names(variable_specs)) {
    variable_specs[[variable]]$summary <- wid_summaries[[variable]]
  }
  variable_specs
}
