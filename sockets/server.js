/* eslint-disable no-undef */
const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000"
  }
});

app.get('/', (_, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    socket.on('green-sense-event', (msg) => {
      io.emit('green-sense-event', `Recibido ${msg}`);
    });
});


const postDataToClient = (data) => io.emit('green-sense-read-sensors', data); 

const SOCKER_SERVER_PORT = 4202;
server.listen(SOCKER_SERVER_PORT, () => {
  console.log(`server running at http://localhost:${SOCKER_SERVER_PORT}`);
});

module.exports = { postDataToClient };