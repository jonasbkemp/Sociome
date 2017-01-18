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

// depVar 
router.get('/SynthGetYears', function(req, res){
  var depVar = req.query.depVar
  var predVars = !req.query.predVars || typeof(req.query.predVars) === 'string' ? [req.query.predVars] : req.query.predVars
  var notNullCond = predVars.map(function(pv){return `demographics.${pv} IS NOT NULL`}).join(' AND ')

  var q = `SELECT DISTINCT demographics.year FROM demographics INNER JOIN ${depVar}
 ON demographics.year=${depVar}.start_year AND demographics.state_name=${depVar}.county
 WHERE demographics.fips_county_code=0 AND ${notNullCond} AND ${depVar}.rawvalue IS NOT NULL ORDER BY year;`
  console.log(q)
  db.query(q).then(function(data){
    res.json(data.rows.map(function(d){return d.year}));
  }).catch(function(err){
    console.log(err)
    throw(err)
  })
})

//Get a distinct ordered array of years available
router.get('/GetYears', function(req, res){
  var table = req.query.table;
  if(health_outcomes[table]){
    db.query('SELECT DISTINCT start_year FROM ' + table + ' ORDER BY start_year;').then(function(data){
      res.json(data.rows.map(function(x){return x.start_year}))
    }).catch(function(err){
      console.log(err)
    })
  }else{
    db.query('SELECT DISTINCT year FROM ' + table + ' ORDER BY year;').then(function(data){
      res.json(data.rows.map(function(x){return x.year}))
    }).catch(function(err){
      console.log(err)
    })
  }
})

router.get('/GetPolicyData', function(req, res){
  var table = req.query.policy
  var field = req.query.field
  var yearClause = req.query.year ? `AND year=${req.query.year}` : `ORDER BY year`
  var query = `SELECT state, year, ${field} as value FROM ${table} WHERE ${field} IS NOT NULL ${yearClause};`
  console.log(query)
  db.query(query).then(
    function(data){
      res.json(data.rows)
    }
  ).catch(
    function(err){
      console.log(err)
      res.json(err)
    }
  )
})

router.get('/GetDemographics', function(req, res){
  var col = req.query.col;
  var yearClause = req.query.year ? `AND year=${req.query.year}` : `ORDER BY year`;
  var query = `SELECT year, county_name as state, ${col} as value, fips_state_code as statecode, fips_county_code as countycode FROM demographics WHERE ${col} IS NOT NULL ${yearClause};`;
  console.log(query)
  db.query(query).then(
    function(data){
      res.json(data.rows)
    }
  ).catch(
    function(err){
      console.log(err)
      res.json({})
    }
  )
})

router.get('/GetHealthOutcomes', function(req, res){
  var measure_name = req.query.measure_name;
  var yearClause = req.query.year ? `AND year=${req.query.year}` : `ORDER BY year`;
  var query = `SELECT year, county as state, rawvalue as value, countycode, statecode FROM health_outcomes WHERE measurename='${measure_name}' AND rawvalue IS NOT NULL ${yearClause};`;
  db.query(query).then(
    function(data){
      res.json(data.rows)
    }
  ).catch(
    function(err){
      console.log(err)
      res.json({})
    }
  )
})

router.get('/GetHealthOutcomeTypes', function(req, res){
  db.query('SELECT DISTINCT measurename FROM health_outcomes WHERE measurename IS NOT NULL;').then((data) => {
    res.json(data.rows.map((t) => t.measurename));
  }).catch((err) => {
    console.log(err);
    res.status(500).send(err);
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


  var cmd = `{source("${__dirname}/R-scripts/Synth.r");\n`
  cmd += `runRegression(${mkArg(params.dependent)}, ${mkArg(params.independent)}, list(${controls.join(',')}))}`

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