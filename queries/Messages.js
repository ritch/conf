var hive = require('hive');

// Message Query

exports = module.exports = hive.Query.extend({
	_name: 'message',
	initialize: function() {
		
		var q     = this.get('query')
		 ,  since = Number(q.since)
		 ,  lat   = Number(q.lat)
		 ,  long  = Number(q.long)
		 ,  query = {};
		
		if(since) query.updated = {'$gt': since};
		if(lat && long) {
			query.position = {'$near': [lat,long]};
		}
		
		// override original query
		this.set({query: query});
	}
});