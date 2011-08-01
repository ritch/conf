/*
* conf
*/

console.log('starting in ', __dirname);
var hive = require('hive');
hive.config.debug = true;
hive.init(__dirname);