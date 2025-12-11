#' Aggregate Dataset
#'
#' Create aggregates from the dataset.
#'
#' @param data_dir Path to the dataset, to be opened by \code{\link{wid_open}}.
#' @param ... Arguments to pass to \code{\link{wid_subset}}.
#' @param levels A list containing new or redefined summaries to include.
#'   The name of each entry determines the \code{variable} value, with named vectors
#'   defining each \code{level} (e.g., \code{list(age = c(`Under 20` = "age < 20",
#'   `Over 60` = "age > 60"))}).
#' @param cell_cutoff Minimal cell size to retain; cells with \code{count < cell_cutoff}
#'   will be removed.
#' @param selection A character vector of country_year_survey IDs to be selected,
#' or a matrix-like object consisting of 3 columns containing country, year, and survey IDs
#' in that order.
#' @param cores Number of CPU cores to use.
#' @return An aggregated version of \code{db}.
#' @examples
#' # aggregate a subset of the full dataset
#' db_dir <- "../../../gender_growth_gap"
#' if (dir.exists(db_dir)) {
#'   selection <- data.frame(
#'     country = c("IND", "IND"),
#'     year = c(2004, 2005),
#'     survey = c("NSS", "NSS")
#'   )
#'   wid_aggregate(db_dir, selection = selection)
#' }
#' @export

wid_aggregate <- function(
  data_dir,
  ...,
  levels = list(),
  cell_cutoff = 30,
  selection = NULL,
  cores = parallel::detectCores() - 2
) {
  country <- year <- sex <- wgt <- .data <- main_activity <- level <- NULL
  split_levels <- list(
    total = NULL,
    rural = c(
      Rural = "rural == TRUE",
      Urban = "rural == FALSE"
    ),
    age = c(
      `Under 35` = "age < 35",
      `35 or Over` = "age >= 35"
    ),
    marital_status = c(
      `Partnered` = 'marital_status == "Married / In-Union / Co-Habiting"',
      `Not Partnered` = 'marital_status != "Married / In-Union / Co-Habiting"'
    ),
    education = c(
      `None to Vocational` = 'education %in% c("None", "Primary", "High School", "Secondary", "Vocational")',
      `Post-Secondary` = 'education %in% c("Undergraduate", "Graduate")'
    ),
    children_under_5 = c(
      Any = "n_child_5 != 0",
      None = "n_child_5 == 0"
    )
  )
  for (v in names(levels)) {
    split_levels[[v]] <- levels[[v]]
  }
  vars <- c(
    "country",
    "year",
    "sex",
    "main_activity",
    "variable",
    "level",
    "count",
    "weight"
  )
  aggregater <- function(svar, ...) {
    if (!exists("top_level")) {
      top_level <- dplyr::group_by(
        do.call(
          wid_subset,
          c(
            list(wid_open(data_dir)),
            substitute(!is.na(wgt)),
            substitute(!is.na(sex)),
            substitute(!is.na(main_activity)),
            data_args
          )
        ),
        country,
        year,
        sex,
        main_activity
      )
    }
    if (svar == "total") {
      totals <- dplyr::summarize(
        dplyr::collect(dplyr::select(top_level, wgt)),
        count = length(wgt),
        weight = sum(wgt),
        .groups = "keep"
      )
      totals$variable <- "total"
      totals$level <- "all"
      totals[, vars]
    } else {
      var_subset <- dplyr::filter(top_level, !is.na(.data[[svar]]))
      do.call(
        rbind,
        lapply(names(split_levels[[svar]]), function(slev) {
          part <- dplyr::summarize(
            dplyr::collect(dplyr::select(
              eval(parse(
                text = paste0(
                  "dplyr::filter(top_level, ",
                  split_levels[[svar]][[slev]],
                  ")"
                )
              )),
              wgt
            )),
            count = length(wgt),
            weight = sum(wgt),
            .groups = "keep"
          )
          part$variable <- svar
          part$level <- slev
          part[, vars]
        })
      )
    }
  }
  cores <- min(cores, length(split_levels))
  res <- do.call(
    rbind,
    if (cores > 1) {
      data_args <- as.list(substitute(...()))
      data_args$selection <- selection
      call_env <- new.env(parent = globalenv())
      call_env$cores <- cores
      call_env$split_levels <- split_levels
      call_env$aggregater <- aggregater
      eval(
        expression({
          cl <- parallel::makeCluster(cores)
          on.exit(parallel::stopCluster(cl))
          parallel::parLapply(cl, names(split_levels), aggregater)
        }),
        envir = call_env
      )
    } else {
      top_level <- dplyr::group_by(
        wid_subset(
          wid_open(data_dir),
          !is.na(wgt),
          !is.na(sex),
          !is.na(main_activity),
          ...,
          selection = selection
        ),
        country,
        year,
        sex,
        main_activity
      )
      lapply(names(split_levels), aggregater)
    }
  )
  res$sex[res$sex] <- "Female"
  res$sex[res$sex == "FALSE"] <- "Male"
  if (length(cell_cutoff) && cell_cutoff) {
    su <- res$count >= cell_cutoff
    message(
      "cell cutoff removed ",
      sum(!su),
      " of ",
      nrow(res),
      " rows, which excludes ",
      sum(res$count[!su]),
      " of ",
      sum(res$count),
      " people."
    )
    res <- res[su, ]
  }
  res
}
