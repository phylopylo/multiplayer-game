const fs = require('fs');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

const length = 50;
const width = 100;

var world = new Array(width);

var players = new Array();

for (i = 0; i < width; i++) {
	world[i] = new Array(length);
	for (j = 0; j < length; j++) {
		world[i][j] = "0";
	}
}

function gameState() {

	for (i = 0; i < width; i++) {
		world[i] = new Array(length);
		for (j = 0; j < length; j++) {
			world[i][j] = "0";
		}
	}

	for (j = 0; j < players.length; j++) {
		world[players[j].x][players[j].y] = players[j].name;
	}

	return { world: world, players: players }
};

function printWorld(){
	for (d = 0; d < world.length; d++) {
		var temp = "";
		for (k = 0; k < world[0].length; k++) {
			temp += world[d][k] + " ";
		}
		console.log(temp);
	}
}

function updateGame() {
	var game = gameState();
	world = game.world;
	io.emit('game', gameState());
}

function locationCheck(x, y) {
	if (x > (width - 1) || x < 0 || y > (length - 1) || y < 0) {
		return false;
	}
	if (world[x][y] != 0) {
		return false;
	} else {
		return true;
	}
}

function randomLocation() {

	x = Math.floor(Math.random() * Math.floor(width));
	y = Math.floor(Math.random() * Math.floor(length))

	if (locationCheck(x, y)) {
		return [x, y]
	} else {
		randomLocation();
	}

}


const server = http.listen(8080, function () {
	console.log('listening on *:8080');
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
})


io.sockets.on('connection', function (socket) {

	io.emit('notification', "Game Started");

	socket.on('requestPlayer', function (message) {

		playerLocation = randomLocation();

		players.push({ name: message, x: playerLocation[0], y: playerLocation[1] });



		io.emit('notification', "Player " + message + " has joined the game");

		updateGame();

	});

	socket.on('movement', function (message) {

		for (x = 0; x < players.length; x++) {
			if (players[x].name == message.id) {
				console.log("player " + message.id + " has moved and is player number " + x);
				break;
			}
		}

		if (message.movement == "d") {
			if (locationCheck(players[x].x, players[x].y + 1)) {
				players[x].y++;
				updateGame();
				console.log("Player " + message.id + " has moved to " + players[x].x + ", " + players[x].y + "");
				io.emit('notification', "Player " + message.id + " has moved to " + players[x].x + ", " + players[x].y + "");

			}
		} else if (message.movement == "w") {
			if (locationCheck(players[x].x - 1, players[x].y)) {
				players[x].x--;
				updateGame();
				console.log("Player " + message.id + " has moved to " + players[x].x + ", " + players[x].y + "");
				io.emit('notification', "Player " + message.id + " has moved to " + players[x].x + ", " + players[x].y + "");

			}
		} else if (message.movement == "a") {
			if (locationCheck(players[x].x, players[x].y - 1)) {
				players[x].y--;
				updateGame();
				console.log("Player " + message.id + " has moved to " + players[x].x + ", " + players[x].y + "");
				io.emit('notification', "Player " + message.id + " has moved to " + players[x].x + ", " + players[x].y + "");
			}
		} else if (message.movement == "s") {
			if (locationCheck(players[x].x + 1, players[x].y)) {
				players[x].x++;
				updateGame();
				console.log("Player " + message.id + " has moved to " + players[x].x + ", " + players[x].y + "");
				io.emit('notification', "Player " + message.id + " has moved to " + players[x].x + ", " + players[x].y + "");
			}
		} else {
			console.log("unknown movement=" + message.movement);
		}
	});

});
