var pg = require('pg')
var express = require('express')
var pg = require('pg');
var cors = require('cors');
var stats = require('simple-statistics')
require('dotenv').config({silent : true});
var rio = require('rio');
var path = require('path')
var request = require('request')

var db = new pg.Client(process.env.OPENSHIFT_POSTGRESQL_DB_URL ? 
                       process.env.OPENSHIFT_POSTGRESQL_DB_URL : {database : 'sociome_db'});
db.connect();

var app = express()
app.use(cors());

module.exports.app = app;

app.use(express.static(__dirname + '/../static/'));

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
app.get('/SynthGetYears', function(req, res){
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
app.get('/GetYears', function(req, res){
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

app.get('/GetPolicyData', function(req, res){
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

app.get('/GetHealthOutcomes', function(req, res){
  var measure_name = req.query.measure_name;
  var year = req.query.year
  var query = undefined;
  if(year){
    query = 'SELECT * FROM ' + measure_name + ' WHERE start_year = ' + year + ';'
  }else{
    query = 'SELECT * FROM ' + measure_name + ' ORDER BY start_year;'  
  }
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

app.get('/Multilevel', function(req, res){
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

app.get('/LinRegression', function(req, res){
  var depVar = req.query.depVar;
  var predVar = req.query.predVar;
  var q = `SELECT a_fiscal_11.year, a_fiscal_11.state, a_fiscal_11.${predVar}, ${depVar}.rawvalue as ${depVar}
   FROM a_fiscal_11 INNER JOIN ${depVar} ON a_fiscal_11.year=${depVar}.start_year AND a_fiscal_11.state=${depVar}.county
   WHERE ${predVar} IS NOT NULL AND ${depVar}.rawvalue IS NOT NULL;`

  db.query(q, function(err, result){
    var data = result.rows.map(function(point){
      return [point[predVar], point[depVar]];
    })
    regression = stats.linearRegression(data)
    res.json({regression : regression, data : result.rows})
  })

})

app.get('/DiffInDiff', function(req, res){
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

app.get('/Synth', function(req, res){
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

app.get('/', function(req, res){
    res.sendFile(path.resolve(__dirname + '/../static/index.html'));
});

// Openshift puts the app to sleep after 24 hours of innactivity.
// Continually ping the server to keep it awake...
app.get('/Wakeup', function(req, res){
  res.json({success : true})
})
setTimeout(function(){request(ip + ':' + port + '/Wakeup', function(err, res){
  console.log('Wakeup result = ' + res)
})}, 3600000)