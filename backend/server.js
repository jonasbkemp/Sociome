var express = require('express')
var path = require('path');
require('dotenv').config({silent : true});
var pg = require('pg');
var request = require('request');
var cors = require('cors');
var rio = require('rio');
var child_process = require('child_process');
var util = require('util')

//Start `Rserve`
const child = child_process.spawn('R', ['CMD', 'Rserve', '--no-save', '--RS-conf', 'rserve.config'])

child.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

child.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`);
});

var db = new pg.Client(process.env.OPENSHIFT_POSTGRESQL_DB_URL ? 
                       process.env.OPENSHIFT_POSTGRESQL_DB_URL : {database : 'sociome_db'});
db.connect();

var app = express()
app.use(cors());

app.use(express.static(__dirname + '/../static/'));

var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8082;
var ip = process.env.OPENSHIFT_NODEJS_IP || "localhost";

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
  var query = 'SELECT * FROM ' + measure_name + ' ORDER BY start_year;'
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

app.get('/Synth', function(req, res){
  var depVar = req.query.depVar
  var predVars = typeof(req.query.predVars) === 'string' ? [req.query.predVars] : req.query.predVars
  var treatment = req.query.treatment
  var controlIdentities = typeof(req.query.controlIdentities) === 'string' ? 
                          [req.query.controlIdentities] : req.query.controlIdentities
  var yearOfTreatment = req.query.yearOfTreatment

  var command = util.format('runSynth(c(%s), %s, %s, c(%s), %d)', predVars.join(','), 
    depVar, treatment, controlIdentities.join(','), yearOfTreatment)

  rio.$e({command : command}).then(function(result){
    res.json(result)
  }).catch(function(err){
    console.log(err)
    res.json(err)
  })
})

app.get('/', function(req, res){
    res.sendFile(path.resolve(__dirname + '/../static/index.html'));
});

// Openshift puts the app to sleep after 24 hours of innactivity.
// Continually ping the server to keep it awake...
app.get('/Wakeup', function(req, res){
  res.json({})
})
setTimeout(function(){request(ip + ':' + port + '/Wakeup', function(){})}, 3600000)

app.listen(port, ip, function (err) {
	if (err) {
	  	return console.error(err);
	}
	console.log('Listening at http://localhost:8082');
});

function shutdown(err){
  if(err) console.log(err)
  rio.shutdown({callback : function(err, res){
    process.exit();
  }});
}

// Shutdown `Rserve`
process.on('exit', shutdown);
process.on('SIGINT', shutdown);
process.on('uncaughtException', shutdown);




