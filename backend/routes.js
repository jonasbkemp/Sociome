var pg = require('pg')
var express = require('express')
var router = express.Router()
var pg = require('pg');
var rio = require('rio');
var path = require('path')
var _ = require('lodash')

var config = process.env.OPENSHIFT_POSTGRESQL_DB_URL ? 
            process.env.OPENSHIFT_POSTGRESQL_DB_URL : 
            {database : 'sociome', password : process.env.DB_PWD};

var db = new pg.Client(config);
db.connect();

var health_outcomes = {
  'children_in_poverty' : true
 ,'adult_obesity' : true
 ,'physical_inactivity' : true
 ,'air_pollution_particulate_matter' : true
 ,'unemployment_rate' : true
 ,'sexually_transmitted_infections' : true
 ,'preventable_hospital_stays' : true
 ,'violent_crime_rate' : true
 ,'alcohol_impaired_driving_deaths' : true
 ,'uninsured' : true
 ,'mammography_screening' : true
 ,'premature_death' : true
 ,'diabetic_monitoring' : true
}

/**
 * Get the available years for Synthetic Control.  The user should
 * only be allowed so select years where dependent and predictive
 * variables line up.
 * 
 * @param  {String} depVar - Dependent variable
 * @param  {Array<String>} predVars - predictive variables
 * @return {Array<Integer>} - Array of years
 */
router.get('/SynthGetYears', function(req, res){
  var depVar = req.query.depVar
  var predVars = !req.query.predVars || typeof(req.query.predVars) === 'string' ? [req.query.predVars] : req.query.predVars
  var notNullCond = predVars.map(function(pv){return `demographics.${pv} IS NOT NULL`}).join(' AND ')

  var q = `
    SELECT DISTINCT demographics.year 
    FROM demographics 
    INNER JOIN ${depVar} ON 
      demographics.year=${depVar}.start_year AND 
      demographics.state_name=${depVar}.county
    WHERE 
      demographics.fips_county_code=0 AND 
      ${notNullCond} AND 
      ${depVar}.rawvalue IS NOT NULL 
    ORDER BY year;`
  db.query(q).then(function(data){
    res.json(data.rows.map(function(d){return d.year}));
  }).catch(function(err){
    res.status(500).send(err)
  })
})

/**
 * Get the policy data for a specific field.  The year
 * parameter is optional.  If it is not provided, then all 
 * data points will be returned ordered by year
 * @param  {String} policy - The policy to select (table)
 * @param  {String} field - The policy field (column)
 * @param  {Integer} year - Which year to select for
 * @return {Array<{state : String, year : Integer, value : Float}>}
 */
router.get('/PolicyData', function(req, res){
  var table = req.query.policy
  var field = req.query.field
  var yearClause = req.query.year ? `AND year=${req.query.year}` : `ORDER BY year`
  var query = `
    SELECT state, year, ${field} as value 
    FROM ${table} 
    WHERE ${field} IS NOT NULL ${yearClause};`

  db.query(query).then(data => {
    res.json(data.rows)
  }).catch(err => {
    res.status(500).send(err)
  })
})

/**
/* Get a column out of the demographics table.  `year` is 
 * optional.  If not provided, all years are returned ordered by year
 * @param  {String} col - Which demographics column to select
 * @param  {Integer} year - Which year to select for
 * @return {Array<Object>}
 */
router.get('/Demographics', function(req, res){
  var col = req.query.col;
  var yearClause = req.query.year ? `AND year=${req.query.year}` : `ORDER BY year`;

  var query = `
    SELECT 
      year, 
      county_name as state, 
      ${col} as value, 
      fips_state_code as statecode, 
      fips_county_code as countycode 
    FROM demographics 
    WHERE ${col} IS NOT NULL ${yearClause};`;
  db.query(query).then(data => {
    res.json(data.rows)
  }).catch(err => {
    res.status(500).send(err)
  })
})

/**
 * Get a column out of the Health Outcomes table.
 * 
 * @param  {String} measure_name - Which measure to select
 * @param  {Integer} year - Which year to select for
 * @return {Array<Object>}
 */
router.get('/HealthOutcomes', function(req, res){
  var measure_name = req.query.measure_name;
  var yearClause = req.query.year ? `AND year=${req.query.year}` : `ORDER BY year`;
  var query = `
    SELECT 
      year, 
      county as state, 
      rawvalue as value, 
      countycode, 
      statecode 
    FROM health_outcomes 
    WHERE measurename='${measure_name}' AND rawvalue IS NOT NULL ${yearClause};`;
  db.query(query).then(data => {
    res.json(data.rows)
  }).catch(err => {
    res.status(500).send(err)
  })
})

router.get('/Multilevel', function(req, res){
  var depVar = req.query.depVar;
  var predVar = req.query.predVar;
  var command = `runMultilevelModeling(${depVar}, ${predVar})`;
  rio.e({
    command : command,
    path : path.join(__dirname, 'rserve.sock'),
    callback : function(err, result){
      if(err){
        throw err;
      }else{
        res.json(result);
      }
    }
  })
})

router.post('/LinRegression', function(req, res){
  var params = req.body;
  params.controls = params.controls ? params.controls : [];

  var mkArg = (arg) => {
    var fields = [];
    for(var field in arg){
      if(field !== 'years'){
        fields.push(`${field}='${arg[field]}'`)
      }
    }
    return `list(${fields.join(',')})`;
  }

  var controls = params.controls.map(mkArg)

  //var cmd = `{source("${__dirname}/R-scripts/Synth.r");\n`
  var cmd = `runRegression(${mkArg(params.dependent)}, ${mkArg(params.independent)}, list(${controls.join(',')}))}`

  console.log(cmd)

  rio.e({
    command : cmd,
    path : path.join(__dirname, 'rserve.sock'),
    callback : (err, result) => {
      console.log('callback')
      debugger
      if(err){
        console.log(err)
        res.status(500).json(err)
      }else{
        res.send(result)
        console.log(result)
      }
    }
  })
})

router.get('/DiffInDiff', function(req, res){
  var depVar = req.query.depVar
  var predVars = typeof(req.query.predVars) === 'string' ? [req.query.predVars] : req.query.predVars
  predVars = predVars.join(',')
  var treatmentGroup =  typeof(req.query.treatmentGroup) === 'string' ? 
                        [req.query.treatmentGroup] : 
                        req.query.treatmentGroup;
  treatmentGroup = treatmentGroup.join(',')
  var yearOfTreatment = req.query.yearOfTreatment;
  var command = `runDiffInDiff(c(${predVars}), ${depVar}, c(${treatmentGroup}), ${yearOfTreatment})`
  console.log(command)
  rio.e({
    command : command,
    path : path.join(__dirname, 'rserve.sock'),
    callback : function(err, result){
      if(err){
        console.log(err)
        res.status(500).json(err)
      }else{
        res.json(result)
      }
    }
  })
})

router.get('/Synth', function(req, res){
  var depVar = req.query.depVar
  var predVars = typeof(req.query.predVars) === 'string' ? [req.query.predVars] : req.query.predVars
  var treatment = req.query.treatment
  var controlIdentifiers = typeof(req.query.controlIdentifiers) === 'string' ? 
                          [req.query.controlIdentifiers] : req.query.controlIdentifiers
  var yearOfTreatment = req.query.yearOfTreatment

  var command = `runSynth(c(${predVars.join(',')}), ${depVar}, ${treatment}, c(${controlIdentifiers.join(',')}), ${yearOfTreatment})`
  console.log(command)
  rio.e({
    command : command,
    path : path.join(__dirname, 'rserve.sock'),
    callback : function(err, result){
      if(err){
        console.log(err)
        res.status(500).json({responseText : err});
      }else{
        result = JSON.parse(result);
        if(!result.success){
          console.log(result)
          res.status(500).json({responseText : result.msg})
        }else{
          res.status(200).json(result);
        }
      }
    }
  })
})

router.get('/', function(req, res){
    res.sendFile(path.resolve(__dirname + '/../static/index.html'));
});

// Openshift puts the app to sleep after 24 hours of innactivity.
// Continually ping the server to keep it awake...
router.get('/Wakeup', function(req, res){
  res.json({success : true})
})

module.exports = router