/*
* conf
*/

console.log('starting in ', __dirname);
var e = require("express");
require("backbone");
require("mongoose");
require("findit");
require("rimraf");
require("request");
require("formidable");
require("underscore");
require("connect-form");
require("hamljs");
require("ejs");

var app = e.createServer();

app.get('/', function(req, res) {
	res.send('...');
});

app.listen(process.env.PORT || 3000)

//require('hive').init(__dirname);