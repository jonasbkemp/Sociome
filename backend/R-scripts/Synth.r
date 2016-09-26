# This script is run by the Node.js server.  It will pass in the 
# parameters to be used in the synthetic control algorithm.  This 
# script will then load them out of the PostgreSQL database, 
# run the algorithm, and the return the results to ther server
# which will subsequently be sent back to the client.

require(Synth)
require(RPostgreSQL)
require(dotenv)
require(hash)
require(RJSONIO)
require(nlme)

# Mapping of state names to their statecodes from the health outcomes dataset
stateCodes = hash('Alabama'=1 ,'Alaska'=2 ,'Arizona'=4 ,'Arkansas'=5 ,'California'=6 ,'Colorado'=8 ,'Connecticut'=9 ,'Delaware'= 10 ,
				  'District of Columbia'= 11 ,'Florida'= 12 ,'Georgia'= 13 ,'Hawaii'= 15 ,'Idaho'= 16 ,'Illinois'= 17 ,'Indiana'= 18 ,
				  'Iowa'= 19 ,'Kansas'= 20 ,'Kentucky'= 21 ,'Louisiana'= 22 ,'Maine'= 23 ,'Maryland'= 24 ,'Massachusetts'= 25 ,
				  'Michigan'= 26 ,'Minnesota'= 27 ,'Mississippi'= 28 ,'Missouri'= 29 ,'Montana'= 30 ,'Nebraska'= 31 ,'Nevada'= 32 ,
				  'New Hampshire'= 33 ,'New Jersey'= 34 ,'New Mexico'= 35 ,'New York'= 36 ,'North Carolina'= 37 ,'North Dakota'= 38 ,
				  'Ohio'= 39 ,'Oklahoma'= 40 ,'Oregon'= 41 ,'Pennsylvania'= 42 ,'Rhode Island'= 44 ,'South Carolina'= 45 ,'South Dakota'= 46 ,
				  'Tennessee'= 47 ,'Texas'= 48 ,'Utah'= 49 ,'Vermont'= 50 ,'Virginia'= 51 ,'Washington'= 53 ,'West Virginia'= 54 ,
				  'Wisconsin'= 55 ,'Wyoming'= 56)

if(Sys.getenv('OPENSHIFT_POSTGRESQL_DB_USERNAME') ==''){
	dotenv::load_dot_env('../../.env')
}

# Get database credentials from environment variables
user <- Sys.getenv('OPENSHIFT_POSTGRESQL_DB_USERNAME')
pwd <- Sys.getenv('OPENSHIFT_POSTGRESQL_DB_PASSWORD')
db_name <- 'sociome'
host <- Sys.getenv('OPENSHIFT_POSTGRESQL_DB_HOST')
port <- Sys.getenv('OPENSHIFT_POSTGRESQL_DB_PORT')

# Intercept - not really important
# treated - difference between states that had a treatment and did (on average there is 1.21 units of )
# time - reducing over time if they
# did - (important one)
# 	- Pr(>|t|) summarizes noise
# 	- one astericks is the convention for a "good result"
# 	- 

runDiffInDiff <- function(predVars, depVar, treatmentGroup, yearOfTreatment){
	conn <- dbConnect(PostgreSQL(), host=host, dbname=db_name, user=user,password=pwd, port=port);

	nullCond <- paste(sapply(predVars, function(p){return(paste('demographics.', p, ' IS NOT NULL', collapse=''));}), collapse=' AND ')

	#Do an INNER JOIN on the health outcome and demographics data to get them aligned on state and year
	query <- paste('SELECT demographics.year, demographics.state_name, ', depVar, '.statecode',
			 paste(sapply(predVars, function(p){return(paste(',demographics.', p, collapse=''));}), collapse=''), 
			 ',', depVar, '.rawvalue as ', depVar, ' FROM demographics INNER JOIN ', depVar, ' ON demographics.year=', depVar, '.start_year AND ',
			 'demographics.state_name = ', depVar, '.county WHERE demographics.fips_county_code = 0 AND ', 
			 nullCond, ' AND ', depVar, '.rawvalue IS NOT NULL',
			 ' AND demographics.state_name <> \'District of Columbia\' ORDER BY state')

	dataframe <- dbGetQuery(conn, query)

	dataframe$time = ifelse(dataframe$year >= yearOfTreatment, 1, 0)

	dataframe$treated = ifelse(Vectorize(function(country){
		return(country %in% treatmentGroup)
	})(dataframe$state_name), 1, 0);

	dataframe$did <- dataframe$time * dataframe$treated

	formula <- as.formula(paste(depVar, ' ~ treated + time + did', collapse=''))

	didreg <- lm(formula, data=dataframe)

	intercept = didreg$coefficients['(Intercept)']
	time = didreg$coefficients['time']
	treated = didreg$coefficients['treated']

	res = list(
		A = unname(intercept),
		B = unname(intercept + time),
		C = unname(intercept + treated),
		D = unname(intercept + time + treated + treated * time)
	)

	return(toJSON(res));
}

# A = Intercept
# B = Intercept + time
# C = Intercept + treated
# D = Intercept + time + treated + treated * time

testDiffInDiff <- function(){
	predVars <- c("population_white", "population_wh_hisp_latino")
	depVar <- "air_pollution_particulate_matter"
	treatmentGroup <- c("Arizona", "California", "Delaware", "Georgia")
	yearOfTreatment <- 2007
	return(runDiffInDiff(predVars, depVar, treatmentGroup, yearOfTreatment))
}

runMultilevelModeling <- function(depVar, predVar){
	conn <- dbConnect(PostgreSQL(), host=host, dbname=db_name, user=user,password=pwd, port=port);
	query <- paste('SELECT a_fiscal_11.year, a_fiscal_11.state, a_fiscal_11.', predVar, 
				   ', ', depVar, '.rawvalue as ', depVar, 
				   ' FROM a_fiscal_11 INNER JOIN ', depVar, ' ON a_fiscal_11.year=', depVar, '.start_year', 
				   ' AND a_fiscal_11.state=', depVar, '.county WHERE ', predVar, ' IS NOT NULL')
	dataframe <- dbGetQuery(conn, query)

	formula <- as.formula(paste(depVar, ' ~ ', predVar, ' * year'))

	res <- lme(formula, data = dataframe, random = ~ 1 | state)

	stdErr <- sqrt(res$varFix[c(paste(predVar, ':year', sep='')),c(paste(predVar,':year', sep=''))])
	coef <- res$coefficients$fixed[c(paste(predVar, ':year', sep=''))]

	return(paste('{\"stdErr\":', stdErr, ',\"coef\":', coef, '}'))
}

testMultilevelModeling <- function(){
	depVar <- "adult_obesity"
	predVar <- "asldebt"
	runMultilevelModeling(depVar, predVar)
}

# predVars - demographics data (1 or more)
# depVar - health outcomes data (1)
# treatment - state that receives treatment
# controlIdentifiers - states that never implemented policy
# yearOfTreatment - year ot treatment
runSynth <- function(predVars, depVar, treatment, controlIdentifiers, yearOfTreatment){
	conn <- dbConnect(PostgreSQL(), host=host, dbname=db_name, user=user,password=pwd, port=port);

	nullCond <- paste(sapply(predVars, function(p){return(paste('demographics.', p, ' IS NOT NULL', collapse=''));}), collapse=' AND ')

	#Do an INNER JOIN on the health outcome and demographics data to get them aligned on state and year
	query <- paste('SELECT demographics.year, demographics.state_name, ', depVar, '.statecode',
			 paste(sapply(predVars, function(p){return(paste(',demographics.', p, collapse=''));}), collapse=''), 
			 ',', depVar, '.rawvalue as ', depVar, ' FROM demographics INNER JOIN ', depVar, ' ON demographics.year=', depVar, '.start_year AND ',
			 'demographics.state_name = ', depVar, '.county WHERE demographics.fips_county_code = 0 AND ', 
			 nullCond, ' AND ', depVar, '.rawvalue IS NOT NULL',
			 ' AND demographics.state_name <> \'District of Columbia\' ORDER BY state')

	#print(query)
	dataframe <- dbGetQuery(conn, query)

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
			dependent=c(depVar),
			unit.variable=c("statecode"),
			time.variable=c("year"),
			treatment.identifier=stateCodes[[treatment]],
			controls.identifier=controlIdentifiers,
			unit.names.variable=c("state_name"),
			time.predictors.prior = priorYears, 
			time.optimize.ssr = priorYears      
		)
	}, error = function(e){
		browser()
		return(toJSON(list(success=FALSE, msg=paste(e))))
	})

	res = tryCatch({
		synth(dataprep.out)
	}, error = function(e){
		browser()
		return (toJSON(list(success=FALSE, msg=paste(e))))	
	})
	
	y0plot1 = dataprep.out$Y0plot %*% res$solution.w;

	jsRes <- list(
		success = TRUE,

		treatedX = dataprep.out$tag$time.plot,
		treatedY = as.vector(dataprep.out$Y1plot),
		syntheticX = dataprep.out$tag$time.plot,
		syntheticY = as.vector(y0plot1),
		weights = as.vector(res$solution.w)
	)
	return(toJSON(jsRes))
}

# Sample for parameters for testing purposes
testSynth <- function(){
	predVars <- c("population_white", "population_wh_hisp_latino")
	depVar <- "air_pollution_particulate_matter"
	treatment <- "Minnesota"
	controlIdentifiers <- c("Arizona", "California", "Delaware", "Georgia")
	yearOfTreatment <- 2007
	return(runSynth(predVars, depVar, treatment, controlIdentifiers, yearOfTreatment))
}



testSynth2 <- function(){

	predVars <- c("population_white", "population_wh_hisp_latino", "population_female")
	depVar <- "air_pollution_particulate_matter"
	treatment <- "Alabama"
	controlIdentifiers <- c("Alaska", "California", "Connecticut")
	yearOfTreatment <- 2009

	runSynth(predVars, depVar, treatment, controlIdentifiers, yearOfTreatment);
}









