var model	 = require('./model'),
	hive	 = require('./hive'),
	url		 = require('url'),
	request  = require('request');

var exports = module.exports = model.extend({

	// sync: function(method, model) {
	// 	model.syncing = true;
	// 	var req = request(model.options, function(res) {
	// 		var result = '';
	// 		model.res = res;
	// 		res.on('data', function(d) {
	// 			result += d;
	// 		});
	// 		res.on('end', function() {
	// 			model.success({data: result});
	// 		});
	// 	});
	// 	switch(method) {
	// 		case 'create':
	// 			model.options.method = 'POST';
	// 			break;
	// 		case 'update':
	// 			model.options.method = 'PUT';
	// 			break;
	// 		case 'read':
	// 			model.options.method = 'GET';
	// 			break;
	// 		case 'delete':
	// 			model.options.method = 'DELETE';
	// 			break;
	// 	}
	// 	if(model.options.method === 'POST' || model.options.method === 'PUT') {
	// 		req.write(model.get('data'), model.options.encoding || 'utf8');
	// 	}
	// 	req.end();
	// }
	sync: function(method, model) {
		switch(method) {
			case 'create':
				model.attributes.method = 'POST';
				break;
			case 'update':
				model.attributes.method = 'PUT';
				break;
			case 'read':
				model.attributes.method = 'GET';
				break;
			case 'delete':
				model.attributes.method = 'DELETE';
				break;
		}
		hive.log('Making request with', model.attributes);
		request(model.attributes, function(error, response, body) {
			if(error) return model.error(error);
			model.res = response;
			model.success({data: body});
		});
	}
});

// function parseOptions(options) {
// 	var _url, parsed;
// 	if(typeof options === 'string') {
// 		_url = options;
// 		options = {url: options};
// 	}
// 	if(!options.url) return false;
// 	parsed = url.parse(options.url);
// 	options.host = parsed.hostname;
// 	options.port = Number(parsed.port) || 80;
// 	options.protocol = parsed.protocol;
// 	if(options.protocol == 'https:') options.https = true;
// 	options.path = '/';
// 	if(parsed.pathname) {
// 		options.path = parsed.pathname;
// 	}
// 	if(parsed.search) {
// 		options.path += parsed.search;
// 	}
// 	if(parsed.hash) {
// 		options.path += parsed.hash;
// 	}
// 	
// 	return options;
// }