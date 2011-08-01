// # *Class* hive.Controller
// An example of a simple hive.Controller class.
// ## Types
// There are two types of Controllers in hive. A traditional class / instanced based Controller that allows for inheritence and a simplified shorthand functional version.
// Either mechanism you choose, in order for hive to load your class automatically, you must include it at you-project/controllers/controllername.js
// 
// ##Dependencies
var hive = require('../lib/hive');
// In order to expose your controller as a class you'll need to export it; this will let it be used as a module, eg. ```var Widgets = require('./widgets');```
exports = module.exports = hive.Controller.extend({
// Each Controller needs a unique name. The convention is to use the singular version of a the model which you are attempting to control, eg. ```User``` instead of ```u``` or ```dashboard```
	// This name implicitly corresponds to its file, ```user.js``` and its reference in the hive namespace ```hive.controllers.User```.
	_name: 'User',
	// Controllers have a root, which must be preceded by a ```/```. This controller will respond to all of its routes at [http://localhost:3000/user](http://localhost:3000/user).
	at: '/user',
	// ###Routes
	// Routes allow you to DRY up your controllers by removing routing code from your actions.
	// They are made up of a key to match and a description of where to go.
	// You can see more examples [here](routes.example.html).
	//
	routes: {
		'/did/:action': {action: 'activity'}
	},
	// ###Actions
	// Actions correspond to things your model can do. In our example, our user can register, login, logout, and tweet.
	// Each action can point to a ```function``` or a ```hive.Result```. More info on results [here](result.example.html). If this is starting to sound too complex, check out the simpler version of controllers [here](simple.controller.example.html).
	actions: {
		post: {
			register: hive.models.User
		},
		delete: {
			logout: hive.models.Session
		},
		login: function (req, res) {
			return view({
				model: new MySession(req.body),
				redirect: '/dashboard',
				success: function() {
					res.cookie('auth', model.get('auth'), {httpOnly: true});
				}
			});
		},
		tweet: function () {
			
		},
		before: {
			register: function (req, res) {

			}
		},
		after: {
			login: function (result) {
				
			}
		}
	}
});










// #Tests
// Hive tests are written in vowjs and hive itself, we encourage you to follow the example of our docs to write your own tests.
var vows = require('vows'),
	fs = require('fs'),
	assert = require('assert'),
	controller = require('../lib/controller'),
	_ = require('underscore');
	Http = hive.Http;

// This will test our above example controller.
vows.describe('controller').addBatch({
	topic: function() {
		var _self = this,
			request = new Http({url: 'http://localhost:3000/widget/about'});
		request.fetch();
		request.ready(function () {
			_self.callback(request.errors, request);
		});
	},
	'The example controller': {
		'should respond to an http get request at http://localhost:3000/widget/about': function(err, request) {
			assert.equal(request.get('data'), sampleResponse);
		}
	}
});
