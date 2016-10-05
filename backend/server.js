var path = require('path');
require('dotenv').config({silent : true});
var request = require('request');
var rio = require('rio');
var child_process = require('child_process');
var rimraf = require('rimraf')
var net = require('net')
var app = require('./app').app;

var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8082;
var ip = process.env.OPENSHIFT_NODEJS_IP || "localhost";

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

var R = process.env.R_PATH ? process.env.R_PATH + '/R' : 'R'

rserveSocket.listen('./rserve.sock', function() { //'listening' listener
    console.log('R server bound');

    const child = child_process.spawn(R, 
      ['CMD', 'Rserve', '--no-save', '--RS-conf', 'rserve.config', '--RS-socket', path.join(__dirname, 'rserve.sock')])

    child.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    child.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });
});












