var hive = require('hive');
var view = hive.view;
var redirect = hive.redirect;
var Message = hive.models.Message;
var Messages = hive.queries.Messages;

hive
.at('/messages')
.get('/', Messages)
.at('/message')
.post('/', function(req, res) {
	var msg = new Message(req.body);
	return msg;
})
.put('/', function(req, res) {
	var msg = new Message(req.body);
	return msg;
});