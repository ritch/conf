var hive = require('hive');

// [%= name %] Query

exports = module.exports = hive.Query.extend({
	_name: '[%= name.toLowerCase() %]'
});