# Sample diff-in-diff analysis replicating work done by Sommers, Baicker,
# and Epstein on the effects of Medicaid expansion on mortality (NEJM 2012).

# Note that this is just a basic approximation of the analysis, using the
# functionality already available in Sociome. Some additional notes on
# what the study authors did differently:
# 1) The authors looked at three states that expanded Medicaid, and 1-2 neighboring
#    control states for each. Because not all of the treatment states expanded in
#    the same year, outcome times were normalized such that the expansion year was
#    considered year 0 for each treatment state and its corresponding control(s).
#    Here, we consider just one pairwise comparison between Maine and New Hampshire.
# 2) The authors use a more involved regression model, a GLM with robust standard
#    errors clustered at the state level. Here, we're taking a simpler linear
#    regression approach. The additional statistical functionality probably isn't
#    too important for our needs, since we're mainly trying to illustrate the ease
#    of putting together a simple analysis on the platform, but it's worth keeping
#    in mind.
# 3) The authors likely controlled for a different set of covariates, but we use a 
#    selection of the basic demographic factors available in the data.

require(Synth)
require(RPostgreSQL)
require(dotenv)
require(hash)
require(RJSONIO)

stateCodes = hash('Alabama'=1 ,'Alaska'=2 ,'Arizona'=4 ,'Arkansas'=5 ,'California'=6 ,'Colorado'=8 ,'Connecticut'=9 ,'Delaware'= 10 ,
                  'District of Columbia'= 11 ,'Florida'= 12 ,'Georgia'= 13 ,'Hawaii'= 15 ,'Idaho'= 16 ,'Illinois'= 17 ,'Indiana'= 18 ,
                  'Iowa'= 19 ,'Kansas'= 20 ,'Kentucky'= 21 ,'Louisiana'= 22 ,'Maine'= 23 ,'Maryland'= 24 ,'Massachusetts'= 25 ,
                  'Michigan'= 26 ,'Minnesota'= 27 ,'Mississippi'= 28 ,'Missouri'= 29 ,'Montana'= 30 ,'Nebraska'= 31 ,'Nevada'= 32 ,
                  'New Hampshire'= 33 ,'New Jersey'= 34 ,'New Mexico'= 35 ,'New York'= 36 ,'North Carolina'= 37 ,'North Dakota'= 38 ,
                  'Ohio'= 39 ,'Oklahoma'= 40 ,'Oregon'= 41 ,'Pennsylvania'= 42 ,'Rhode Island'= 44 ,'South Carolina'= 45 ,'South Dakota'= 46 ,
                  'Tennessee'= 47 ,'Texas'= 48 ,'Utah'= 49 ,'Vermont'= 50 ,'Virginia'= 51 ,'Washington'= 53 ,'West Virginia'= 54 ,
                  'Wisconsin'= 55 ,'Wyoming'= 56)

user <- ''
pwd <- ''
db_name <- 'sociome'
host <- 'localhost'
port <- ''


# Adapted from runDiffInDiff function, but just returns dataframe for flexibility
# Two notes: 
# 1) User should be able to specify a control group as well
# 2) Not sure about using countycode = 0, it seems to me we might want to keep
#    county-level data disaggregated where possible

getDF <- function(predVars, depVar, treatmentGroup, controlGroup, yearOfTreatment){
  conn <- dbConnect(PostgreSQL(), host=host, dbname=db_name, user=user,password=pwd, port=port);
  
  # Only select the non-NULL predictive variables
  nullCond <- paste(
    sapply(predVars, function(p){
      return(paste('demographics.', p, ' IS NOT NULL', sep=''));
    }), 
    collapse=' AND '
  )
  
  query = paste('
                SELECT 
                demographics.year,
                demographics.state,
                health_outcomes.statecode ',
                paste(
                  sapply(predVars, function(p){
                    return(paste(',demographics.', p, sep=''));
                  }),
                  collapse = ''), ',',
                ' health_outcomes.', depVar, '->\'rawvalue\' as depvar ', 
                'FROM demographics ',
                'INNER JOIN health_outcomes ON ', 
                'demographics.year=health_outcomes.year AND ',
                'demographics.state=health_outcomes.county ',
                'WHERE ',
                'demographics.countycode=0 AND ',
                nullCond, ' AND ',
                'health_outcomes.', depVar, ' IS NOT NULL AND ',
                'demographics.state <> \'District of Columbia\' ',
                'ORDER BY state'
                , sep='')
  
  dataframe <- dbGetQuery(conn, query)
  
  dataframe$time = ifelse(dataframe$year >= yearOfTreatment, 1, 0)
  
  dataframe$treated = ifelse(Vectorize(function(country){
    return(country %in% treatmentGroup)
  })(dataframe$state), 1, 0);
  
  dataframe = subset(dataframe, state %in% treatmentGroup | state %in% controlGroup)
  
  dataframe$did <- dataframe$time * dataframe$treated
  
  # NOTE: query returns depvar as a string after DB update; must convert to numeric
  dataframe$depvar = as.numeric(dataframe$depvar)
  
  return(dataframe)
}


# Note: it seems the query does not work if there are no predVars
# Treatment-control pairs: Maine-New Hampshire, New York-Pennsylvania, Arizona-(Nevada, New Mexico)
predVars = c("population_wh_hisp_latino", "population_black_afr_am", "population_65_plus", 
             "population_female", "per_capita_income")
depVar = "premature_death"
treatmentGroup = "Maine"
controlGroup = "New Hampshire"
yearOfTreatment = 2002

# For some reason, it looks like the query does not return the full range of results?
# Exploring the data, I can see that we have premature death statistics for more years
#   than are returned in this dataframe
df = getDF(predVars, depVar, treatmentGroup, controlGroup, yearOfTreatment)
df.treat = df[df$treated == 1,]
df.treat = df.treat[order(df.treat$year),]
df.control = df[df$treated == 0,]
df.control = df.control[order(df.control$year),]

# This is a simple plot to demonstrate, but could use ggplot or whatever other tools
#   you like
plot(df.treat$year, df.treat$depvar, type = 'l', col = 'blue', ylim = c(5000, 8000),
     xlab = "Year", ylab = "Premature mortality")
lines(df.control$year, df.control$depvar, col = 'red')
abline(v = yearOfTreatment, lty = 2)
legend("topright", c("Treatment", "Control"), lty = 1, col = c('blue', 'red'))

# Regression object
# Don't forget to include control vars in formula!
didreg = lm(depvar ~ ., data = subset(df, select = -c(year, state, statecode)))
summary(didreg)
plot(didreg)
