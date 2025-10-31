#' @rdname wid_update_resources
#' @export

wid_update_isic <- function(
  out_dir = getOption("WID_RESOURCE_DIR"),
  overwrite = FALSE
) {
  out_file <- paste0(out_dir, "/un_isic.csv")
  final_file <- paste0(out_dir, "/isic_to_section.rds")
  if (overwrite || !file.exists(final_file)) {
    if (file.exists(out_file)) {
      raw_codes <- vroom::vroom(out_file)
    } else {
      raw_codes <- do.call(
        rbind,
        lapply(
          c("4", "3_1", "3"),
          function(version) {
            raw <- vroom::vroom(
              paste0(
                "https://unstats.un.org/unsd/classifications/Econ/Download/In%20Text/ISIC_Rev_",
                version,
                "_english_structure.txt"
              ),
              col_types = list(Code = "c", Description = "c")
            )
            raw$Revision <- c("3" = 30, "3_1" = 31, "4" = 40)[version]
            raw$Section <- NA_character_
            raw$Type <- c("section", "division", "group", "class")[nchar(
              raw$Code
            )]
            last_section <- ""
            is_section <- grepl("^[A-Z]$", raw$Code)
            for (i in seq_along(raw$Section)) {
              if (is_section[[i]]) last_section <- raw$Code[[i]]
              raw$Section[[i]] <- last_section
            }
            raw[, c("Revision", "Section", "Type", "Code", "Description")]
          }
        )
      )
      vroom::vroom_write(raw_codes, out_file, ",")
    }
    isic_to_section <- structure(
      raw_codes$Section,
      names = sub(
        "section_",
        "",
        do.call(
          paste,
          c(as.list(raw_codes[, c("Revision", "Type", "Code")]), sep = "_")
        ),
        fixed = TRUE
      )
    )
    rev3_to_4 <- c(B = "A", C = "B", D = "C", L = "O", M = "P", N = "Q")
    su <- grepl("^3", names(isic_to_section)) &
      isic_to_section %in% names(rev3_to_4)
    isic_to_section[su] <- rev3_to_4[isic_to_section[su]]
    isic_to_section <- c(
      isic_to_section,
      structure(
        isic_to_section,
        names = sub("_0", "_", names(isic_to_section), fixed = TRUE)
      ),
      structure(
        isic_to_section,
        names = sub("_[^_]+", "", names(isic_to_section))
      ),
      structure(
        isic_to_section,
        names = sub(
          "_0",
          "_",
          sub("_[^_]+", "", names(isic_to_section)),
          fixed = TRUE
        )
      ),
      structure(
        isic_to_section,
        names = sub("^.*_", "", names(isic_to_section))
      ),
      structure(
        isic_to_section,
        names = sub("^.*_0?", "", names(isic_to_section))
      )
    )
    isic_to_section <- isic_to_section[unique(names(isic_to_section))]
    saveRDS(isic_to_section, final_file, compress = "xz")
  }
  if (file.exists(final_file)) {
    readRDS(final_file)
  }
}
