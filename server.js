const express = require('express');
const app = express();
const path = require('path')
const socket = require('socket.io');

const messages = [];
const users = [];

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '/client')));


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/index.html'));
});


const server = app.listen(8000, () => {
  console.log('Server is running on port 8000');
});

const io = socket(server);

io.on('connection', (socket) => {
  console.log('New client! Its id – ' + socket.id);
  socket.on('login', ({ user }) => {
    users.push({ user, id: socket.id });
    socket.broadcast.emit('message', { author: 'ChatBot', content: `${user} has joined the conversation!` });
  });
  socket.on('message', (message) => {
    console.log('Oh, I\'ve got something from ' + socket.id);
    messages.push(message);
    socket.broadcast.emit('message', message);
  });
  socket.on('disconnect', () => {
    console.log('Oh, socket ' + socket.id + ' has left');
    if (users.length > 0) { // prevent server crash if user left before login 
      const indexToRemove = users.findIndex(element => element.id === socket.id);
      const user = users[indexToRemove].user;
      socket.broadcast.emit('message', { author: 'ChatBot', content: `${user} has left the conversation... :(` });
      users.splice(indexToRemove, 1);
    }
  });
  console.log('I\'ve added a listener on message event \n');
});
