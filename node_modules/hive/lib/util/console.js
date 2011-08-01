var hive = require('../hive');

var exports = module.exports = {
	log: function() {
		if(hive.config.debug) {
			console.log.apply(this, arguments);
		}
	}
};