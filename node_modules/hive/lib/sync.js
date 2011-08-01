var backbone = require('backbone'),
	mongoose = require('mongoose'),
	_ = require('underscore'),
	hive = require('./hive');

if(hive.config.db && hive.config.db.connection) {
	mongoose.connect(hive.config.db.connection, function (err) {
		
		if(err) return;

		cli
		.write('[')
		.color('cyan')
		.write('Hive connected to')
		.color('green')
		.write(' Mongo')
		.color('white')
		.write(' @ ')
		.color('green')
		.write(hive.config.db.connection)
		.color('white')
		.write(']\r\n\r\n');
		
	});
}

// hive.clients.everyone.now.sync = function(context, data) {
// 	//Call the clients sync method
// 	this.now.csync(context, data);
// }

exports = module.exports = backbone.sync = function(method, model) {
	
	var id = model.get('id') || model.get('_id'),
		json = model.toJSON(),
		now = new Date(),
		utcNow = now.getTime() + (now.getTimezoneOffset() * 60000),
		MongoModel = mongoose.model(model._name, new mongoose.Schema({})),
		liveNamespace = model.get('live');
	var mongoModel = new MongoModel();
	if(typeof model.get('_id') === 'string') {
		id = new mongoose.Types.ObjectId(model.get('_id'));
	}
		
	if(liveNamespace) {
		id  ?
			hive.clients.everyone.now.sync(liveNamespace + '-' + id, json)
			:
			hive.clients.everyone.now.sync(liveNamespace, json);
	}
	
	switch(method) {
		case 'create':
			json.created = utcNow;
			mongoModel.collection.insert(json, function(err) {
				// TODO: err is null even when inserting a doc into a unique index
				if(err) {
					model.error(err);
				} else {
					model.success();
				}
			});
			break;
		case 'update':
			json.updated = utcNow;
			// TODO: map reduce for update
			// TODO: add $push support for arrays
			if(json._id) {
				delete json._id;
			}
			mongoModel.collection.update({_id: id}, json, false, function(err) {
				if(err) {
					model.error(err);
					return;
				} else {
					model.success();
				}
			});
			break;
		case 'read':
				if(model instanceof hive.Query) {
					if(model.query) {
						model.query(MongoModel, function(err, results) {
							if(err || !results) {
								model.error(err);
								return;
							} else {
								model.success({results: results || []});
							}
						});
					} else {
						MongoModel.find(model.get('query'), function(err, results) {
							if(err || !results) {
								model.error(err);
								return;
							} else {
								model.success({results: results || []});
							}
						});
					}
				} else if(id) {
					MongoModel.find({_id: id}, function(err, results) {
						if(err) {
							model.error(err);
						} else if(results) {
							var doc = results[0].doc;
							model.success(doc);
						} else {
							model.error('Cannot find a model with id ' + id);
						}
					});
				} else {
					model.error('Cannot read a model without an id');
				}
			break;
		case 'delete':
				if(id) {
					mongoModel.remove(function(err) {
						if(err) {
							model.error(err);
						} else {
							model.success();
						}
					});
				}
			break;
	}
};
