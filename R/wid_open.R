#' Open Dataset
#'
#' Open the Work in Data dataset.
#'
#' @param location Local or remote path to the dataset.
#' @param ... Passes additional arguments to \code{\link[arrow]{s3_bucket}}.
#' @param key Your AWS access key; defaults to the \code{AWS_ACCESS_KEY_ID} environment variable.
#' @param secret Your AWS secret key; defaults to the
#' \code{AWS_SECRET_ACCESS_KEY} environment variable.
#' @return The Work in Data \code{\link[arrow]{Dataset}}.
#' @examples
#' \dontrun{
#'
#'   wid_open("/gpfs/gibbs/pi/dissc/work-in-data/gender_growth_gap")
#' }
#' @export

wid_open <- function(
  location = "work-in-data",
  ...,
  key = Sys.getenv("AWS_ACCESS_KEY_ID"),
  secret = Sys.getenv("AWS_SECRET_ACCESS_KEY")
) {
  if (is.character(location) && !dir.exists(location)) {
    location <- arrow::s3_bucket(
      location,
      ...,
      access_key = key,
      secret_key = secret
    )
  }
  arrow::open_dataset(
    location,
    schema = wid_schema(),
    partitioning = arrow::schema(list(
      survey = arrow::string(),
      year = arrow::int16()
    ))
  )
}
