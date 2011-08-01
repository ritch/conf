var vows   = require('vows'),
	hive   = require('../index'),
	fs 	   = require('fs'),
    assert = require('assert');

// directory behavior
vows.describe('dir').addBatch({
	
    'When a new directory': {
        topic: new hive.Dir({path: './assets/test'}),

		'is created': {
			topic: function(dir) {
				var _self = this;
				dir.bind('success', function() {
					
					// create several files/directories to test
					for(var i = 3; i > 0; i--) {
						var testFile = new hive.File({path: dir.absolute() + '/test' + i + '.txt'});
						testFile.save();
						var testDir = new hive.Dir({path: dir.absolute() + '/testdir' + i});
						testDir.save();
					}
					
					fs.stat(dir.get('path'), function(err, stat) {
						if(err) {
							_self.callback(err);
						} else {
							setTimeout(function() {
								_self.callback(null, stat.isDirectory());
							}, 500);
						}
					});
				});
				
				dir.save();
			},
			
			'it should result in a new directory that exists': function(err, isDirectory) {
				if(err) console.log(err.message);
				assert.isTrue(isDirectory);
			}
		}
    }
}).addBatch({
	
    'When a directory': {
        topic: new hive.Dir({path: './assets/test'}),

		'is pasted into another directory': {
			topic: function(dir) {
				var _self = this,
					newPath = 'copy of test';
				dir.bind('pasted', function() {
					fs.stat('./assets/' + newPath, function(err, stat) {
						if(err) {
							_self.callback(err);
						} else {
							_self.callback(null, stat.isDirectory(), dir);
						}
					});
				});
				dir.paste('./assets', newPath);
			},
			
			'it should result in a new directory containing 3 files and 3 directories': function(err, isDirectory, dir) {
				if(err) console.log(err.message);
				assert.isTrue(isDirectory);
				var children = dir.get('children');
				assert.equal(children.files.length, 3);
				assert.equal(children.dirs.length, 3);
			}
			
		}
    }

}).addBatch({
	
    'When a directory': {
        topic: new hive.Dir({path: './assets/test'}),

		'is deleted': {
			topic: function(dir) {
				var _self = this;
				dir.destroy();
				dir.ready(function() {
					fs.lstat(dir.absolute(), function(stat) {
						_self.callback(null, stat && stat.message);
					});
				});
				
			},
			
			'it should no longer exist': function(err, msg) {
				assert.isTrue(msg && !!msg.match(/^ENOENT/));
			}
			
		}
    }

}).export(module);

// sync: function(method, model) {
// 
// paste: function(destination, name, queue) {
// 
// find: function(fileCallback, dirCallback, doneCallback) {