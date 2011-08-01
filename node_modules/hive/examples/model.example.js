// # *Class* hive.Model
var hive = require('hive');

// ### Sample ```hive.Model``` subclass. 
exports = module.exports = hive.Model.extend({
	_name: 'User',
	// ## Behavior Methods
	// This example shows how to override methods that are called by _hive_ when you want to add functionality.
	// ### .initialize(params, options)
	// **params** [_optional_] An object containing the attributes the ```new hive.Model()``` constructor was passed as a first argument.

	// **options** [_optional_] An object containing the attributes the ```new hive.Model()``` constructor was passed as a second argument.

	// ```initialize()``` is called after a model is constructed and after the default parameters have been set.
	initialize: function(params, options) {
		console.log('A user has been created, but not saved.',
					'It was created with these attributes',
					params,
					'...and these options...',
					options);
	},
	
	// ### .sync(method, model)
	// **method** One of ```'create'```, ```'read'```, ```'update'```, or ```'delete'```.

	// **model** The model that is being synced.
	
	// If a model does not have a sync method of its own, hive will call the global ```hive.sync``` method. Read more about it [here](sync.example.html).
	sync: function (method, model) {
		console.log('A user was synced', method, model);
		// By default hive will sync all models to a MongoDB. More on this [here](sync.example.html).
		hive.sync(model, model);
	},
	
	// ### .validate(params)
	// **params** [_optional_] An object containing any parameters that are being set.

	// ```validate()``` is called before properties are ```set()```.
	validate: function() {
		// _hive_'s version of ```assert``` is described in detail [here](assert.example.html).
		var _self = this,
			assert = this.assert;
	// ### .describe(rules)
	// **rules** An object containing keys that associate the validating function to a property of the model.

	// * **key** A string that matches a property of the model.
	// * **value** A function, passed one argument, the value of the property
		return this.describe({
			'email': {
				'you must enter a valid email address': function(email) {
					assert.email(email);
				}
			},
			'password': {
				'you must enter a password': function(password) {
					if(_self.isNew()) {
						assert.exists(password);
					}
				},
				'a password must be atleast 4 characters': function(password) {
					if(password) {
						assert.true(password.length >= 4);
					}
				}
			},
			'name': {
				'a name is required': function(name) {
					assert.exists(name);
				},
				'a name can only be 256 chars in length': function(name) {
					assert.true(name.length < 256);
				}
			}
		});
	},
	
	// ### Defaults
	// All classes in hive provide a way to set default values. Simply set these values in the definition
	// of your class, then after your ```model``` is instantiated, retieve the values with ```model.get('myProperty')```.
	defaults: {
		'role': 'user'
	},
	
	// ### Events
	// All models in _hive_ inherit from node's [Event Emmitter](http://nodejs.org/docs/v0.4.8/api/events.html#events.EventEmitter) class.
	saw: {
		'facebook:connected': function (e) {
			var connections = this.get('connections') || {};
			if(e.token) {
				connections.facebook = e.token;
				this.emit('connected:facebook');
			} else {
				this.error('connections', 'Could not connect to Facebook');
			}
		}
	}
	
});

// ###Instantiating
// _Hive_ ```requires()``` models for you. You do not need to reference or require them yourself. They will be namespaced under ```hive.models```.
// When this class is loaded into _hive_ it can be accessed by ```hive.models.User```.

// This user is being created with an object of params, and an object of options.
var user = new hive.models.User({
	email: 'hey@there.com',
	name: 'Test Name'
},
{
	silent: true
});

// At this point we will have one error, since a password was not included.
//	{
//		password: 'you must enter a password'
//	}
console.log(user.errors);

// ### Utility Methods
// These methods reduce repetitive code and help simplify models.

// ### .set(params)
// **params** An object containing any parameters to be set.

// ```validate()``` is called before properties are ```set()```. If the params do not validate, they will not be set.
user.set({password: '12345'});

// ### .save(params)
// **params** An object containing any new parameters to be set, if valid, before saved.
// ```save()``` is shorthand for manually calling ```hive.sync('update', user)``` or if the ```model.isNew()``` calling ```hive.sync('create', user)```.
// A model will only save if it passes its ```.validate()``` method without returning any errors and if ```.errors``` is null.
user.save();

// ### .fetch()
// ```fetch()``` is shorthand for manually calling ```hive.sync('read', user)```.
user.fetch();

// ### .destroy()
// ```destroy()``` is shorthand for manually calling ```hive.sync('delete', user)```.
user.destroy();

// ### .ready(callback)
// **callback** is a function called one time after a model is done syncing, or when a model is idle.

user.ready(function () {
	console.log('Done syncing...');
});


















