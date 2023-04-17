var Socket = require("socket.io").Socket;
var express = require("express");
var app = express();
var http = require("http");
var Server = require("socket.io").Server;
var cors = require("cors");
app.use(cors());
var server = http.createServer(app);
var io = new Server(server, {
    cors: {
        origin: "http://localhost:3001",
        methods: ["GET", "POST"],
    },
});
function numToWord(num) {
    var words = ["one", "two", "three", "four"];
    return words[num - 1];
}
var numPlayers = 0;
var cards = [
    { rank: '6', suit: 'diams', show: true },
    { rank: '6', suit: 'diams', show: false },
    { rank: '6', suit: 'diams', show: true },
    { rank: '6', suit: 'diams', show: false },
    { rank: '6', suit: 'diams', show: true },
    { rank: '6', suit: 'diams', show: false },
];
var playersData = [];
server.listen(3001, function () {
    console.log("SERVER IS LISTENING ON PORT 3001");
});
io.on("connection", function (socket) {
    console.log("user connected with a socket id", socket.id);
    socket.on("playerJoined", function (name) {
        if (numPlayers >= 4) {
            console.log("Game Full. Player", name, "cannot join");
            socket.emit("gameFull"); // Emit event to indicate that the game is full
            return;
        }
        numPlayers++;
        console.log("Player", name, "joined. Number of players:", numPlayers);
        var newPlayer = { name: name, number: "".concat(numToWord(numPlayers)), cards: cards };
        playersData.push(newPlayer);
        if (numPlayers === 4) {
            io.emit("setPlayer", playersData);
            io.emit("startGame");
            console.log("Starting game");
        }
    });
    socket.on("myEvent", function (myData) {
        console.log("Received myMessage:", myData);
    });
});
