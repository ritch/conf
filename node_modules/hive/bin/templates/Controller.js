var hive = require('hive');
var view = hive.view;
var redirect = hive.redirect;
var [%= name %] = hive.models.[%= name %];
var [%= name %]s = hive.queries.[%= name %]s;

hive
.at('/[%= name.toLowerCase() %]')
.get('/')
.get('/all', [%= name %]s)
.get('/new')
.post('/new', function(req, res) {
	var model = new [%= name %](req.body);
	return model;
});