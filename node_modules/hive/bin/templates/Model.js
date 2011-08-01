var hive = require('hive');

// [%= name %] Model

exports = module.exports = hive.Model.extend({
	_name: '[%= name.toLowerCase() %]',
	initialize: function() {
		
	}
});