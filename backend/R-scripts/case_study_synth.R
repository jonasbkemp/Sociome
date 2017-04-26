# Sample synth analysis, also modeled on study by Sommers, Baicker,
# and Epstein on the effects of Medicaid expansion on mortality (NEJM 2012).

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


# Adapted from runSynth function, returns dataprep and synth data structures
runSynth <- function(predVars, depVar, treatment, controlIdentifiers, yearOfTreatment){
  conn <- dbConnect(PostgreSQL(), host=host, dbname=db_name, user=user,password=pwd, port=port);
  
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
  
  if(nrow(dataframe) == 0){
    print('No common data')
    return()
  }
  
  # NOTE: query returns depvar as a string after DB update; must convert to numeric
  dataframe$depvar = as.numeric(dataframe$depvar)
  
  years = sort(unique(dataframe[1])$year)
  priorYears = years[years < yearOfTreatment]
  
  print('------Args-------')
  print(predVars)
  print(treatment)
  print(controlIdentifiers)
  print('------------------')
  
  dataprep.out = tryCatch({
    dataprep(
      foo=dataframe,
      predictors=c(predVars),
      predictors.op=c("mean"),
      dependent=c('depvar'),
      unit.variable=c("statecode"),
      time.variable=c("year"),
      treatment.identifier=stateCodes[[treatment]],
      controls.identifier=controlIdentifiers,
      unit.names.variable=c("state"),
      time.predictors.prior = priorYears, 
      time.optimize.ssr = priorYears,
      time.plot = years  # Need this argument to plot over the full time horizon
    )},
    error = function(err){
      return(err);
    }
  )
  
  if(is(dataprep.out, 'error')){
    print('Data prep failed')
    print(dataprep.out$message)
    return()
  }
  
  res = tryCatch({
    synth(dataprep.out)
  }, error = function(e){
    return (e);
  })
  
  if(is(res, 'error')){
    print('Synth failed')
    print(res$message)
    return()
  }
  
  return(list(dataprep.out, res))
}


# Treatment-control pairs: Maine-New Hampshire, New York-Pennsylvania, Arizona-(Nevada, New Mexico)
predVars = c("population_wh_hisp_latino", "population_black_afr_am", "population_65_plus", 
             "population_female", "per_capita_income")
depVar = "premature_death"
treatment = "Maine"
controlIdentifiers = c("New Hampshire", "Pennsylvania", "Nevada", "New Mexico")
yearOfTreatment = 2003

synth.out = runSynth(predVars, depVar, treatment, controlIdentifiers, yearOfTreatment)

# Generate outcome table
tabs = synth.tab(synth.out[[2]], synth.out[[1]])

# Generate plots of interest
path.plot(synth.out[[2]], synth.out[[1]], Ylab = 'Premature mortality', Xlab = 'Year', tr.intake = yearOfTreatment)
gaps.plot(synth.out[[2]], synth.out[[1]], Ylab = 'Premature mortality', Xlab = 'Year', tr.intake = yearOfTreatment)

# Unfortunately, simple functions to generate placebo test plots are not included in the package.
# To create a placebo test plot requires the following steps:
#   1) Run synth for the true treatment and control groups, as usual.
#   2) For each state in the control group, swap with the treatment state and run synth again.
#   3) Since you cannot directly use gaps.plot, you will have to generate the gap data yourself from
#      the output of synth. This can be done with the following code:
#   
#        gaps = dataprep.out$Y1plot - (dataprep.out$Y0plot %*% synth.out$solution.w)
#   
#   4) Create a plot that looks like the output of gaps.plot, but with results from all n+1 runs on a
#      single plot, where n = size of the control group. Additionally, visually highlight the result from the
#      true treatment group (e.g. in the paper, the true run is black and the placebo runs are light grey).
#      The idea is that if the difference is significant, the true (highlighted) run should be near the
#      edge of the distribution of placebo runs.

# Here's an example:
synth.placebos = vector('list', length(controlIdentifiers))
gaps.placebo = vector('list', length(controlIdentifiers))
for (i in 1:length(controlIdentifiers)) {
  treat_placebo = controlIdentifiers[i]
  control_placebo = controlIdentifiers
  control_placebo[i] = treatment
  synth.placebos[[i]] = runSynth(predVars, depVar, treat_placebo, control_placebo, yearOfTreatment)
  gaps.placebo[[i]] = synth.placebos[[i]][[1]]$Y1plot - (synth.placebos[[i]][[1]]$Y0plot %*% synth.placebos[[i]][[2]]$solution.w)
}

gaps.treat = synth.out[[1]]$Y1plot - (synth.out[[1]]$Y0plot %*% synth.out[[2]]$solution.w)

plot.years = c(2001:2009, 2011:2012)

plot(plot.years, gaps.treat, type = 'l', lwd = 2, xlab = 'Year', ylab = 'Premature mortality', ylim = c(-1000, 1000))
lines(plot.years, gaps.placebo[[1]], col = 'gray')
lines(plot.years, gaps.placebo[[2]], col = 'gray')
lines(plot.years, gaps.placebo[[3]], col = 'gray')
lines(plot.years, gaps.placebo[[4]], col = 'gray')
abline(h = 0, lty = 5)
abline(v = yearOfTreatment, lty = 3)


