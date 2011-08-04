var hive = require('hive');
var view = hive.view;
var redirect = hive.redirect;
var Message = hive.models.Message;
var Messages = hive.queries.Messages;
var mongoose = require('mongoose');
var io = require('socket.io');
var all = [];

// socket controller
io = io.listen(hive.app);
io.sockets.on('connection', function(socket) {
	all.push(socket);
});

hive
.at('/messages')
.get('/', Messages)
.at('/message')
.post('/', function(req, res) {
	var msg = new Message(req.body);
	msg.set({mid: new mongoose.Types.ObjectId});
	all.forEach(function(socket) {
		socket.emit('message', msg.toJSON());
	});
	return msg;
})
.put('/', function(req, res) {
	var msg = new Message(req.body);
	all.forEach(function(socket) {
		socket.emit('update:message', req.body);
	});
	return msg;
});