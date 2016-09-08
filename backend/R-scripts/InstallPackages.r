# This script will install all necessary packages to run Synth

install.packages('Synth')
install.packages('RPostgreSQL')
install.packages('devtools')
install.packages('hash')
install.packages('plm')
install.packages('RJSONIO')

require(devtools)
devtools::install_github('gaborcsardi/dotenv')