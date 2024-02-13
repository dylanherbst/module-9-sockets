const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server);

let activeUsers = {};

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  activeUsers[socket.id] = { username: 'Anonymous' }; // Placeholder for user data
  
  socket.on('set username', (username) => {
    if (activeUsers[socket.id]) {
        activeUsers[socket.id].username = username;
        updateActiveUsers(); // Update all clients with the new username list
    }
});
  // Broadcast active users on new connection
  updateActiveUsers();

  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id);
    delete activeUsers[socket.id]; // Remove the user from active users
    updateActiveUsers(); // Update active users on disconnect
  });

  socket.on( 'chat message', (msg) => {
    const username = activeUsers[socket.id].username || 'Anonymous';

    console.log('message:', msg);
    // Emit message to all clients
    io.emit('chat message', { username, msg });
    io.emit('not typing', '');

  });
  socket.on('typing', (username) => {
    socket.broadcast.emit('user typing', username);
});

// Optional: When a user stops typing
socket.on('stop typing', (username) => {
    socket.broadcast.emit('user stopped typing', username);
});
});

function updateActiveUsers() {
  io.emit('active users', Object.keys(activeUsers).map(key => activeUsers[key].username));
}

server.listen(3000, () => {
  console.log('listening on *:3000');
});


// const express = require('express');
// const app = express();
// const http = require('http');
// const { Server } = require("socket.io");
// const server = http.createServer(app);
// const io = new Server(server);

// let activeUsers = {};

// app.get('/', (req, res) => {
// res.sendFile(__dirname + '/index.html');
// });

// io.on('connection', (socket) => {
// io.emit('connection', 'a user connected');
// activeUsers[socket.id] = { username: 'Anonymous' };
// });

// server.listen(3000, () => {
// console.log('listening on *:3000');
// });

// function updateActiveUsers() {
//     io.emit('active users', Object.keys(activeUsers).map(key => activeUsers[key].username));
//   }

// updateActiveUsers();


// io.on('connection', (socket) => {
//     socket.on('chat message', (msg) => {
//       console.log('message: ' + msg);
//     });
//   });

// io.emit('some event', 
// { someProperty: 'some value', otherProperty: 'other value' }); // This will emit the event to all connected sockets

// io.on('connection', (socket) => {
//     socket.broadcast.emit('hi');
//   });

//   io.on('connection', (socket) => {
//     socket.on('chat message', (msg) => {
//       io.emit('chat message', msg);
//     });
//   });