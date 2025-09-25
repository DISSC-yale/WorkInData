#' @rdname wid_update_resources
#' @export

wid_update_isic <- function(
    out_dir = getOption("WID_RESOURCE_DIR"),
    overwrite = FALSE
) {
  out_file <- paste0(out_dir, "/ISIC.xlsx")
  final_file <- paste0(out_dir, "/isic_to_section.rds")
  if (overwrite || !file.exists(out_file)) {
    if (requireNamespace("readxl")) {
      dir.create(out_dir, FALSE, TRUE)
      utils::download.file(
        "https://www.ilo.org/ilostat-files/Documents/ISIC.xlsx",
        out_file,
        mode = "wb"
      )
    } else {
      message("install the `readxl` package to download ISIC classifications")
    }
  }
  if (file.exists(out_file) && (overwrite || !file.exists(final_file))) {
    isic_mapping <- function(sheet, version) {
      isic_codes <- readxl::read_excel(out_file, sheet)
      isic_codes$full_code <- sub("^\\w", "", isic_codes$full_code)
      isic_to_section <- structure(
        rep(isic_codes$section, 5),
        names = paste0(
          version,
          "_",
          unlist(isic_codes[, c(
            "section",
            "full_code",
            "division",
            "class"
          )])
        )
      )
      isic_to_section[
        !duplicated(paste(isic_to_section, names(isic_to_section)))
      ]
    }
    isic_to_section <- c(
      isic_mapping("ISIC_Rev_4", 40),
      isic_mapping("ISIC_Rev_3.1", 31),
      isic_mapping("ISIC_Rev_3", 30),
      `500` = "A",
      `5150` = "G"
    )
    isic_to_section <- c(
      structure(
        isic_to_section,
        names = sub("^.._", "", names(isic_to_section))
      ),
      isic_to_section
    )
    isic_to_section <- isic_to_section[unique(names(isic_to_section))]
    saveRDS(isic_to_section, final_file, compress = "xz")
  }
  if (file.exists(final_file)) {
    readRDS(final_file)
  }
}
