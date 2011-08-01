var hive = require('./hive');

exports = module.exports = function(path, callback) {
	var configFilePath = path + '/config.json';
	var config = new hive.File({path: configFilePath});
	config.bind('success', function() {
		var data;
		try {
			data = JSON.parse(config.get('data'));
		}
		catch (e) {
			throw new Error('Could not load config @' + path);
		}
		callback(data);
	});
	config.bind('error', function() {
		cli.clear()
		.write('Could not find or open ' + configFilePath);
	});
	config.fetch();
};