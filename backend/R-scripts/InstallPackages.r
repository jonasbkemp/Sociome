# This script will install all necessary packages to run Synth

install.packages('Synth', repos="http://cran.rstudio.com/")
install.packages('RPostgreSQL', repos="http://cran.rstudio.com/")
install.packages('devtools', repos="http://cran.rstudio.com/")
install.packages('hash', repos="http://cran.rstudio.com/")
install.packages('RJSONIO', repos="http://cran.rstudio.com/")
install.packages('Rserve', repos="http://cran.rstudio.com/")

require(devtools)
devtools::install_github('gaborcsardi/dotenv', repos="http://cran.rstudio.com/")