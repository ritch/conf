var express  = require('express'),
	hive = require('./hive'),
	//now = require("now"),
	_ = require('underscore'),
	form = require('connect-form');


// create an app
hive.app = express.createServer(
	// TODO stream body parsing
	(express.bodyDecoder || express.bodyParser)(),
	(express.cookieDecoder || express.cookieParser)(),
	// forms
	form({ keepExtensions: true })
);//ty tj

// create a connection to all clients
// hive.clients = {
// 	// ty dshankar
// 	everyone: now.initialize(hive.app)
// };

// make the public folder available as a static file folder
hive.app.use((express.staticProvider || express.static)(hive.path + '/public'));

// enable cookie middleware
hive.app.use(express.cookieParser());
	console.log(hive.config);
// if session is enabled, use session support
if(hive.config.session && hive.config.session.enabled) {	
  hive.app.use(express.session({
    secret: hive.config.session.secret,
		key: hive.config.name.replace('-', '.').replace(' ', '.') + '.sid'
  }));
}

if(hive.config.view) {
  hive.app.register(hive.config.view.extension, require(hive.config.view.module));
} else {
  // default to use haml
  hive.app.register('.haml', require('hamljs'));
}

// maintain a path for each controller
var context = '/';

// allow the setting of base route contexts on the fly
hive.at = function(controller) {
	
	context = controller;
	return this;
	
};

// a convience method for returning a redirect result
hive.redirect = function(url) {
	return {redirect: url};
};

// a convience method for returning a view result
hive.view = function(view, model) {
	return {view: view, model: model};
};

// a utility for getting a view's path from a route
function view(route, context) {
	
	var _view = false,
		match;
	
	//defaults
	route = route || '/';
	context = context || '/';
	match = route.match(/^\/\w+/);
	
	// map / to index
	if(route === '/') {
		route = '/index';
	} else if(match) {
		// match words trailing /	
		route = match[0];
	}
	
	if(context === '/') {
		context = '/home';
	}
	
	var contextName = context.replace('/', ''),
		routeName = route.replace('/', '');
	
	// search for view
	if(hive.views) {
		if(hive.views[contextName] && hive.views[contextName][routeName + hive.config.view.extension]) {
			_view = (context + route).replace('/', '') + hive.config.view.extension;
		}
		if(!_view) {
			hive.log('Could not find view for ', context, route);
		}
	}
	
	return _view;
	
}

// return the route of the path
function route(path) {
	if(path === '/') path = '';
	if(context === '/') context = '';
	var result = context + path;
	if(!result) result = '/';
	return result;
}

// util to determine if obj is a Model Class
function isModelType(obj) {
	return typeof obj === 'function' && obj.prototype && obj.prototype.constructor && obj.prototype.constructor['_name'];
}

// util to determine if obj is a Query Class
function isQueryType(obj) {
	return isModelType(obj) && obj.prototype.constructor.__super__['_query'];
}

var MULTIPART = 'multipart/form-data';
var MODEL_IDENTIFIER = '_name';

function wrap(method, path, fn, context) {
	
	var _view = view(path, context);
	
	hive.app[method](route(path), function(req, res, next) {
		
		var result, model;
		
		res.view = res.view || _view;
		
		if(isModelType(fn)) {
			var defaults;
			if(method == 'post' || method == 'put') {
				defaults = req.body;
			} else if(isQueryType(fn)) {
				defaults = {query: req.query};
			}
			model = new fn(defaults);
		} else if(typeof fn === 'function') {
			result = fn.apply(this, arguments);
		} else if(!fn && res.view) {
			// if all that was included was a view
			// render it and stop executing the wrapper
			res.render(res.view);
			return;
		}
		
		if(fn instanceof hive.Model || fn instanceof hive.Query) {
			model = fn;
		} else if(result instanceof hive.Model) {
			model = result;
		} else if(result) {
			res.result = result;
			if(result.model) {
				model = result.model;
			} else if(result.view) {
				// if all that was included was a view
				// render it and stop executing the wrapper
				res.render(result.view);
				return;
			}
		}
		
		if(model) {
			res.watch(model);
			switch(method) {
				case 'get':
					model.fetch();
					break;
				case 'post':	
				case 'put':
					model.save();
					break;
				case 'delete':
					model.destroy();
					model.save();
					break;
			}
		}
		
	});
}

// for each supported method
['get', 'post', 'put', 'delete']
.forEach(function(method) {
	
	// wrap callbacks in a response handler
	hive[method] = function(path, fn) {
		wrap(method, path, fn, context);
		return this;
	};
	
});

// extend the functionality of the express response to 'watch' other models for changes
// and automatically send the data or view when success or error occurs
hive.app.use(function(req, res, next) {
	
	// alias for res.view 
	if(res.result && res.result.view) {
		res.view = res.result.view;
	}
	
	// create a simple model to watch for events
	res.watcher = new hive.Model();
	
	// a utility method for res objects
	res.watch = function(model) {
		
		// automatically handle success
		res.watcher.watch(model);
		
		// bind to the watcher event namespace 'saw' and the event success
		res.watcher.bind('saw:success', function() {
			
			if(res.finished) return;
			
			if(res.result) {
				
				// since the model was successfully synced, check for any redirects
				if(res.result.redirect) {
					res.redirect(res.result.redirect);
				}
				
				// and call any result callbacks
				if(typeof res.result.success === 'function') {
					res.result.success();
				}
				
			}
			
			// simplify the object into JSON
			var modelJSON = model.toJSON();
			
			// if the req accepts json or doesn't have a view, respond with json
			if(req.accepts('json') || !res.view) {
				res.send(modelJSON);
			} else {
				// otherwise just render the view with json
				res.render(res.view, {locals: modelJSON});
			}
			
		});
		
		// automatically handle error
		res.watcher.bind('saw:error', function() {
			
			if(res.finished) return;
			
			if(res.result) {
				if(typeof res.result.error === 'function') {
					res.result.error();
				}
			}
			
			res.send({errors: model.errors} || {errors: ["An unkown error occured."]});
		});
		
	};
	
	// a ref to the notify method of the watcher model
	res.notify = function(model) {
		model.watch(this);
	};
	
	// continue to the next request
	next();
}

);