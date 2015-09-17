'use strict';

var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync(__dirname + '/ssl/server.key', 'utf8');
var certificate = fs.readFileSync(__dirname + '/ssl/server.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};

var app = require('./ServerApp');
var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(3000);
httpsServer.listen(3443);

console.log('Server http://localhost:3000 started.');
console.log('Server https://localhost:3443 started.');
