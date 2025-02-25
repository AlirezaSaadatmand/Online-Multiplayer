const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const socket = io()

const scoreEl = document.querySelector('#scoreEl')

const devicePixelRatio = window.devicePixelRatio || 1

canvas.width = innerWidth * devicePixelRatio
canvas.height = innerHeight * devicePixelRatio

const x = canvas.width / 2
const y = canvas.height / 2

const frontEndPlayers = {}

socket.on('updatePlayers', (backEndPlayers) => {
  for (const id in backEndPlayers) {
    const backEndPlayer = backEndPlayers[id]

    if (!frontEndPlayers[id]) {
      frontEndPlayers[id] = new Player({ x: backEndPlayer.x, y: backEndPlayer.y, radius: 10, color: backEndPlayer.color })
    } else {
      frontEndPlayers[id].x = backEndPlayer.x
      frontEndPlayers[id].y = backEndPlayer.y
    }
  }

  for (const id in frontEndPlayers) {
    if (!backEndPlayers[id]) {
      delete frontEndPlayers[id]
    }
  }
  console.log(frontEndPlayers);

})

let animationId
function animate() {
  animationId = requestAnimationFrame(animate)
  c.fillStyle = 'rgba(0, 0, 0, 0.1)'
  c.fillRect(0, 0, canvas.width, canvas.height)

  for (const id in frontEndPlayers) {
    const player = frontEndPlayers[id]
    player.draw()
  }

}

animate()

const keys = {
  w: {
    pressed: false
  },
  a: {
    pressed: false
  },
  s: {
    pressed: false
  },
  d: {
    pressed: false
  }
}

const SPEED = 5

setInterval(() => {
  if (keys.w.pressed) {
    frontEndPlayers[socket.id].y -= SPEED;
    socket.emit('keydown', 'KeyW')
  }
  if (keys.a.pressed) {
    frontEndPlayers[socket.id].x -= SPEED
    socket.emit('keydown', 'KeyA')
  }
  if (keys.s.pressed) {
    frontEndPlayers[socket.id].y += SPEED
    socket.emit('keydown', 'KeyS')
  }
  if (keys.d.pressed) {
    frontEndPlayers[socket.id].x += SPEED
    socket.emit('keydown', 'KeyD')
  }
}, 15);

window.addEventListener('keydown', (event) => {
  if (!frontEndPlayers[socket.id]) return

  switch (event.code) {
    case 'KeyW':
      keys.w.pressed = true;
      break;

    case 'KeyA':
      keys.a.pressed = true;
      break;

    case 'KeyS':
      keys.s.pressed = true;
      break;

    case 'KeyD':
      keys.d.pressed = true;
      break;
  }

})

window.addEventListener('keyup', (event) => {
  if (!frontEndPlayers[socket.id]) return

  switch (event.code) {
    case 'KeyW':
      keys.w.pressed = false;
      break;

    case 'KeyA':
      keys.a.pressed = false;
      break;

    case 'KeyS':
      keys.s.pressed = false;
      break;

    case 'KeyD':
      keys.d.pressed = false;
      break;
  }

})