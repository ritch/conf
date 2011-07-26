var hive = require('hive');

exports = module.exports = hive.Model.extend({
	_name: 'user',
	save: function() {
		var errors = this.validate();
		if(errors) return;
		var password = this.get('password');
		if(password) {
			this.set({password: hive.hash(password)});
		}
		var method = this.isNew() ? 'create' : 'update';
		hive.sync(method, this);
	},
	validate: function() {
		var assert = this.assert;
		return this.describe({
			'email': {
				'you must enter a valid email address': function(email) {
					assert.email(email);
				}
			},
			'password': {
				'you must enter a password': function(password) {
					assert.exists(password);
				},
				'a password must be atleast 4 characters': function(password) {
					if(password) {
						assert.true(password.length >= 4);
					}
				}
			}
		});
	}
});