#' Convert ISIC Codes
#'
#' Convert International Standard Industrial Classification (ISIC) codes to
#' aggregate economic activity categories, based on the
#' \href{https://ilostat.ilo.org/methods/concepts-and-definitions/classification-economic-activities/}{International Labour Organization classification}.
#'
#' @param codes A character vector of original ISIC codes, which can be at the
#' section, division, group, class, or 4-digit level. The latest unique classification
#' will be used unless the original code has a revision and/or code type prefix:
#' \code{revision_type_code}, where \code{revision} is one of
#' \code{40_}, \code{31_}, or \code{30_} for revisions \code{4}, \code{3.1}, or \code{3},
#' and \code{type} is one of \code{division}, \code{group}, or \code{class}.
#' @param level Level of dis-aggregation (determining number of categories):
#' \tabular{ll}{
#'   \code{1} \tab Section-level (21 categories).\cr
#'   \code{2} \tab Lowest activity-level (6 categories).\cr
#'   \code{3} \tab Split service sectors (4 categories).\cr
#'   \code{4} \tab Agriculture, Industry, or Services (3 categories).\cr
#'   \code{5} \tab Agricultural or not (2 categories).\cr
#' }
#' @param full_label Logical; if \code{TRUE}, will return full text labels
#' rather than short codes.
#' @return A character vector containing short code or labels.
#' @examples
#' # revision 4 sections by default
#' (codes <- LETTERS[1:21])
#' wid_convert_isic(codes)
#' wid_convert_isic(codes, 1, full_label = TRUE)
#' wid_convert_isic(codes, 2, full_label = TRUE)
#' 
#' # disambiguating in the case of overlaps
#' wid_convert_isic("111", 4, full_label = TRUE)
#' wid_convert_isic("31_111", 4, full_label = TRUE)
#' wid_convert_isic("31_group_111", 4, full_label = TRUE)
#' @export

wid_convert_isic <- function(codes, level = 4L, full_label = FALSE) {
  if (!(level %in% 1:5))
    stop("`level` must be between 1 through 5", call. = FALSE)
  recode <- isic_to_section[as.character(codes)]
  if (full_label || level > 1L) {
    recode <- list(
      c(
        A = "Agriculture",
        B = "Mining",
        C = "Manufacturing",
        D = "Electrical",
        E = "Water",
        `F` = "Construction",
        G = "Trade",
        H = "Transportation",
        I = "Service",
        J = "Information",
        K = "Financial",
        L = "Property",
        M = "Professional",
        N = "Administrative",
        O = "Public",
        P = "Education",
        Q = "Health",
        R = "Arts",
        S = "Other",
        `T` = "Households",
        U = "Extraterritorial"
      ),
      c(
        A = "Agriculture",
        B = "Industry - Resources",
        C = "Industry - Manufacturing",
        D = "Industry - Resources",
        E = "Industry - Resources",
        `F` = "Industry - Construction",
        G = "Services - Market",
        H = "Services - Market",
        I = "Services - Market",
        J = "Services - Market",
        K = "Services - Market",
        L = "Services - Market",
        M = "Services - Market",
        N = "Services - Market",
        O = "Services - Non-Market",
        P = "Services - Non-Market",
        Q = "Services - Non-Market",
        R = "Services - Non-Market",
        S = "Services - Non-Market",
        `T` = "Services - Non-Market",
        U = "Services - Non-Market"
      ),
      c(
        A = "Agriculture",
        B = "Industry",
        C = "Industry",
        D = "Industry",
        E = "Industry",
        `F` = "Industry",
        G = "Services - Market",
        H = "Services - Market",
        I = "Services - Market",
        J = "Services - Market",
        K = "Services - Market",
        L = "Services - Market",
        M = "Services - Market",
        N = "Services - Market",
        O = "Services - Non-Market",
        P = "Services - Non-Market",
        Q = "Services - Non-Market",
        R = "Services - Non-Market",
        S = "Services - Non-Market",
        `T` = "Services - Non-Market",
        U = "Services - Non-Market"
      ),
      c(
        A = "Agriculture",
        B = "Industry",
        C = "Industry",
        D = "Industry",
        E = "Industry",
        `F` = "Industry",
        G = "Services",
        H = "Services",
        I = "Services",
        J = "Services",
        K = "Services",
        L = "Services",
        M = "Services",
        N = "Services",
        O = "Services",
        P = "Services",
        Q = "Services",
        R = "Services",
        S = "Services",
        `T` = "Services",
        U = "Services"
      ),
      c(
        A = "Agriculture",
        B = "Non-Agriculture",
        C = "Non-Agriculture",
        D = "Non-Agriculture",
        E = "Non-Agriculture",
        `F` = "Non-Agriculture",
        G = "Non-Agriculture",
        H = "Non-Agriculture",
        I = "Non-Agriculture",
        J = "Non-Agriculture",
        K = "Non-Agriculture",
        L = "Non-Agriculture",
        M = "Non-Agriculture",
        N = "Non-Agriculture",
        O = "Non-Agriculture",
        P = "Non-Agriculture",
        Q = "Non-Agriculture",
        R = "Non-Agriculture",
        S = "Non-Agriculture",
        `T` = "Non-Agriculture",
        U = "Non-Agriculture"
      )
    )[[level]][recode]
  }
  if (!full_label && level != 1L) {
    recode <- list(
      c(
        Agriculture = "A",
        "Industry - Manufacturing" = "IM",
        "Industry - Resources" = "IR",
        "Industry - Construction" = "IC",
        "Services - Market" = "SM",
        "Services - Non-Market" = "SN"
      ),
      c(
        Agriculture = "A",
        Industry = "I",
        "Services - Market" = "SM",
        "Services - Non-Market" = "SN"
      ),
      c(
        Agriculture = "A",
        Industry = "I",
        Services = "S"
      ),
      c(
        Agriculture = "A",
        "Non-Agriculture" = "N"
      )
    )[[level - 1L]][recode]
  }
  unname(recode)
}
