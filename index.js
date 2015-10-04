'use strict';

var express    = require('express');
var consign    = require('consign');
var bodyParser = require('body-parser');

var PORT = 9471;

var app = express();

// Json parser for post data
app.use(bodyParser.json());

// Consign configuration
consign({cwd: process.cwd() + '/app'})
    .include('controllers')
    .include('routes')
    .into(app);

var server = app.listen(PORT, function () {
    console.log('Nogueira Producer listening at http://%s:%s',
		server.address().address, server.address().port);
});

module.exports.app = app;
module.exports.server = server;
