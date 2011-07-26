var hive = require('hive');
var view = hive.view;
var redirect = hive.redirect;
var User = hive.models.User;
var Users = hive.queries.Users;

hive
.at('/user')
.get('/login')
.post('/login', function(req, res) {
	
	var password = req.param('password'),
			email = req.param('email');
			
	if(password && email) {
		password = hive.hash(password);
		
		var query = new hive.queries.Users({query:{email: email, password: password}});
		query.fetch(function() {
				req.session.uid = model.get('_id');
		});
		query.notify(res);
		
	} else {
		res.send({errors: [{key: 'all', msg: 'You must provide a username and password'}]});
	}
	
})
.get('/register')
.post('/register', function(req, res) {
	var model = new User(req.body);
	return model;
});