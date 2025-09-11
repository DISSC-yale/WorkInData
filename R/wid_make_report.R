#' Report Variable Summaries
#'
#' Generate a report of variable summaries.
#' @param reformat_dir Path to the reformatted dataset.
#' @param output Path to write the report to.
#' @return Nothing; creates \code{output} file.
#' @examples
#' \dontrun{
#'
#'   wid_make_report("../gender_growth_gap")
#' }
#' @export

wid_make_report <- function(
  reformat_dir,
  output = "vignettes/articles/variables.Rmd"
) {
  summaries <- wid_variables()
  cats <- c(
    "Sample",
    "Location",
    "Individual",
    "Household",
    "Work",
    "Job",
    "Secondary"
  )
  summary_sets <- split(
    names(summaries),
    vapply(summaries, "[[", "", "category")
  )
  summary_sets <- summary_sets[cats[cats %in% names(summary_sets)]]
  db <- wid_open(reformat_dir)
  files <- list.files(
    reformat_dir,
    "parquet",
    recursive = TRUE,
    full.names = TRUE
  )
  writeLines(
    c(
      paste0(
        c(
          "---",
          'title: "Variables"',
          "---\n",
          "```{r, include = FALSE}",
          "knitr::opts_chunk$set(collapse = TRUE, echo = FALSE)",
          "summaries <- WorkInData::wid_variables()",
          "```"
        ),
        collapse = "\n"
      ),
      paste(
        c(
          paste(
            "Reformatted into parquet files partitioned by `survey` and `year` in",
            length(files),
            "parts:"
          ),
          paste("**Variables**:", ncol(db)),
          paste(
            "**Observations**:",
            prettyNum(as.character(nrow(db)), big.mark = ",")
          ),
          paste(
            "**Size**:",
            paste(round(sum(file.size(files)) / 1024e6, 2), "GB")
          )
        ),
        collapse = "\n\n"
      ),
      "\n",
      unlist(
        lapply(names(summary_sets), function(set) {
          c(
            paste0("# ", set, "\n"),
            unlist(lapply(summary_sets[[set]], function(variable) {
              s <- summaries[[variable]]
              paste0(
                c(
                  paste0("## ", s$name),
                  paste0(s$description),
                  if (!is.null(s$note)) s$note,
                  paste0("**ID**: ", variable),
                  paste0("**Type**: ", s$summary$type),
                  paste0(
                    "**Missing**: ",
                    prettyNum(as.character(s$summary$missing), big.mark = ",")
                  ),
                  paste0("**Value Summary**:"),
                  paste0(
                    c(
                      "```{r}",
                      paste0('s <- summaries[["', variable, '"]]'),
                      "knitr::kable(data.frame(",
                      if (s$summary_type == "table") {
                        paste(
                          "  Level = names(s$summary$value_summary),",
                          "Count = unname(unlist(s$summary$value_summary))"
                        )
                      } else {
                        paste(
                          "  Feature = names(s$summary$value_summary),",
                          "Value = unname(unlist(s$summary$value_summary))"
                        )
                      },
                      paste0(
                        "), row.names = FALSE, digits = 4, ",
                        'format.args = list(big.mark = ",", scientific = FALSE))'
                      ),
                      "```\n"
                    ),
                    collapse = "\n"
                  )
                ),
                collapse = "\n\n"
              )
            }))
          )
        })
      )
    ),
    output
  )
}
