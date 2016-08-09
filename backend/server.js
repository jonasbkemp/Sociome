var webpack = require('webpack')
var config = require('../webpack.config')
var compiler = webpack(config)
var express = require('express')
var chokidar = require('chokidar');
var path = require('path');
require('dotenv').config();
var pg = require('pg')

var db = new pg.Client(process.env.DATABASE_URL + '?ssl=true');
db.connect();

var app = express()

// Serve hot-reloading bundle to client
app.use(require("webpack-dev-middleware")(compiler, {
  publicPath: config.output.publicPath,
  log : console.log,
  stats : {
    colors : true,
  }
}));

app.use(require("webpack-hot-middleware")(compiler, {
  log : console.log
}));

//app.use(express.static(path.resolve(__dirname + '/../static')))

app.get('/GetPolicyData', function(req, res){
  var table = req.query.policy
  var field = req.query.field
  db.query('SELECT state, year, ' + field + ' FROM ' + table + ';').then(
    function(data){
      res.json(data.rows)
    }
  ).catch(
    function(err){
      console.log(err)
    }
  )
})

app.get('/', function(req, res){
    res.sendFile(path.resolve(__dirname + '/../static/index.html'));
});

app.listen(8080, 'localhost', function (err) {
	if (err) {
	  	return console.error(err);
	}
	console.log('Listening at http://localhost:8080');
});