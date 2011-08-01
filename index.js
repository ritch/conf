/*
* conf
*/
console.log('starting...');

var express = require('express');
var app = express.createServer();

app.get('/', function(req, res) {
	res.send('hi world...');
});

app.listen(process.env.PORT || 3000);

//require('hive').init(__dirname);