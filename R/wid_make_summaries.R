#' Summarize Dataset
#'
#' Calculate summaries of the reformatted dataset.
#'
#' @param reformat_dir Directory containing the reformatted dataset.
#' @param manifest_dir Directory to write summaries to.
#' @param by_sex Logical; if \code{TRUE}, will further break down summaries by sex.
#' @param cores Number of CPU cores to use during processing.
#' @return A list with entries for each variable:
#' \itemize{
#'   \item \code{type} Value type.
#'   \item \code{missing} Number of missing values across the entire dataset.
#'   \item \code{value_summary} Summary of the values, depending on type.
#'     For categorical variables, this will be observation counts for each level.
#'     For continuous variables, this will be the min, mean, standard deviation,
#'     median, and max. For identifier-like variables (character vectors with
#'     many unique values), this will be the alphabetically first and last value,
#'     and the number of unique values.
#'   \item \code{by_survey} Value summaries within each survey and year which
#'     have any observations.
#' }
#' @examples
#' \dontrun{
#'
#'   wid_make_summaries("../gender_growth_gap", "explore/public", by_sex = TRUE)
#' }
#' @export

wid_make_summaries <- function(
  reformat_dir,
  manifest_dir = NULL,
  by_sex = FALSE,
  cores = parallel::detectCores() - 5
) {
  sex <- country <- year <- NULL
  summarize_variable <- function(name) {
    .data <- n <- NULL
    spec <- variable_specs[[name]]
    db <- wid_open(reformat_dir)
    data <- dplyr::filter(db, !is.na(.data[[name]]))
    data_with_sex <- dplyr::filter(data, !is.na(sex))
    summary_function <- switch(
      spec$summary_type,
      table = function(x) {
        counts <- dplyr::count(x, .data[[name]]) |>
          dplyr::arrange(dplyr::desc(n)) |>
          dplyr::compute()
        split(as.integer(counts[[2]]), as.character(counts[[1]]))
      },
      unique = function(x) {
        check_partial <- nrow(x) > 1e7
        if (check_partial) {
          part <- dplyr::slice_head(x, n = 1e7)
          partial <- as.list(
            eval(parse(
              text = paste0(
                "dplyr::summarize(part, n = n(), unique = dplyr::n_distinct(",
                name,
                "))"
              )
            )) |>
              dplyr::compute()
          )
        }
        s <- eval(parse(
          text = paste0(
            "dplyr::summarize(x, ",
            "first = min(",
            name,
            "), ",
            "last = max(",
            name,
            ")",
            if (!check_partial || partial$unique / partial$n < .9) {
              paste0(", unique = dplyr::n_distinct(", name, ")")
            },
            ")"
          )
        )) |>
          dplyr::compute()
        if (!("unique" %in% names(s))) {
          s$unique <- paste0(
            round(partial$unique / partial$n * 100, 2),
            "% in first ",
            prettyNum(partial$n, ",")
          )
        }
        as.list(s)
      },
      continuous = function(x) {
        s <- suppressWarnings(eval(parse(
          text = paste0(
            "dplyr::summarize(x, ",
            "min = min(",
            name,
            "), ",
            "mean = mean(",
            name,
            "), ",
            "sd = sd(",
            name,
            "), ",
            "median = median(",
            name,
            "), ",
            "max = max(",
            name,
            ")",
            ")"
          )
        ))) |>
          dplyr::compute()
        as.list(s)
      }
    )
    x <- dplyr::select(data, {{ name }})
    parts <- list.files(
      reformat_dir,
      "parquet",
      full.names = TRUE,
      recursive = TRUE
    )
    parts <- do.call(
      rbind,
      regmatches(parts, gregexpr("(?<==)[^/]+", parts, perl = TRUE))
    )
    parts <- split(parts[, 2], parts[, 1])
    country_year <- dplyr::collect(
      db |> dplyr::group_by(country, year) |> dplyr::summarize(n = n())
    )
    country_year <- split(country_year$year, country_year$country)
    list(
      spec = spec,
      type = strsplit(arrow::schema(x)$ToString(), ": ")[[1]][[2]],
      missing = nrow(db) - nrow(data),
      value_summary = summary_function(x),
      by_survey = Filter(
        length,
        lapply(
          structure(names(parts), names = names(parts)),
          function(survey) {
            years <- parts[[survey]]
            Filter(
              length,
              lapply(structure(years, names = years), function(year) {
                if (by_sex) {
                  pxf <- dplyr::select(
                    eval(parse(
                      text = paste0(
                        "dplyr::filter(data_with_sex, sex == TRUE & survey == '",
                        survey,
                        "' & year == ",
                        year,
                        ")"
                      )
                    )),
                    {{ name }}
                  )
                  pxm <- dplyr::select(
                    eval(parse(
                      text = paste0(
                        "dplyr::filter(data_with_sex, sex == FALSE & survey == '",
                        survey,
                        "' & year == ",
                        year,
                        ")"
                      )
                    )),
                    {{ name }}
                  )
                  Filter(
                    length,
                    list(
                      Female = if (nrow(pxf)) summary_function(pxf),
                      Male = if (nrow(pxm)) summary_function(pxm)
                    )
                  )
                } else {
                  px <- dplyr::select(
                    eval(parse(
                      text = paste0(
                        "dplyr::filter(data, survey == '",
                        survey,
                        "' & year == ",
                        year,
                        ")"
                      )
                    )),
                    {{ name }}
                  )
                  if (nrow(px)) summary_function(px)
                }
              })
            )
          }
        )
      ),
      by_country = Filter(
        length,
        lapply(
          structure(names(country_year), names = names(country_year)),
          function(country) {
            years <- country_year[[country]]
            Filter(
              length,
              lapply(structure(years, names = years), function(year) {
                if (by_sex) {
                  pxf <- dplyr::select(
                    eval(parse(
                      text = paste0(
                        "dplyr::filter(data_with_sex, sex == TRUE & country == '",
                        country,
                        "' & year == ",
                        year,
                        ")"
                      )
                    )),
                    {{ name }}
                  )
                  pxm <- dplyr::select(
                    eval(parse(
                      text = paste0(
                        "dplyr::filter(data_with_sex, sex == FALSE & country == '",
                        country,
                        "' & year == ",
                        year,
                        ")"
                      )
                    )),
                    {{ name }}
                  )
                  Filter(
                    length,
                    list(
                      Female = if (nrow(pxf)) summary_function(pxf),
                      Male = if (nrow(pxm)) summary_function(pxm)
                    )
                  )
                } else {
                  px <- dplyr::select(
                    eval(parse(
                      text = paste0(
                        "dplyr::filter(data, country == '",
                        country,
                        "' & year == ",
                        year,
                        ")"
                      )
                    )),
                    {{ name }}
                  )
                  if (nrow(px)) summary_function(px)
                }
              })
            )
          }
        )
      )
    )
  }

  variable_specs <- jsonlite::read_json(
    system.file("variables.json", package = "WorkInData"),
    simplifyVector = TRUE
  )[names(wid_schema())]

  summaries <- if (cores > 1) {
    call_env <- new.env(parent = globalenv())
    call_env$cores <- cores
    call_env$reformat_dir <- reformat_dir
    call_env$by_sex <- by_sex
    call_env$variable_specs <- variable_specs
    call_env$summarize_variable <- summarize_variable
    environment(summarize_variable) <- call_env
    eval(
      expression({
        cl <- parallel::makeCluster(cores)
        on.exit(parallel::stopCluster(cl))
        parallel::parLapply(
          cl,
          structure(names(variable_specs), names = names(variable_specs)),
          summarize_variable
        )
      }),
      envir = call_env
    )
  } else {
    lapply(
      structure(names(variable_specs), names = names(variable_specs)),
      summarize_variable
    )
  }
  if (!is.null(manifest_dir)) {
    jsonlite::write_json(
      summaries,
      paste0(manifest_dir, "/wid_summaries.json"),
      auto_unbox = TRUE
    )
  }
  invisible(summaries)
}
