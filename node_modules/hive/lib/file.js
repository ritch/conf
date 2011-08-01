var model = require('./model');
var backbone = require('backbone');
var fs = require('fs');
var util = require('util');
var fpath = require('path');
var hive = require('./hive');

var EMPTY_FILE = '';

var exports = module.exports = model.extend({
	initialize: function(attributes) {
		var _self = this;
		var path = this.get('path');
		if(path) {
			var name = fpath.basename(path);
			if(name) {
				this.set({name: name});
			}
			if(attributes.watch) {
				fs.watchFile(path, function() {
					_self.sync('read', _self);
					_self.change();
				});
			}			
		}
		return this;
	},
	ext: function() {
		return fpath.extname(this.get('name'));
	},
	absolute: function() {
		return fpath.resolve(this.get('path'));
	},
	dir: function() {
		return fpath.dirname(this.absolute());
	},
	sync: function(method, model) {
		model.syncing = true;
		var path = model.absolute();
		switch(method) {
			case 'create':
			case 'update':
				hive.log(method + '-ing file @ ' + path);
				fs.writeFile(path, model.get('data') || EMPTY_FILE, model.get('encoding'), function(err) {
					hive.log(method + 'd file @ ' + path);
					if(err) return model.error(err);
					model.success({data: model.get('data'), exists: true}, true);
				});
				break;
			case 'read':
				hive.log(method + '-ing file @ ' + path);
				fs.readFile(path, function(err, data) {
					hive.log(method + 'd file @ ' + path);
					if(err) return model.error(err);
					model.success({data: data.toString(), exists: true});
				});
				break;
			case 'delete':
				hive.log(method + '-ing file @ ' + path);
				fs.unlink(path, function(err) {
					hive.log(method + 'd file @ ' + path);
					if(err) return model.error(err);
					model.success({data: null,  exists: false});
				});
				break;
		}
	},
	paste: function(destination, name) {
		var _self = this;
		_self.syncing = true;
		if(typeof destination === 'string') {
			destination = new hive.Dir({path: destination});
		}
		var name = name || _self.get('name'),
		 	path = destination.get('path') + '/' + name;
		if(!path) _self.error('Could not paste file to hive.Dir without a path');
		var i = fs.createReadStream(_self.get('path')),
			o = fs.createWriteStream(path);
		util.pump(i, o, function() {
			hive.log('wrote file @ ' + path);
			_self.trigger('pasted');
			_self.success({data: o});
		});
		return this;
	},
	update: function(callback, done) {
		var _self = this;
		hive.log('**UPDATING**', _self);
		_self.fetch(function() {
			hive.log('**UPDATING**', 'fetched');
			hive.log('**UPDATING** data - ', _self.get('data'));
			
			var changed = callback(_self.get('data') || '');
			hive.log('**UPDATING** changed - ', changed);
			_self.set({data: changed}, {silent: true});
			_self.once('success', function() {
				hive.log('**UPDATING**', 'done');
				done && done();
			});
			_self.save();
		});
	}
});