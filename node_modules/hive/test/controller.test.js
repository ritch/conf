var vows     = require('vows'),
	hive     = require('../lib/hive'),
	fs		 = require('fs'),
    assert	 = require('assert'),
	controller = require('../lib/controller'),
	_		 = require('underscore');

// hide debug
hive.config.debug = false;

// macro for route tests
function routeMacro(opt) {
	var def = {
		at: '/test',
		path: '/',
		method: 'get',
		body: 'ok'
	};
	opt = _.extend(def, opt);
	var result = {
		topic: function(controller) {
			controller[opt.method](opt.path, function(req, res) {
				res.send(opt.body);
			});
			var _self = this,
				path = (opt.path === '/') ? '' : opt.path,
				url = 'http://localhost:3000' + opt.at + path,
				test = new hive.Http({url: url});
			hive.log(url, '*******');
			test.bind('success', function() {
				_self.callback(null, test);
			});
			switch(opt.method) {
				case 'get':
				case 'find':
					test.fetch();
				break;
				case 'post':
					test.set({body: opt.body});
					test.save();
				break;
				case 'delete':
					test.destroy();
				break;
			}
		}
	};
	result['it should respond to a ' + opt.method] = function(err, model) {
		assert.equal(model.res.statusCode, 200);
	};
	return result;
		
}

// controller behavior
vows.describe('controller').addBatch({
	
    'When a new controller': {
        topic: hive.at('/test'),
		'has a base route': {
			topic: function(controller) {
				controller.get('/', function(req, res) {
					res.send('ok');
				});
				hive.app.listen(3000);
				var _self = this,
					test = new hive.Http({url: 'http://localhost:3000/test'});
				test.bind('success', function() {
					_self.callback(null, test);
				});
				test.fetch();
			},
			'it should respond to a GET request at that route': function(err, test) {
				assert.equal(test.res.statusCode, 200);
				assert.equal(test.get('data'), 'ok');
				//hive.app.close();
			}
		},
		'has a simple get route': routeMacro(),
		'has a simple post route': routeMacro({method: 'post', path: '/post'})
    }

}).export(module);
