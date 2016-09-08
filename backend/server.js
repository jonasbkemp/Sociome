var express = require('express')
var path = require('path');
require('dotenv').config({silent : true});
var pg = require('pg');
var request = require('request');
var cors = require('cors');
var rio = require('rio');
var child_process = require('child_process');
var util = require('util')
var rimraf = require('rimraf')
var net = require('net')

var db = new pg.Client(process.env.OPENSHIFT_POSTGRESQL_DB_URL ? 
                       process.env.OPENSHIFT_POSTGRESQL_DB_URL : {database : 'sociome_db'});
db.connect();

var app = express()
app.use(cors());

app.use(express.static(__dirname + '/../static/'));

var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8082;
var ip = process.env.OPENSHIFT_NODEJS_IP || "localhost";

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

app.get('/SynthGetYears', function(req, res){
  var depVar = req.query.depVar
  var predVars = req.query.predVars;
  var notNullCond = predVars.map(function(pv){return `demographics.${pv} IS NOT NULL`}).join(' AND ')
  var q = `SELECT DISTINCT demographics.year FROM demographics INNER JOIN ${depVar}
 ON demographics.year=${depVar}.start_year AND demographics.state_name=${depVar}.county
 WHERE demographics.fips_county_code=0 AND ${notNullCond} AND ${depVar}.rawvalue IS NOT NULL ORDER BY year;`
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
  var query = util.format('SELECT state, year, %s FROM %s WHERE %s IS NOT NULL ORDER BY year;', field, table, field);
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
  rio.e({
    command : command,
    path : path.join(__dirname, 'rserve.sock'),
    callback : function(err, result){
      if(err){
        throw(err)
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

  var command = util.format('runSynth(c(%s), %s, %s, c(%s), %d)', predVars.join(','), 
    depVar, treatment, controlIdentifiers.join(','), yearOfTreatment)

  rio.e({
    command : command,
    path : path.join(__dirname, 'rserve.sock'),
    callback : function(err, result){
      if(err){
        console.log(err);
        res.json(err);
      }else{
        res.json(result);
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

app.listen(port, ip, function (err) {
	if (err) {
	  	return console.error(err);
	}
	console.log('Listening at http://localhost:8082');
});


// Shutdown `Rserve`
function shutdown(err){
  if(err) console.log(err)
  rio.shutdown({
    callback : function(err, res){
      process.exit();
    },
    path : path.join(__dirname, 'rserve.sock'),
  });
}

process.on('exit', shutdown);
process.on('SIGINT', shutdown);
process.on('uncaughtException', shutdown);

// Setup the communication socket for Rserve:

// Delete the old socket file if it exists.  Otherwise this gives
// us an EADDRINUSE error
rimraf.sync('./rserve.sock')

var rserveSocket = net.createServer(function(c) {
    console.log('Rserve socket connected!');
});
rserveSocket.listen('./rserve.sock', function() { //'listening' listener
    console.log('server bound');

    const child = child_process.spawn(process.env.R_PATH + '/R', 
      ['CMD', 'Rserve', '--no-save', '--RS-conf', 'rserve.config', '--RS-socket', path.join(__dirname, 'rserve.sock')])

    child.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    child.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });
});












