# Variables

Reformatted into parquet files partitioned by `survey` and `year` in 448
parts:

**Variables**: 16

**Observations**: 231,823,382

**Size**: 1.58 GB

## Sample

### Survey

Initials of the source survey.

**ID**: survey

**Type**: string

**Missing**: 0

**Value Summary**:

| Level     |      Count |
|:----------|-----------:|
| BHPS      |    238,996 |
| CASEN     |  2,771,639 |
| CFPS      |    135,421 |
| CPS-IPUMS |  9,427,892 |
| ECAM      |     46,090 |
| ECE       |    630,239 |
| ECH       |  1,678,605 |
| ECVMA     |     47,796 |
| EH        |    447,300 |
| EHCVM     |    219,390 |
| EICV      |     66,938 |
| EMICOV    |     17,043 |
| ENAHO     |  1,453,907 |
| ENEMDU    |  2,774,243 |
| ENES      |    106,936 |
| ENOE      | 24,303,173 |
| ENPE      |  3,705,280 |
| EULFS     | 45,144,526 |
| GEIH      |  9,860,126 |
| GLSS      |    212,703 |
| HILDA     |    341,170 |
| HLFS      |  8,706,630 |
| IBEP      |     58,953 |
| IHS       |     40,608 |
| ILCS      |    230,050 |
| ILFS      |    171,391 |
| IPUMS     | 37,571,867 |
| KCHSP     |    240,183 |
| KLIPS     |    269,397 |
| LFCLS     |     79,653 |
| LFS       | 61,280,991 |
| LSMS      |    512,019 |
| NBHS      |     48,845 |
| NLFS      |    471,306 |
| NSS       |  4,259,890 |
| PLFS      |  5,392,638 |
| PNAD      |  2,202,843 |
| PSLM      |  2,139,291 |
| QLFS      |  4,431,677 |
| RLMS      |    244,223 |
| SILC      |    139,907 |

### Year

Year in which the survey was conducted.

**ID**: year

**Type**: int32

**Missing**: 0

**Value Summary**:

| Level |      Count |
|:------|-----------:|
| 1960  |    576,517 |
| 1962  |     90,236 |
| 1963  |    256,171 |
| 1967  |    150,835 |
| 1968  |    151,766 |
| 1969  |    145,002 |
| 1970  |  1,886,237 |
| 1971  |    140,345 |
| 1972  |    369,805 |
| 1973  |  1,153,530 |
| 1974  |    130,066 |
| 1975  |    135,351 |
| 1976  |    441,969 |
| 1977  |    155,706 |
| 1978  |    154,593 |
| 1979  |    181,488 |
| 1980  |  1,282,509 |
| 1981  |    609,276 |
| 1982  |  1,676,512 |
| 1983  |    573,263 |
| 1984  |    161,362 |
| 1985  |  1,347,311 |
| 1986  |    640,281 |
| 1987  |  3,013,418 |
| 1988  |  2,010,712 |
| 1989  |  1,294,643 |
| 1990  |  4,676,875 |
| 1991  |  2,802,570 |
| 1992  |  2,233,854 |
| 1993  |  1,990,889 |
| 1994  |  2,290,725 |
| 1995  |  2,525,712 |
| 1996  |  2,919,918 |
| 1997  |  2,147,462 |
| 1998  |  2,671,661 |
| 1999  |  2,658,202 |
| 2000  |  5,218,593 |
| 2001  |  4,418,129 |
| 2002  |  4,550,018 |
| 2003  |  3,318,114 |
| 2004  |  3,910,772 |
| 2005  | 10,343,371 |
| 2006  | 10,740,706 |
| 2007  | 10,364,801 |
| 2008  | 11,550,758 |
| 2009  | 12,603,944 |
| 2010  | 12,848,149 |
| 2011  | 11,500,483 |
| 2012  | 10,961,928 |
| 2013  | 12,144,568 |
| 2014  | 12,339,645 |
| 2015  | 10,126,184 |
| 2016  |  8,670,506 |
| 2017  | 10,218,122 |
| 2018  |  7,114,535 |
| 2019  |  6,726,283 |
| 2020  |  2,786,950 |
| 2021  |  1,644,443 |
| 2022  |  1,610,456 |
| 2023  |    763,545 |

### Survey Year

Survey year for panel construction.

**ID**: survey_year

**Type**: int16

**Missing**: 136,322,743

**Value Summary**:

| Level |     Count |
|:------|----------:|
| 1968  |   150,835 |
| 1969  |   151,766 |
| 1970  |   145,002 |
| 1971  |   146,783 |
| 1972  |   140,345 |
| 1973  |   136,136 |
| 1974  |   133,209 |
| 1975  |   130,066 |
| 1976  |   135,351 |
| 1977  |   160,799 |
| 1978  |   155,706 |
| 1979  |   154,593 |
| 1980  |   181,488 |
| 1981  |   181,358 |
| 1982  |   162,703 |
| 1983  |   162,635 |
| 1984  |   161,167 |
| 1985  |   161,362 |
| 1986  |   157,661 |
| 1987  |   155,468 |
| 1988  |   155,980 |
| 1989  |   144,687 |
| 1990  |   158,079 |
| 1991  |   168,741 |
| 1992  |   190,791 |
| 1993  |   174,859 |
| 1994  |   170,243 |
| 1995  |   169,231 |
| 1996  |   157,386 |
| 1997  |   163,477 |
| 1998  |   171,053 |
| 1999  |   174,880 |
| 2000  |   219,114 |
| 2001  |   502,822 |
| 2002  |   456,990 |
| 2003  |   625,547 |
| 2004  |   719,282 |
| 2005  | 6,378,108 |
| 2006  | 5,234,255 |
| 2007  | 5,443,730 |
| 2008  | 5,573,637 |
| 2009  | 5,590,231 |
| 2010  | 6,499,040 |
| 2011  | 5,834,099 |
| 2012  | 6,144,634 |
| 2013  | 6,053,614 |
| 2014  | 5,744,170 |
| 2015  | 5,589,349 |
| 2016  | 5,927,241 |
| 2017  | 6,062,195 |
| 2018  | 3,847,499 |
| 2019  | 3,733,313 |
| 2020  | 1,539,073 |
| 2021  | 1,534,826 |
| 2022  | 1,617,055 |
| 2023  |   909,678 |

### Sampling Weight

Weight provided in the source survey; either cross-sectional or panel.

**ID**: wgt

**Type**: float

**Missing**: 1,167,729

**Value Summary**:

| Feature |                    Value |
|:--------|-------------------------:|
| min     |                   0.0000 |
| mean    |  15,973,843,485,038.1367 |
| sd      |  92,423,848,337,605.9844 |
| median  |                 121.5468 |
| max     | 999,997,973,725,184.0000 |

## Location

### Country

Country in which the survey was conducted.

**ID**: country

**Type**: string

**Missing**: 0

**Value Summary**:

| Level |      Count |
|:------|-----------:|
| AGO   |     58,953 |
| ALB   |    168,445 |
| ARM   |    390,823 |
| AUS   |    341,170 |
| AUT   |  2,579,766 |
| BEL   |  1,391,159 |
| BEN   |     59,386 |
| BFA   |    709,273 |
| BGR   |    932,793 |
| BLR   |    242,985 |
| BOL   |    447,300 |
| BRA   |  4,418,755 |
| BTN   |    108,414 |
| BWA   |    503,051 |
| CAN   | 41,346,995 |
| CHE   |    964,321 |
| CHL   |  3,707,868 |
| CHN   |    135,421 |
| CIV   |     61,116 |
| CMR   |     46,090 |
| COL   | 10,843,296 |
| CRI   |    986,580 |
| CYP   |    576,925 |
| CZE   |  2,014,124 |
| DNK   |  1,626,609 |
| DOM   |    652,357 |
| ECU   |  3,511,779 |
| EGY   |  5,111,878 |
| ESP   |  2,623,202 |
| EST   |    313,396 |
| ETH   |    471,306 |
| FIN   |    852,910 |
| FJI   |    170,695 |
| FRA   |  6,281,409 |
| GBR   |    238,996 |
| GEO   |    373,626 |
| GHA   |    212,703 |
| GIN   |  1,126,924 |
| GNB   |     42,839 |
| GRC   |  3,846,481 |
| HRV   |    557,434 |
| HUN   |  3,907,224 |
| IDN   |  2,509,418 |
| IND   |  9,652,528 |
| IRL   |  3,088,807 |
| IRN   |    747,286 |
| IRQ   |    735,497 |
| ISL   |    171,834 |
| ISR   |    615,123 |
| JAM   |    661,472 |
| JOR   |  2,584,948 |
| KEN   |    240,183 |
| KGZ   |    885,871 |
| KHM   |     88,787 |
| KOR   |    269,397 |
| LAO   |    560,480 |
| LBR   |    348,057 |
| LKA   |    542,400 |
| LSO   |    180,208 |
| LTU   |    817,087 |
| LUX   |    476,069 |
| LVA   |    484,579 |
| MAR   |  2,084,035 |
| MEX   | 26,047,416 |
| MLI   |  1,931,506 |
| MLT   |    228,059 |
| MNG   |    676,262 |
| MWI   |  1,074,638 |
| MYS   |  1,141,790 |
| NAM   |    196,818 |
| NER   |     47,796 |
| NGA   |    113,152 |
| NLD   |  1,917,341 |
| NOR   |    411,954 |
| NPL   |    985,728 |
| PAK   |  2,591,309 |
| PAN   |  1,008,409 |
| PER   |  1,453,907 |
| PHL   | 11,050,526 |
| PNG   |    499,203 |
| POL   |  4,281,030 |
| PRT   |  2,358,287 |
| PRY   |  1,493,920 |
| PSE   |  1,873,527 |
| ROU   |  3,314,669 |
| RUS   |    244,223 |
| RWA   |    353,474 |
| SDN   |     48,845 |
| SEN   |  1,607,213 |
| SLE   |     40,608 |
| SRB   |    139,907 |
| SSD   |    542,765 |
| SVK   |  1,457,404 |
| SVN   |    916,118 |
| SWE   |  3,034,944 |
| TGO   |    510,737 |
| TUN   |  3,705,280 |
| TUR   |  1,235,380 |
| TZA   |    615,045 |
| UGA   |    525,306 |
| URY   |  2,480,858 |
| USA   |  9,427,892 |
| VEN   |  1,188,303 |
| VNM   |    384,782 |
| YEM   |     85,850 |
| ZAF   |  4,431,677 |
| ZMB   |  1,667,421 |
| ZWE   |     79,653 |

### Rural

Whether the respondent’s location is classified as rural.

**ID**: rural

**Type**: bool

**Missing**: 56,809,414

**Value Summary**:

| Level |       Count |
|:------|------------:|
| FALSE | 110,490,353 |
| TRUE  |  65,108,709 |

## Individual

### Individual ID

Individual identifier.

**ID**: id_ind

**Type**: string

**Missing**: 0

**Value Summary**:

| Feature | Value                              |
|:--------|:-----------------------------------|
| first   | 0000000001_1                       |
| last    | ffec87c6ae87498f956723afe69266b9_4 |
| unique  | 97.1% in first 10,000,000          |

### Age

Respondents age.

**ID**: age

**Type**: int32

**Missing**: 633,014

**Value Summary**:

| Feature |    Value |
|:--------|---------:|
| min     |   0.0000 |
| mean    |  34.6279 |
| sd      |  21.6416 |
| median  |  32.4115 |
| max     | 810.0000 |

### Sex

Whether the respondent reported being female.

**ID**: sex

**Type**: bool

**Missing**: 576,976

**Value Summary**:

| Level |       Count |
|:------|------------:|
| FALSE | 113,081,263 |
| TRUE  | 118,463,536 |

### Marital Status

Marital status of the respondent.

**ID**: marital_status

**Type**: string

**Missing**: 14,610,030

**Value Summary**:

| Level                            |       Count |
|:---------------------------------|------------:|
| Divorced / Separated / Widowed   |  22,031,187 |
| Married / In-Union / Co-Habiting | 104,414,353 |
| Never Married                    |  91,103,746 |

### Education

Highest level of education completed.

**ID**: education

**Type**: string

**Missing**: 22,716,696

**Value Summary**:

| Level         |      Count |
|:--------------|-----------:|
| Graduate      |  4,525,233 |
| High School   | 42,260,965 |
| None          | 44,059,222 |
| Primary       | 34,418,208 |
| Secondary     | 40,140,817 |
| Undergraduate | 18,508,754 |
| Vocational    | 25,611,454 |

## Household

### Children Under 5

Number of children under 5 within the household.

**ID**: n_child_5

**Type**: int16

**Missing**: 59,692,991

**Value Summary**:

| Feature |   Value |
|:--------|--------:|
| min     |  0.0000 |
| mean    |  0.3692 |
| sd      |  0.7075 |
| median  |  0.0000 |
| max     | 21.0000 |

## Work

### Working

Whether the respondent worked in the reference period.

**ID**: work

**Type**: bool

**Missing**: 35,831,632

**Value Summary**:

| Level |      Count |
|:------|-----------:|
| FALSE | 99,481,637 |
| TRUE  | 97,505,951 |

### Looking for Work

Whether the respondent is looking for work, given that they are not
currently working.

**ID**: work_search

**Type**: bool

**Missing**: 142,967,339

**Value Summary**:

| Level |      Count |
|:------|-----------:|
| FALSE | 80,348,629 |
| TRUE  |  8,692,629 |

## Job

### Industry Classification

Industry classification (International Standard Industrial
Classification; ISIC).

**ID**: main_job_ind

**Type**: string

**Missing**: 127,973,177

**Value Summary**:

| Feature | Value        |
|:--------|:-------------|
| first   | 30_A         |
| last    | 40_group_990 |
| unique  | 1813         |

### Job Activity Category

If working, the industry sector of the job; otherwise, either unemployed
or out of workforce.

**ID**: main_activity

**Type**: string

**Missing**: 37,232,854

**Value Summary**:

| Level            |      Count |
|:-----------------|-----------:|
| Agriculture      | 16,154,846 |
| Industry         | 20,849,566 |
| Out of Workforce | 90,789,008 |
| Services         | 59,108,238 |
| Unemployed       |  8,692,629 |
