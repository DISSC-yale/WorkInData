# Work In Data

An R package to reformat and work with the
[Work in Data](https://sites.google.com/site/gottliebcharles/work-in-data) dataset.

## Data Access

Aggregated data are available in [gender_gap/public/data.csv.gz](https://github.com/dissc-yale/WorkInData/tree/main/gender_gap/public/data.csv.gz).

You can load this into R directly:

```R
data <- vroom::vroom("https://dissc-yale.github.io/WorkInData/gender_gap/data.csv.gz")
```

See the [Gender, Labor & Growth](https://dissc-yale.github.io/WorkInData/gender_gap) site to explore these or download in a different format.

Microdata are not currently accessible externally.

## Package Installation

Install the package from an R console:

```R
# install.packages("remotes")
remotes::install_github("dissc-yale/WorkInData")
```

Then load the package:

```R
library(WorkInData)
```

See the [introduction](https://dissc-yale.github.io/WorkInData/articles/WorkInData.html) for more.
