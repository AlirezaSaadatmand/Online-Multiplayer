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
const backEndProjectiles = {}

const SPEED = 5;

let projectileId = 0

io.on("connection", (socket) => {
  console.log('a user connected');
  backEndPlayers[socket.id] = {
    x: 500 * Math.random(),
    y: 500 * Math.random(),
    color: `hsl(${Math.random() * 360}, 100%, 50%)`,
    sequenceNumber: 0
  }

  io.emit('updatePlayers', backEndPlayers)

  socket.on('initCanvas', ({ width, height }) => {
    backEndPlayers[socket.id].canvas = {
      width,
      height
    }
  })

  socket.on('shoot', ({ x, y, angle }) => {
    projectileId++

    const velocity = {
      x: Math.cos(angle) * 5,
      y: Math.sin(angle) * 5
    }

    backEndProjectiles[projectileId] = {
      x,
      y,
      velocity,
      playerId: socket.id
    }
  })

  socket.on('disconnect', (reason) => {
    console.log(reason);
    delete backEndPlayers[socket.id]
    io.emit('updatePlayers', backEndPlayers)
  })

  socket.on('keydown', ({ keycode, sequenceNumber }) => {
    backEndPlayers[socket.id].sequenceNumber = sequenceNumber
    switch (keycode) {
      case 'KeyW':
        backEndPlayers[socket.id].y -= SPEED;
        break;

      case 'KeyA':
        backEndPlayers[socket.id].x -= SPEED;
        break;

      case 'KeyS':
        backEndPlayers[socket.id].y += SPEED;
        break;

      case 'KeyD':
        backEndPlayers[socket.id].x += SPEED;
        break;
    }
  })
  console.log(backEndPlayers);

})

setInterval(() => {

  for (const id in backEndProjectiles) {
    backEndProjectiles[id].x += backEndProjectiles[id].velocity.x
    backEndProjectiles[id].y += backEndProjectiles[id].velocity.y

    const PROJECTILE_RADIUS = 5
    if (
      backEndProjectiles[id].x - PROJECTILE_RADIUS >= backEndPlayers[backEndProjectiles[id].playerId]?.canvas?.width ||
      backEndProjectiles[id].x + PROJECTILE_RADIUS <= 0 ||
      backEndProjectiles[id].y - PROJECTILE_RADIUS >= backEndPlayers[backEndProjectiles[id].playerId]?.canvas?.height ||
      backEndProjectiles[id].y + PROJECTILE_RADIUS <= 0
    ) {
      delete backEndProjectiles[id]
    }

  }
  io.emit('updateProjectiles', backEndProjectiles)

  io.emit('updatePlayers', backEndPlayers)
}, 15)

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
