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
#require(nlme)

print('Done Loading')

# Mapping of state names to their statecodes from the health outcomes dataset
stateCodes = hash('Alabama'=1 ,'Alaska'=2 ,'Arizona'=4 ,'Arkansas'=5 ,'California'=6 ,'Colorado'=8 ,'Connecticut'=9 ,'Delaware'= 10 ,
				  'District of Columbia'= 11 ,'Florida'= 12 ,'Georgia'= 13 ,'Hawaii'= 15 ,'Idaho'= 16 ,'Illinois'= 17 ,'Indiana'= 18 ,
				  'Iowa'= 19 ,'Kansas'= 20 ,'Kentucky'= 21 ,'Louisiana'= 22 ,'Maine'= 23 ,'Maryland'= 24 ,'Massachusetts'= 25 ,
				  'Michigan'= 26 ,'Minnesota'= 27 ,'Mississippi'= 28 ,'Missouri'= 29 ,'Montana'= 30 ,'Nebraska'= 31 ,'Nevada'= 32 ,
				  'New Hampshire'= 33 ,'New Jersey'= 34 ,'New Mexico'= 35 ,'New York'= 36 ,'North Carolina'= 37 ,'North Dakota'= 38 ,
				  'Ohio'= 39 ,'Oklahoma'= 40 ,'Oregon'= 41 ,'Pennsylvania'= 42 ,'Rhode Island'= 44 ,'South Carolina'= 45 ,'South Dakota'= 46 ,
				  'Tennessee'= 47 ,'Texas'= 48 ,'Utah'= 49 ,'Vermont'= 50 ,'Virginia'= 51 ,'Washington'= 53 ,'West Virginia'= 54 ,
				  'Wisconsin'= 55 ,'Wyoming'= 56)

if(file.exists('../../.env')){
	dotenv::load_dot_env('../../.env')	
}

getEnv <- function(var, default){
	if(Sys.getenv(var) != ""){
		return(Sys.getenv(var));
	}else{
		return(default);
	}
}

user <- getEnv('DB_USER', '')
pwd <- getEnv('DB_USER', '')
db_name <- getEnv('DB_NAME', 'sociome')
host <- getEnv('DB_HOST', 'localhost')
port <- getEnv('DB_PORT', 5432)


print(user)
print(pwd)
print(db_name)
print(host)
print(port)

# - control group is inferred to be rest of the states
# - User should be able to specify a specific control group.  
#   - Require a specific control group

# - year of treatment should be within the range of years of the data (exclusive of bounds)


# Intercept - not really important
# treated - difference between states that had a treatment and did (on average there is 1.21 units of )
# time - reducing over time if they
# did - (important one)
# 	- Pr(>|t|) summarizes noise
# 	- one astericks is the convention for a "good result"
# 	- 
runDiffInDiff <- function(query, policy, outcome){
	conn <- dbConnect(PostgreSQL(), host=host, dbname=db_name, user=user,password=pwd, port=port);

	df <- dbGetQuery(conn, query)
	names(df)[names(df) == policy] <- 'policy'
	names(df)[names(df) == outcome] <- 'outcome'

	if(!is.numeric(df$outcome)){
		df$outcome = as.numeric(df$outcome)
	}

	# Find a policy change
	changeIdx = NULL
	prev <- df[1,]
	for(i in 2:nrow(df)) {
	    row <- df[i,]
	    if(row['policy'] > prev['policy'] && row['statecode'] == prev['statecode']){
	    	changeIdx = i
	    	break;
	    }
	    prev = row
	}

	if(is.null(changeIdx)){
		msg = paste('No changes found in policy!  Years used: ', paste(unique(df$year), collapse=','), sep='')
		return(toJSON(list(success = F, msg = msg)))
	}

	yearOfTreatment = df[changeIdx, 1]

	treatmentGroup = subset(df, policy==df[changeIdx,3] & year==yearOfTreatment)[,2]

	df$treated = ifelse(Vectorize(function(state){
		return(state %in% treatmentGroup)
	})(df$state), 1, 0)

	df$time = ifelse(df$year >= yearOfTreatment, 1, 0)

	df$did <- df$time * df$treated

	didreg = lm(paste('outcome ~ treated + time + did', sep=''), data=df)

	intercept = didreg$coefficients['(Intercept)']
	time = didreg$coefficients['time']
	treated = didreg$coefficients['treated']

	# A = Intercept
	# B = Intercept + time
	# C = Intercept + treated
	# D = Intercept + time + treated + treated * time
	res = list(
		A = unname(intercept),
		B = unname(intercept + time),
		C = unname(intercept + treated),
		D = unname(intercept + time + treated + treated * time),
		treatmentGroup = treatmentGroup,
		yearOfTreatment = yearOfTreatment
	)

	return(toJSON(res));
}


testDiffInDiff <- function(){
	runDiffInDiff(
     	"SELECT year,statecode,bplaces,uninsured FROM ((SELECT year,statecode,bplaces FROM policy WHERE  ( bplaces IS NOT NULL ) AND countycode=0 ) table_0
		       INNER JOIN
		       (SELECT year,statecode,countycode,uninsured->'rawvalue' as uninsured FROM health_outcomes WHERE  ( uninsured IS NOT NULL ) AND countycode=0 ) table_1
		       USING (year,statecode)
		     	) subQ ORDER BY statecode, countycode, year",
     	"bplaces",
     	"uninsured"
   	)

   # 	runDiffInDiff(
	  #   "SELECT year,statecode,bgunban,premature_death FROM ((SELECT year,statecode,bgunban FROM policy WHERE  ( bgunban IS NOT NULL ) AND countycode=0 ) table_0
	  #     INNER JOIN
	  #     (SELECT year,statecode,countycode,premature_death->'rawvalue' as premature_death FROM health_outcomes WHERE  ( premature_death IS NOT NULL ) AND countycode=0 ) table_1
	  #     USING (year,statecode)
	  #   ) subQ ORDER BY statecode, countycode, year",
	  #   "bgunban",
	  #   "premature_death"
  	# )
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

	query <- paste(
		'SELECT 
			demographics.year,
			demographics.state_name,
			health_outcomes.statecode,
			health_outcomes.rawvalue as depvar', 
			paste(
				sapply(predVars, function(p){
					return(paste(',demographics.', p, sep=''));
				}), 
				collapse=''
			), 
		' FROM demographics
		  INNER JOIN health_outcomes ON
			demographics.year=health_outcomes.year AND
			demographics.state_name=health_outcomes.county 
		WHERE 
			demographics.countycode=0 AND 
			health_outcomes.measurename=\'', depVar , '\' AND
		', 
			paste(
				sapply(predVars, function(p){
					return(paste('demographics.', p, ' IS NOT NULL', sep=''));
				}),
				collapse=' AND '
			), 
			' AND demographics.state_name<>\'District of Columbia\' ',
		'ORDER BY state_name',
		sep=''
	)

	print(query)
	dataframe <- dbGetQuery(conn, query)

	if(nrow(dataframe) == 0){
		return(toJSON(list(message="No common data")))
	}

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
			unit.names.variable=c("state_name"),
			time.predictors.prior = priorYears, 
			time.optimize.ssr = priorYears      
		)},
		error = function(err){
			return(err);
		}
	)

	if(is(dataprep.out, 'error')){
		return(toJSON(list(message = dataprep.out$message, success = FALSE)));
	}

	res = tryCatch({
		synth(dataprep.out)
	}, error = function(e){
		return (e);
	})

	if(is(res, 'error')){
		return(toJSON(list(message = res$message, success = FALSE)));
	}
	
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
	depVar <- "Air Pollution - Particulate Matter"
	treatment <- "Minnesota"
	controlIdentifiers <- c("Arizona", "California", "Delaware", "Georgia")
	yearOfTreatment <- 2007
	return(runSynth(predVars, depVar, treatment, controlIdentifiers, yearOfTreatment))
}

testSynth2 <- function(){

	predVars <- c("population_white", "population_wh_hisp_latino", "population_female")
	depVar <- "Air Pollution - Particulate Matter"
	treatment <- "Alabama"
	controlIdentifiers <- c("Alaska", "California", "Connecticut")
	yearOfTreatment <- 2009

	runSynth(predVars, depVar, treatment, controlIdentifiers, yearOfTreatment);
}

getData <- function(name, args, conn){
	if(args['dataset'] == 'health_outcomes'){
		query <- paste('SELECT ', args['value'], '->\'rawvalue\' as ', name, ' FROM health_outcomes WHERE year=', args['year'], ' AND countycode=0 AND statecode>0 AND statecode <= 56 AND statecode != 11 ORDER BY statecode', sep='');
		data <- dbGetQuery(conn, query)
		data[, name] <- as.numeric(data[,name])
		return(data);
	}else if(args['dataset'] == 'demographics'){
		query <- paste('SELECT ', args['value'], ' as ', name, ' FROM demographics WHERE year=', args['year'], ' AND countycode=0 AND statecode <= 56 AND statecode != 11 ORDER BY statecode', sep='');
		return(dbGetQuery(conn, query))
	}else if(args['dataset'] == 'policy'){
		query <- paste('SELECT ', args['value'], ' as ', name, ' FROM ', args['table'], ' WHERE year=', args['year'], ' ORDER BY state', sep='');
		return(dbGetQuery(conn, query))
	}
	print('Error')
}

runRegression <- function(query, dependent, independent, controls){
	conn <- dbConnect(PostgreSQL(), host=host, dbname=db_name, user=user,password=pwd, port=port);
	data <- dbGetQuery(conn, query)
	
	names(data)[names(data) == dependent] <- 'dependent'
	names(data)[names(data) == independent] <- 'independent'

	if(!is.numeric(data$independent)){
		data$independent = as.numeric(data$independent)
	}

	if(!is.numeric(data$dependent)){
		data$dependent = as.numeric(data$dependent)
	}

	model = 'dependent ~ independent'

	fit <- lm(model, data=data)

	summ = summary(fit)

	result = list(
		values=fit$model,
		pvalue=summary(fit)$coefficients[,4],
		residualStdErr=summary(fit)$sigma,
		coefficients=fit$coefficients,
		multipleRSquared=summary(fit)$r.squared,
		adjustedRSquared=summary(fit)$adj.r.squared,
		fstatistic=summary(fit)$fstatistic
	)
	return(toJSON(result))
}


testRegression <- function(){
	# runRegression(
	#     "SELECT year,statecode,countycode,median_family_income,per_capita_income FROM demographics WHERE  median_family_income IS NOT NULL  AND per_capita_income IS NOT NULL ", 
	#     "per_capita_income", 
	#     "median_family_income",
	#     list()
 #   	)

   	runRegression(
    "SELECT year,statecode,countycode,violent_crime_rate->'rawvalue' as violent_crime_rate,uninsured->'rawvalue' as uninsured FROM health_outcomes WHERE  violent_crime_rate IS NOT NULL  AND uninsured IS NOT NULL ",
    "uninsured",
    "violent_crime_rate",
    list()
  )	
}





