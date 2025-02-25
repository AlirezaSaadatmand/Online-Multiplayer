const express = require('express')
const app = express()

const http = require('http');
const server = http.createServer(app)

const { Server } = require("socket.io")
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 })

const port = 3000

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

const backEndPlayers = {}

io.on("connection", (socket) => {
  console.log('a user connected');
  backEndPlayers[socket.id] = {
    x: 500 * Math.random(),
    y: 500 * Math.random(),
    color: `hsl(${Math.random() * 360}, 100%, 50%)`
  }
  console.log(backEndPlayers);
  io.emit('updatePlayers', backEndPlayers)

  socket.on('disconnect', (reason) => {
    console.log(reason);
    delete backEndPlayers[socket.id]
    io.emit('updatePlayers', backEndPlayers)
  })
})

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
