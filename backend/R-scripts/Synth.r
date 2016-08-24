# This script is run by the Node.js server.  It will pass in the 
# parameters to be used in the synthetic control algorithm.  This 
# script will then load them out of the PostgreSQL database, 
# run the algorithm, and the return the results to ther server
# which will subsequently be sent back to the client.

require(Synth)
require(RPostgreSQL)
require(dotenv)
require(hash)

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

# Connect to the database
conn <- dbConnect(PostgreSQL(), host=host, dbname=db_name, user=user,password=pwd, port=port)

# predVars - demographics data (1 or more)
# depVar - health outcomes data (1)
# treatment - state that receives treatment
# controlIdentities - states that never implemented policy
# yearOfTreatment - year ot treatment
runSynth <- function(predVars, depVar, treatment, controlIdentities, yearOfTreatment){
	conn <- dbConnect(PostgreSQL(), host=host, dbname=db_name, user=user,password=pwd, port=port);

	#Do an INNER JOIN on the health outcome and demographics data to get them aligned on state and year
	query <- paste('SELECT demographics.year, demographics.state, ', depVar, '.statecode',
			 paste(sapply(predVars, function(p){return(paste(',demographics.', p, collapse=''));}), collapse=''), 
			 ',', depVar, '.rawvalue as ', depVar, ' FROM demographics INNER JOIN ', depVar, ' ON demographics.year=', depVar, '.start_year AND ',
			 'demographics.state = ', depVar, '.county WHERE demographics.state <> \'District of Columbia\' ORDER BY state')

	#print(query)
	dataframe <- dbGetQuery(conn, query)

	print('------Args-------')
	print(treatment)
	print(controlIdentities)
	print('------------------')

	dataprep.out <- dataprep(
		foo=dataframe,
		predictors=c(predVars),
		predictors.op=c("mean"),
		dependent=c(depVar),
		unit.variable=c("statecode"),
		time.variable=c("year"),
		treatment.identifier=stateCodes[[treatment]],
		controls.identifier=controlIdentities,
		unit.names.variable=c("state"),
		time.predictors.prior = c(2006:2007),
		time.optimize.ssr = c(2006:2007)
	)

	res = synth(dataprep.out)
	return(as.vector(res$solution.w))
}

# Sample for parameters for testing purposes
testSynth <- function(){
	predVars <- c("pop_num", "age_lt_18")
	depVar <- "adult_obesity"
	treatment <- "Alaska"
	controlIdentities <- c("Alabama", "Alaska")
	yearOfTreatment <- 2003
	return(runSynth(predVars, depVar, treatment, controlIdentities, yearOfTreatment))
}













