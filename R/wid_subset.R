#' Subset Dataset
#'
#' Select a subset of the dataset.
#'
#' @param db The dataset to subset; an \code{\link[arrow]{Dataset}}
#' as returned from \code{\link{wid_open}}.
#' @param ... Conditions in the form of \code{variable operator value} (e.g., \code{age > 50}).
#' @param variables A character vector containing the variables you want to require.
#' That is, only observations with values for these variables will be included.
#' @param surveys A character vector of survey abbreviations to include.
#' @param min_year Earliest year to include.
#' @param max_year Latest year to include.
#' @param selection A character vector with country_year_survey IDs to be selected,
#' or a matrix-like object consisting of 3 columns containing country, year, and survey IDs
#' in that order.
#' @return A filtered version of \code{db} if it is provided, or a list with entries
#' for remaining \code{variables}, \code{surveys}, and \code{years}.
#' @example man/examples/wid_subset.R
#' @export

wid_subset <- function(
  db = NULL,
  ...,
  variables = NULL,
  surveys = NULL,
  min_year = -Inf,
  max_year = Inf,
  selection = NULL
) {
  survey <- year <- .data <- NULL
  conditions <- list()
  for (rule in lapply(as.list(substitute(...())), as.list)) {
    negate <- FALSE
    if (rule[[1]] == "!") {
      negate <- TRUE
      rule <- rule[-1]
    }
    if (length(rule) == 1) rule <- as.list(rule[[1]])
    if (length(rule) == 1) rule <- list("(", rule[[1]])
    variable <- as.character(rule[[2]])
    conditions[[variable]] <- c(
      list(
        fun_name = rule[[1]],
        convert = length(rule) < 3,
        fun = get(rule[[1]]),
        value = if (length(rule) > 2) eval(rule[[3]]) else TRUE,
        negate = negate
      ),
      conditions[[variable]]
    )
  }
  if (
    !is.null(db) &&
      !length(conditions) &&
      missing(variables) &&
      missing(surveys) &&
      missing(min_year) &&
      missing(max_year) &&
      is.null(selection)
  ) {
    return(db)
  }
  if (length(conditions)) variables <- unique(c(variables, names(conditions)))
  summary <- wid_summaries
  all_surveys <- unique(unlist(lapply(summary, function(s) names(s$by_survey))))
  all_years <- unique(unlist(lapply(
    summary,
    function(s) lapply(s$by_survey, function(y) names(y))
  )))
  if (!is.null(variables)) {
    su <- !(variables %in% names(summary))
    if (any(su))
      stop(
        "variables not found: ",
        paste(variables[su], collapse = ", "),
        call. = FALSE
      )
    years <- NULL
    for (s in summary[variables]) {
      surveys <- unique(c(surveys, names(s$by_survey)))
      for (y in s$by_survey) {
        years <- unique(c(years, names(y)))
      }
    }
    summary <- lapply(summary, function(s) {
      s$by_survey <- s$by_survey[names(s$by_survey) %in% surveys]
      if (length(s$by_survey)) {
        s$by_survey <- Filter(
          length,
          lapply(s$by_survey, function(y) y[names(y) %in% years])
        )
        if (length(s$by_survey)) s
      }
    })
  }
  if (!is.null(surveys)) {
    su <- all_surveys %in% surveys
    if (!any(all_surveys %in% surveys))
      stop("all surveys are excluded by `surveys`")
  }
  variable_specs <- jsonlite::read_json(
    system.file("variables.json", package = "WorkInData"),
    simplifyVector = TRUE
  )

  selects <- list()
  if (length(conditions)) {
    for (variable in names(conditions)) {
      rule <- conditions[[variable]]
      check <- function(v) {
        pass <- if (rule$convert) rule$fun(v) == rule$value else
          rule$fun(v, rule$value)
        if (rule$negate) !pass else pass
      }
      check_condition <- switch(
        variable_specs[[variable]]$summary_type,
        table = function(s) {
          any(check(names(s)))
        },
        unique = function(s) {
          check(s$first) || check(s$last)
        },
        continuous = function(s) {
          check(s$min) || check(s$max)
        }
      )
      by_survey <- Filter(
        length,
        lapply(summary[[variable]]$by_survey, function(p) {
          Filter(check_condition, p)
        })
      )
      if (!length(by_survey)) {
        stop(
          "condition excludes all observations: ",
          if (rule$negate) "!",
          variable,
          " ",
          rule$fun_name,
          " ",
          rule$value,
          call. = FALSE
        )
      }
      selects[[variable]] <- names(unlist(by_survey, recursive = FALSE))
    }
    selects <- Reduce(intersect, selects)
    selects <- split(sub("^[^.]+\\.", "", selects), sub("\\..*", "", selects))
    if (!is.null(surveys)) {
      selects <- selects[names(selects) %in% surveys]
      if (!length(selects)) {
        stop(
          "no surveys selected between survey selection and conditions",
          call. = FALSE
        )
      }
    }
    selects <- Filter(
      length,
      lapply(selects, function(ys) {
        ys[ys >= min_year & ys <= max_year]
      })
    )
    if (!length(selects)) {
      stop(
        "no years selected between year range and conditions",
        call. = FALSE
      )
    }
  }

  for (variable in names(summary)) {
    s <- summary[[variable]]
    if (length(selects)) {
      s$by_survey <- s$by_survey[names(s$by_survey) %in% names(selects)]
      if (!length(s$by_survey)) {
        summary[[variable]] <- NULL
      } else {
        s$by_survey <- Filter(
          length,
          lapply(
            structure(names(s$by_survey), names = names(s$by_survey)),
            function(survey) {
              y <- s$by_survey[[survey]]
              y[names(y) %in% selects[[survey]]]
            }
          )
        )
        summary[[variable]] <- if (length(s$by_survey)) s else NULL
      }
    } else {
      if (!is.null(surveys)) {
        s$by_survey <- s$by_survey[names(s$by_survey) %in% surveys]
      }
      if (!length(s$by_survey)) {
        summary[[variable]] <- NULL
      } else {
        s$by_survey <- Filter(
          length,
          lapply(s$by_survey, function(s) {
            s[names(s) >= min_year & names(s) <= max_year]
          })
        )
        summary[[variable]] <- if (length(s$by_survey)) s else NULL
      }
    }
  }
  if (!length(summary))
    stop("no variables pass the set criteria", call. = FALSE)
  res <- list(
    variables = sort(names(summary)),
    surveys = sort(unique(unlist(lapply(
      summary,
      function(s) names(s$by_survey)
    )))),
    years = sort(as.integer(unique(unlist(lapply(
      summary,
      function(s) unlist(lapply(unname(s$by_survey), function(y) names(y)))
    )))))
  )
  if (!is.null(db)) {
    if (!all(names(wid_summaries) %in% res$variables)) {
      db <- dplyr::select(db, dplyr::all_of(res$variables))
    }
    if (!all(all_surveys %in% res$surveys))
      db <- dplyr::filter(db, survey %in% res$surveys)
    if (!all(all_years %in% res$years))
      db <- dplyr::filter(db, year %in% res$years)
    if (length(conditions)) db <- dplyr::filter(db, ...)
    if (!is.null(selection)) {
      if (NCOL(selection) != 1L) {
        selection <- do.call(
          paste,
          c(as.list(as.data.frame(selection)), sep = "_")
        )
      }
      db <- dplyr::filter(
        db,
        paste(
          .data[["country"]],
          .data[["year"]],
          .data[["survey"]],
          sep = "_"
        ) %in%
          selection
      )
    }
    db
  } else {
    res
  }
}
