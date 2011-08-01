var vows   = require('vows'),
	hive   = require('../index'),
    assert = require('assert');

// file behavior
vows.describe('file').addBatch({
    'When a new text file': {
        topic: new hive.File({path: './assets/test.txt'}),
		'is initialized, saved, and read': {
			topic: function(file) {
				var _self = this;
				file.set({data: 'hello world'});
				file.bind('success', function() {
					//reading file
					var readFile = new hive.File({path: './assets/test.txt'});
					readFile.bind('success', function() {
						_self.callback(null, readFile.get('data'));
					});
					readFile.fetch();
				});
				file.save();
			},
			'it should result in a new file saved with the text "hello world"': function(err, data) {
				assert.equal(data, 'hello world');
			}
		}
    }
}).addBatch({
    'When a file': {
		// use the previously created file
        topic: new hive.File({path: './assets/test.txt'}),
		'is updated with new data': {
			topic: function(file) {
				var _self = this;
				file.update(function(data) {
					return data.replace('hello', 'hey');
				}, function () {
					var readFile = new hive.File({path: './assets/test.txt'});
					readFile.fetch(function () {
						_self.callback(null, readFile.get('data'));
					});
				});
			},
			'it should save the new data to the same file': function(err, data) {
				assert.equal(data, 'hey world');
			}
		}
    }
}).addBatch({
    'A text file': {
		// use the previously created file
        topic: new hive.File({path: './assets/test.txt'}),
		'when pasted to a new location': {
			topic: function(file) {
				var _self = this;
				file.bind('pasted', function() {
					var readFile = new hive.File({path: './assets/pasted.txt'});
					readFile.bind('success', function() {
						_self.callback(null, readFile.get('data'));
					});
					readFile.fetch();
				});
				file.paste('./assets', 'pasted.txt');
			},
			'results in a file in the new location with the same data': function(err, data) {
				assert.equal(data, 'hey world');
			}
		}
    }
}).addBatch({
    'A text file': {
		// use the previously created file
        topic: new hive.File({path: './assets/test.txt'}),
		'asking the file extension': {
			topic: function(file) {
				return file.ext();
			},
			'results in a txt': function(ext) {
				assert.equal(ext, '.txt');
			}
		}
    }
}).addBatch({
    'When a file': {
		// use the previously created file
        topic: new hive.File({path: './assets/test.txt'}),
		'determines its absolute path': {
			topic: function(file) {
				return file.absolute();
			},
			'it should return the absolute path of the file': function(path) {
				assert.equal(path, __dirname + '/assets/test.txt');
			}
		}
    }
}).addBatch({
    'When a file': {
		// use the previously created file
        topic: new hive.File({path: './assets/test.txt'}),
		'deletes itself': {
			topic: function(file) {
				var _self = this;
				file.destroy();
				file.bind('success', function() {
					_self.callback(null, file);
				});
			},
			'it should not exist anymore': function(err, file) {
				assert.isFalse(file.get('exists'));
			}
		}
    }
}).export(module);
