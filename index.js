const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const path = require("path");
const fs = require("fs");

const app = express();
const httpserver = http.Server(app);
const io = socketio(httpserver);

const gamedirectory = path.join(__dirname, "html");

app.use(express.static(gamedirectory));

httpserver.listen(3000);

var rooms = []; // Salas
var usernames = [];

io.on('connection', function(socket) {
  socket.on("join", function(room, username) {
    if (username != "") {
      rooms[socket.id] = room;
      usernames[socket.id] = username;
      socket.leaveAll();
      socket.join(room);
      io.in(room).emit("recieve", username + " entrou no chat.");
      socket.emit("join", room);
    }
  });

  socket.on("send", function(message) {
    io.in(rooms[socket.id]).emit("recieve", usernames[socket.id] + " => " + message);
  });

  socket.on("recieve", function(message) {
    socket.emit("recieve", message);
  });

  // Adicione uma nova rota para salvar a conversa em arquivo
  socket.on("saveConversation", function() {
    const roomName = rooms[socket.id];
    if (roomName && roomName !== "ONLINE") {
      const conversation = messages.join("\n");
      const filename = `${roomName}.txt`;
      fs.writeFileSync(filename, conversation);
      socket.emit("conversationSaved", filename);
    }
  });
});
