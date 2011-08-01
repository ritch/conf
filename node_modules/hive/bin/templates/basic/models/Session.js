var hive = require('hive'),
    User = hive.models.User;

exports = module.exports = hive.Model.extend({
	_name: 'session',
	save: function () {
		
		if(this.isNew()) {
			var password = hive.hash(this.get('password'));
			var email = this.get('email');
		
			// try logging in by validating the credentials
			var query = new hive.queries.Users({query:{email: email, password: password}});
			query.notify(this).fetch();
		} else {
			hive.sync('update', this);
		}
		
	},
	validate: function() {
		var assert = this.assert;
		return this.describe({
			'password': {
				'you must include a password to login': function (password) {
					assert.exists(password);
				}
			},
			'email': {
				'you must include a valid email': function(email) {
					assert.exists(email);
					assert.email(email);
				}
			}
		});
	},
	saw: {
		success: function() {
			this.set({'auth': hive.hash(this)});
			this.unset('password');
			hive.sync('create', this);
		},
		error: function() {
			this.error('could not login');
		}
	}
});
