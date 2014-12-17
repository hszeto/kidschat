// Set Up //
var http 		= require('http'),
	express 	= require('express'),
	app			= express(),
	port		= process.env.PORT || 9999;

var server 		= http.Server(app);
var io	 		= require('socket.io')(server);

var public_path = require('path')

// Routing //
app.use(express.static(public_path.join(__dirname, 'public')));

app.get('/', function(request, response){
	response.sendFile(__dirname + '/index.html');
});

// Store 10 messages in array
var messages=[];
var storeMessage = function(name,data){
	messages.push({name: name, data:data});
	if (messages.length > 10){
		messages.shift();
	};
};

// Store active users
var chatters=[];
var storeChatter = function(name, id){
	if (name != null){
		chatters.push({name: name, id: id});
	};
};

// Socket.io //
io.on('connection', function(client){
	// user join chat room
	client.on('join', function(name){
		client.username = name;
		//show past 10 messages to new user
		messages.forEach(function(msg){
			client.emit('chat message', msg.name + ": " + msg.data);
		});
		//add active user list
		storeChatter(client.username, client.id);
					// chatters.forEach(function(chatter){
		//emit active users list to clients
		io.emit('active users', chatters);
		console.log(chatters);
					// });
	});
	// listen, broadcast, store messages
	client.on('chat message', function(msg){
		var username = client.username;
    	io.emit('chat message', username+": "+msg);
    	storeMessage(username, msg);
  	});
	// disconnect from server
	client.on('disconnect', function(){
		console.log('user disconnected');
		//remove user from chatters list according to client.id
		chatters.splice(chatters.map(function(x){
				return x.id;
			}).indexOf(client.id), 1);
		console.log(chatters);
		//emit active users list to clients
		io.emit('active users', chatters);
	});
});

// Listen //
server.listen(port);
console.log("Server is running!");