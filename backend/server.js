var express = require('express')
var path = require('path');
require('dotenv').config({silent : true});
var pg = require('pg')

var cors = require('cors')

//TODO set up openshift database
var db = new pg.Client(process.env.OPENSHIFT_POSTGRESQL_DB_URL ? 
                       process.env.OPENSHIFT_POSTGRESQL_DB_URL : {database : 'sociome_db'});
db.connect();

var app = express()
app.use(cors());

app.get('/GetPolicyData', function(req, res){
  var table = req.query.policy
  var field = req.query.field
  db.query('SELECT state, year, ' + field + ' FROM ' + table + ' ORDER BY year;').then(
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
  var query = 'SELECT * FROM chr_2016_trend_data WHERE measure_name=$$' + measure_name + '$$;'
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

app.get('/', function(req, res){
    res.sendFile(path.resolve(__dirname + '/../static/index.html'));
});

var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8082;
var ip = process.env.OPENSHIFT_NODEJS_IP || "localhost";

app.listen(port, ip, function (err) {
	if (err) {
	  	return console.error(err);
	}
	console.log('Listening at http://localhost:8082');
});