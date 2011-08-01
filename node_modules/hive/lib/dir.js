var Model = require('./model'),
	File = require('./file'),
	backbone = require('backbone'),
	fs   = require('fs'),
	path = require('path'),
	util = require('util'),
	hive = require('./hive'),
	rimraf = require('rimraf'),
	find = require('findit').find;

var exports = module.exports = File.extend({
	
	defaults: {children: {files:[], dirs:[]}},
	
	sync: function(method, model) {
		
		model.syncing = true;
		var path = model.get('path');
		switch(method) {
			case 'create':
			case 'update':
				createFullPath(model.absolute(), model, function() {
					hive.log(method + 'd directory @ ' + path);
					model.success();
				});
				break;
			case 'read':
				try
				{
			        var stats = fs.lstatSync(path);
					model.set({exists: stats.isDirectory()}, {silent: true});
			    }
			    catch (e)
			    {
			        return model.error(e);
			    }
				var path = model.get('path');
				var files = [];
				var dirs = [];
				hive.log('Searching all files and directories in ' + path);
				var finder = find(path);
				var cd = path;
				finder.on('file', function (file) {
					var f = new hive.File({path: file});
					(f.dir() === model.absolute() && files.push(f));
				});
				finder.on('directory', function (dir) {
					cd = dir;
					hive.log('Changing directory: ' + cd);
					var d = new hive.Dir({path: dir});
					(d.dir() === model.absolute()) && dirs.push(d);
				});
				finder.on('end', function() {
					hive.log('Found ' + files.length +' files and '+ dirs.length +' directories in ' + path);
					model.success({exists: true, children: {files: files, dirs: dirs}});
				});
				break;
			case 'delete':
				rimraf(model.absolute(), function(err) {
					if(err) return model.error(err);
					model.success({exists: false});
				});
				break;
		}
	},
	move: function (destination, callback) {
		var _self = this;
		fs.rename(_self.get('path'), destination, function (err) {
			if(err) return _self.error('Could not move directory from ' + _self.get('path') + ' to ' + destination);
			_self.success({path: destination});
			callback();
		});
	},
	paste: function(destination, name, queue) {
		if(typeof destination === 'string') {
			destination = new hive.Dir({path: destination});
		}
		var _self = this,
			toPath = [destination.absolute(), name || _self.get('name')].join('/'),
			copy = new hive.Dir({path: toPath, syncing: true}),
			queue = queue || {
				// start with the 1 directory that is being copied
				remaining: 1,
				done: function() {
					copy.trigger('pasted');
					_self.trigger('pasted');
				}
			};	
		copy.syncing = true;
		_self.syncing = true;
		_self.fetch();
		_self.ready(function() {
			copy.bind('success', function() {	
				var children = _self.get('children');
				queue.remaining += children.files.length + children.dirs.length;
				
				// remove the current directory from the items remaining
				queue.remaining--;
				
				children.dirs.forEach(function(dir) {
					dir.paste(copy, null, queue);
				});
				
				children.files.forEach(function(file) {
					file.paste(copy);
					file.bind('success', function() {
						hive.log(queue.remaining);
						queue.remaining--;
						if(queue.remaining <= 0) {
							queue.done();
						}
					});
				});
				
				if(queue.remaining == 0) {
					queue.done();
				}
			});
			copy.save();
		});
		return copy;
	},
	find: function(fileCallback, dirCallback, doneCallback) {
		hive.log('Finding files @ ' + this.get('path'));
		var _self = this,
			finder = find(_self.absolute());
		fileCallback && finder.on('file', function(path) {
			fileCallback(new hive.File({path: path}));
		});	
		dirCallback && finder.on('directory', function(path) {
			dirCallback(new hive.Dir({path: path}));
		});
		doneCallback && finder.on('end', doneCallback);
	}
});


function createFullPath(fullPath, model, callback) {//Thanks aelaguiz!
	fullPath = path.normalize(fullPath) + '/.';
	var parts = path.dirname(fullPath).split("/"),
		working = '/',
		pathList = [],
		parent = working;
		
	for(var i = 0, max = parts.length; i < max; i++) {
		working = path.join(working, parts[i]);
		pathList.push(working);
	}
	
	var recursePathList = function(paths) {

		if(0 === paths.length) {
			callback();
			return;
		}
	
		var working = paths.shift();
		
		try {
			path.exists(working, function(exists) {
				if(!exists) {
					fs.stat(parent, function(stat) {
						try {
							fs.mkdir(working, 0755, function() {
								recursePathList(paths);
							});
						}
						catch(e) {
							model.error("Failed to create path: " + working + " with " + e.toString());
						}
					});
				}
				else {
					recursePathList(paths);				
				}
			});
		}
		catch(e) {
			model.error("Invalid path specified: " + working);
		}
		parent = working;
	}
	
	if(0 === pathList.length)
		model.error("Path list was empty");
	else
		recursePathList(pathList);
}

