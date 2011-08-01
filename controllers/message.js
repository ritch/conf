var hive = require('hive');
var view = hive.view;
var redirect = hive.redirect;
var Message = hive.models.Message;
var Messages = hive.queries.Messages;
var io = require('socket.io');
var all = [];

// socket controller
io = io.listen(hive.app);
io.sockets.on('connection', function(socket) {
//	socket.emit('incoming', {test: 5});
	all.push(socket);
});

hive
.at('/messages')
.get('/', Messages)
.at('/message')
.post('/', function(req, res) {
	var msg = new Message(req.body);
	all.forEach(function(socket) {
		socket.emit('message', req.body);
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