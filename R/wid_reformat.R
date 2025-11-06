#' Reformat Original Data
#'
#' Convert original Work In Data cleaned files to a parquet dataset.
#'
#' @param original_dir Directory containing cleaned data.
#' @param reformat_dir Directory to save the dataset files in.
#' @param selection Character vector specifying a subset of files to include (e.g.,
#' \code{c("AGO_2008_IBEP", "ALB_20.._LFS", "2024")}).
#' @param isic_prefixes A list mapping country_year_survey IDs to ISIC prefixes
#' (\code{30_}, \code{31_}, or \code{40_}, for revisions \code{3}, \code{3.1}, or \code{4}).
#' @param cores Number of CPU cores to use during processing.
#' @param overwrite Logical; if \code{TRUE}, will rewrite existing partitions.
#' @return Nothing; writes files to \code{reformat_dir}.
#' @examples
#' \dontrun{
#'
#'   wid_reformat("../data_cleaned", "../gender_growth_gap")
#' }
#' @export

wid_reformat <- function(
  original_dir,
  reformat_dir,
  selection = NULL,
  isic_prefixes = list(),
  cores = parallel::detectCores() - 2,
  overwrite = FALSE
) {
  dir.create(reformat_dir, FALSE, TRUE)

  reformat_by_survey_year <- function(files) {
    schema <- wid_schema(TRUE)
    write_schema <- wid_schema()
    variable_specs <- jsonlite::read_json(
      system.file("variables.json", package = "WorkInData"),
      simplifyVector = TRUE
    )
    parts <- strsplit(
      regmatches(files[1], gregexpr("\\d{4}_[^/]+", files[1]))[[1]],
      "_"
    )[[1]]
    year <- parts[[1]]
    survey <- parts[[2]]
    out_file <- paste0(
      reformat_dir,
      "/survey=",
      survey,
      "/year=",
      year,
      "/part-0.parquet"
    )
    if (overwrite || !file.exists(out_file)) {
      dir.create(dirname(out_file), FALSE, TRUE)
      files_in_dir <- split(files, dirname(files))
      data <- Filter(
        length,
        lapply(files_in_dir, function(fs) {
          if (length(fs)) {
            d <- lapply(fs, function(f) {
              cols <- strsplit(readLines(f, n = 1L), ",")[[1]]
              tryCatch(
                arrow::read_csv_arrow(
                  gzfile(f),
                  schema = schema[cols],
                  skip = 1,
                  na = c("", " ", "NA"),
                  skip_empty_rows = FALSE,
                  as_data_frame = FALSE
                ),
                error = function(e) NULL
              )
            })
            failed <- vapply(d, is.null, TRUE)
            if (any(failed))
              stop("invalid file(s): ", paste0(fs[failed], collapse = ", "))
            rows <- vapply(d, nrow, 0)
            if (length(unique(rows)) != 1) {
              warning(
                "files in ",
                dirname(fs[1]),
                " have inconsistent rows: ",
                paste(paste0(basename(fs), " (", rows, ")"), collapse = ", ")
              )
              d[which.min(rows)] <- NULL
            }
            d <- do.call(cbind, d)

            # combine overlapping self-employment variables
            d$main_job_pay <- NA_real_
            d$main_job_pay_freq <- NA_integer_
            d$sec_job_pay <- NA_real_
            d$sec_job_pay_freq <- NA_integer_
            d$main_job_duration <- NA_real_
            d$main_job_duration_unit <- NA_integer_
            d$main_job_loc <- NA_integer_
            collapse_pairs <- list(
              c("main_se_earnings", "main_we_wage"),
              c("main_se_earnings_freq", "main_we_wage_freq"),
              c("sec_se_earnings", "sec_we_wage"),
              c("sec_se_earnings_freq", "sec_we_wage_freq"),
              c("main_se_loc", "main_we_loc"),
              c("main_se_duration", "main_we_duration"),
              c("main_se_duration_unit", "main_we_duration_unit"),
              c("main_we_loc", "main_job_loc"),
              c("main_we_wage", "main_job_pay"),
              c("main_we_wage_freq", "main_job_pay_freq"),
              c("sec_we_wage", "sec_job_pay"),
              c("sec_we_wage_freq", "sec_job_pay_freq"),
              c("main_we_duration", "main_job_duration"),
              c("main_we_duration_unit", "main_job_duration_unit")
            )
            variables <- colnames(d)
            for (pairs in collapse_pairs) {
              if (all(pairs %in% variables)) {
                su <- as.vector(is.na(d[[pairs[2]]]))
                p1 <- as.vector(d[[pairs[2]]])
                p1[su] <- as.vector(d[[pairs[1]]][su])
                d[[pairs[2]]] <- p1
              }
            }

            # conversions
            variables <- colnames(d)
            to_drop <- NULL
            for (variable in variables) {
              spec <- variable_specs[[variable]]
              if (!is.null(spec)) {
                conversion <- spec$conversion
                if (!is.null(conversion)) {
                  if (!is.null(conversion$levels)) {
                    if (!is.null(conversion$zero_level)) {
                      d[[variable]] <- conversion$levels[
                        as.integer(d[[variable]]) + 1L
                      ]
                    } else {
                      d[[variable]] <- conversion$levels[as.integer(d[[
                        variable
                      ]])]
                    }
                  } else if (!is.null(conversion$reference)) {
                    if (conversion$reference %in% variables) {
                      to_drop <- c(to_drop, conversion$reference)
                      d[[variable]] <- arrow::chunked_array(
                        as.numeric(d[[variable]]) *
                          conversion$factors[
                            as.integer(d[[conversion$reference]]) + 1L
                          ],
                        type = arrow::float32()
                      )
                    } else {
                      warning(
                        "conversion reference ",
                        conversion$reference,
                        " is not present in data for ",
                        variable,
                        " in ",
                        dirname(fs[[1]]),
                        call. = FALSE
                      )
                    }
                  } else if (
                    !is.null(conversion$type) && conversion$type == "bool"
                  ) {
                    d[[variable]] <- d[[variable]] == conversion$true_value
                  }
                }
              }
            }
            # for (variable in c("main_se_employees", "main_job_duration")) {
            #   if (variable %in% variables) {
            #     d[[variable]] <- d[[variable]]$cast(write_schema[[variable]]$type)
            #   }
            # }
            country <- strsplit(basename(dirname(fs[1])), "_")[[1]][[1]]
            d$country <- country
            survey_id <- paste(country, year, survey, sep = "_")
            if (
              "main_job_ind" %in%
                colnames(d) &&
                !is.null(isic_prefixes[[survey_id]])
            ) {
              main_job_inds <- d$main_job_ind$as_vector()
              su <- !is.na(main_job_inds)
              main_job_inds[su] <- paste0(
                isic_prefixes[[survey_id]],
                main_job_inds[su]
              )
              d$main_job_ind <- main_job_inds
            }
            d[, colnames(d) %in% names(write_schema)]
          }
        })
      )
      if (length(data)) {
        all_vars <- names(write_schema)
        data <- do.call(
          rbind,
          lapply(data, function(d) {
            missing_vars <- all_vars[!(all_vars %in% colnames(d))]
            if (length(missing_vars)) {
              cbind(
                d,
                arrow::as_arrow_table(
                  as.data.frame(arrow::arrow_table(
                    schema = write_schema[missing_vars]
                  ))[seq_len(nrow(d)), ],
                  schema = write_schema[missing_vars]
                )
              )[, all_vars]
            } else {
              d[, all_vars]
            }
          })
        )
        main_activity <- rep(NA_character_, nrow(data))
        su <- !is.na(data$work) & !data$work
        main_activity[su] <- "Out of Workforce"
        main_activity[(su &
          !is.na(data$work_search) &
          data$work_search)$as_vector()] <- "Unemployed"
        su <- (!is.na(data$work) &
          data$work &
          !is.na(data$main_job_ind))$as_vector()
        main_activity[su] <- wid_convert_isic(
          isic_to_section[as.character(data$main_job_ind[su])],
          full_label = TRUE
        )
        data$main_activity <- main_activity
        arrow::write_parquet(data, out_file, compression = "gzip")
      }
    }
    NULL
  }

  all_files <- list.files(
    original_dir,
    "v2",
    full.names = TRUE,
    recursive = TRUE
  )
  if (!is.null(selection)) {
    all_files <- grep(
      paste(selection, collapse = "|"),
      all_files,
      value = TRUE,
      perl = TRUE
    )
  }
  file_sets <- unlist(
    lapply(
      split(
        all_files,
        sub(
          "^[^_]+_",
          "",
          unlist(
            regmatches(all_files, gregexpr("\\d{4}_[^/]+", all_files))
          )
        )
      ),
      function(l) split(l, unlist(regmatches(l, gregexpr("\\d{4}", l))))
    ),
    recursive = FALSE
  )

  if (cores > 1) {
    call_env <- new.env(parent = globalenv())
    call_env$overwrite <- overwrite
    call_env$cores <- cores
    call_env$reformat_dir <- reformat_dir
    call_env$isic_prefixes <- isic_prefixes
    call_env$file_sets <- file_sets
    call_env$reformat_by_survey_year <- reformat_by_survey_year
    environment(reformat_by_survey_year) <- call_env
    eval(
      expression({
        cl <- parallel::makeCluster(cores)
        parallel::parLapplyLB(cl, file_sets, reformat_by_survey_year)
        on.exit(parallel::stopCluster(cl))
      }),
      envir = call_env
    )
  } else {
    for (files in file_sets) {
      reformat_by_survey_year(files)
    }
  }
}
