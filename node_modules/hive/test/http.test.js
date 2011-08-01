var vows   = require('vows'),
	hive   = require('../index'),
	fs 	   = require('fs'),
	url	   = require('url'),
    assert = require('assert');

// directory behavior
vows.describe('http').addBatch({
	
    'When a new request': {
        topic: new hive.Http({url: 'http://google.com'}),

		'tries to fetch google.com': {
			topic: function(http) {
				var _self = this;
				http.bind('success', function() {
					_self.callback(null, http);
				});
				http.fetch();
			},
			
			'it should contain a response with a status of less that 400': function(err, http) {
				assert.isTrue(http.res.statusCode < 400);
			}
		}
		
    }
}).export(module);