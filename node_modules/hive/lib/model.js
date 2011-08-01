var backbone = require('backbone'),
	hive = require('./hive'),
	EventEmitter = require('events').EventEmitter,
	Base = backbone.Model;
var exports = module.exports = Base.extend({
	
	assert: {
		topic: null,
		add: function() {
			var errs = this._self.errors || (this._self.errors = []);
			errs.push(this.topic);
		},
		exists: function(object) {
			if(!object || object === '')
			{
				this.add();
			}
		},
		true: function (boolean) {	
			if(boolean !== true)
			{
				this.add();
			}
		},
		email: function (email) {
			if(email && !email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)) {
				this.add();
			}
		}
	},
	
	describe: function (rules) {
		this.assert._self = this;
		for(var topic in rules) {
			var value = this.get(topic);
			for(var subRule in rules[topic]) {
				this.assert.topic = subRule;
				rules[topic][subRule].apply(this, [value]);
			}
		}
		return this.errors;
	},
	
	isNew: function() {
		return !this.id && !this.get('_id');
	},
	
	watch: function(model) {
		var _self = this;
		if(model instanceof EventEmitter) {
			
			// for instances of EventEmitter bind to 
			// all events in the saw namespace
			var _emit = model.emit;
			model.emit = function(type) {
				if(_self.saw && _self.saw[type]) {
					var args = Array.prototype.slice.call(arguments, 1);
					_self.saw[type].apply(_self, args);
				}
				_self.trigger('saw:' + type);
				_emit.apply(_self, arguments);
			}
			
		} else {
			
			// this will soon be deprecated in favor of EventEmitters
			// proxy all events of a hive.Model to a watching model
			model.bind('all', function(eventName) {
				_self.trigger('saw:' + eventName);
				if(_self.saw && _self.saw[eventName]) {
					 _self.saw[eventName].apply(_self, arguments)
				}
			});
			
		}
		
		return _self;
	},
	notify: function(model) {
		model.watch(this);
		return this;
	},
	success: function(attributes, isSilent) {
		this.syncing = false;
		if(attributes) {
			this.set(attributes, {silent:!!isSilent});
		}
		this.trigger('success');
		this.trigger('ready');
		return this;
	},
	error: function(e, context) {
		this.syncing = false;
		hive.log('**ERROR**', (e && e.message) || e, '@ ' + this.get('path') || ' a hive model');
		hive.log(new Error().stack);
		var error = {};
		error[context || this._name || 'unkown'] = e || 'An error has occured';
		this.push({errors: error});
		this.trigger('error');
		this.trigger('ready');
		return this;
	},
	once: function(event, callback) {
		var _self = this;
		var listener = function() {
			_self.unbind(event, listener);
			callback.apply(_self, callback.arguments);
		};
		_self.bind(event, listener);
		return _self;
	},
	ready: function(callback) {
		var _self = this;
		if(_self.syncing) {
			_self.once('ready', function() {
				callback.apply(_self, arguments);
			});
		} else {	
			callback();
		}
		return _self;
	},
	push: function(changes) {
		for(var key in changes) {
			if(!this.get(key)) {
				var ref = {};
				ref[key] = [];
				this.set(ref, {silent: true});
			}
			var arr = this.get(key);
			var values = changes[key];
			if(values && values.length) {
				if(typeof arr === 'function') {
					arr.push.apply(arr, values);
				}
			} else if(values) {
				arr.push(values);
			} else {
				throw new Error('hive.Model.push(array, values) requires values to be an array, string, number, or object');
			}
		}
	},
	// Allow fetch to be called with single callback function argument
	fetch: function (options) {
		var args = arguments;
		if(typeof options === 'function') {
			this.once('ready', function(e) {
				options(e);
			});
			args = undefined;
		}
		Base.prototype.fetch.call(this, args);
	},
	trigger : function(ev) {
      var list, calls, i, l;
      if (!(calls = this._callbacks)) return this;
      if (list = calls[ev]) {
        for (i = 0, l = list.length; i < l; i++) {
          typeof list[i] === 'function' && list[i].apply(this, Array.prototype.slice.call(arguments, 1));
        }
      }
      if (list = calls['all']) {
        for (i = 0, l = list.length; i < l; i++) {
          list[i] && list[i].apply(this, arguments);
        }
      }
      return this;
    },
	// Explicitly do not save models with errors.
	save: function (options) {
		if(this.errors && this.errors.length > 0) return;
		Base.prototype.save.call(this, arguments);
	}
});

