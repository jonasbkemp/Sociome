var path = require('path');
require('dotenv').config({silent : true});
var request = require('request');
var rio = require('rio');
var child_process = require('child_process');
var rimraf = require('rimraf')
var net = require('net')
var webpack = require('webpack')
var config = require('../webpack.config')
var express = require('express')
var bodyParser = require('body-parser')

var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8080;
var ip = process.env.OPENSHIFT_NODEJS_IP || "localhost";

var app = express()
var compiler = webpack(config)

// If this is in development mode, then enable hot reloading
if (process.env.NODE_ENV !== 'production') {
  app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true, 
    publicPath: config.output.publicPath,
    watchOptions : {
      poll : 500
    }
  }))

  app.use(require('webpack-hot-middleware')(compiler, {
    log: console.log,
    path: '/__webpack_hmr',
    heartbeat: 10 * 1000
  }))
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended : true}))
app.use('/', require('./routes'))
app.use(express.static(path.join(__dirname, '../static')))


app.listen(port, function (err) {
	if (err) {
	  	return console.error(err);
	}
	console.log(`Listening on port ${port}`);
});

const socket = process.env.SOCK_LOC || path.join(__dirname, 'rserve.sock')

// Shutdown `Rserve`
function shutdown(err){
  if(err) console.log(err)
  rio.shutdown({
    callback : function(err, res){
      process.exit();
    },
    path : socket,
  });
}

process.on('exit', shutdown);
process.on('SIGINT', shutdown);
process.on('uncaughtException', shutdown);

// Setup the communication socket for Rserve:

// Delete the old socket file if it exists.  Otherwise this gives
// us an EADDRINUSE error
rimraf.sync(socket)

var rserveSocket = net.createServer(function(c) {
    console.log('Rserve socket connected!');
});

var R = process.env.R_PATH ? process.env.R_PATH + '/R' : 'R'

rserveSocket.listen(socket, function() { //'listening' listener
    console.log('R server bound');

    const child = child_process.spawn(R, 
      ['CMD', 'Rserve', '--no-save', '--RS-conf', path.join(__dirname, '../rserve.config'), '--RS-socket', socket])

    child.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    child.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);      
    });
});



setTimeout(function(){request(ip + ':' + port + '/Wakeup', function(err, res){
  console.log('Wakeup result = ' + res)
})}, 3600000)








