const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const socket = io()

const scoreEl = document.querySelector('#scoreEl')

const devicePixelRatio = window.devicePixelRatio || 1

canvas.width = 1024 * devicePixelRatio
canvas.height = 576 * devicePixelRatio

c.scale(devicePixelRatio, devicePixelRatio)

const x = canvas.width / 2
const y = canvas.height / 2

const frontEndPlayers = {}
const frontEndProjectiles = {}

socket.on('updateProjectiles', (backEndProjectiles) => {
  for (const id in backEndProjectiles) {
    const backEndProjectile = backEndProjectiles[id]

    if (!frontEndProjectiles[id]) {

      frontEndProjectiles[id] = new Projectile({
        x: backEndProjectile.x,
        y: backEndProjectile.y,
        radius: 5,
        color: frontEndPlayers[backEndProjectile.playerId]?.color,
        velocity: backEndProjectile.velocity
      })
    } else {
      frontEndProjectiles[id].x += backEndProjectile.velocity.x
      frontEndProjectiles[id].y += backEndProjectile.velocity.y
    }
  }
  for (const id in frontEndProjectiles) {
    if (!backEndProjectiles[id]) {
      delete frontEndProjectiles[id]
    }
  }

})

socket.on('updatePlayers', (backEndPlayers) => {
  for (const id in backEndPlayers) {
    const backEndPlayer = backEndPlayers[id]

    if (!frontEndPlayers[id]) {
      frontEndPlayers[id] = new Player({ x: backEndPlayer.x, y: backEndPlayer.y, radius: 10, color: backEndPlayer.color, username: backEndPlayer.username })
      document.querySelector('#playerLabels').innerHTML += `<div data-id="${id}" data-score="${backEndPlayer.score}">${backEndPlayer.username}: ${backEndPlayer.score}</div>`
    } else {

      document.querySelector(`div[data-id="${id}"]`).innerHTML = `${backEndPlayer.username}: ${backEndPlayer.score}`

      document.querySelector(`div[data-id="${id}"]`).setAttribute('data-score', backEndPlayer.score)

      const parentDiv = document.querySelector('#playerLabels')
      const childDiv = Array.from(parentDiv.querySelectorAll('div'))

      childDiv.sort((a, b) => {
        const scoreA = Number(a.getAttribute("data-score"))
        const scoreB = Number(b.getAttribute("data-score"))

        return scoreA - scoreB
      })

      childDiv.forEach(div => {
        parentDiv.removeChild(div)
      })

      childDiv.forEach(div => {
        parentDiv.appendChild(div)
      })

      if (id === socket.id) {

        frontEndPlayers[id].x = backEndPlayer.x
        frontEndPlayers[id].y = backEndPlayer.y

        const lastBackendInputIndex = playerInputs.findIndex(input => {
          return backEndPlayer.sequenceNumber === input.sequenceNumber
        })

        if (lastBackendInputIndex > -1) playerInputs.splice(0, lastBackendInputIndex + 1)

        playerInputs.forEach(input => {
          frontEndPlayers[id].x += input.dx
          frontEndPlayers[id].y += input.dy
        })
      } else {

        gsap.to(frontEndPlayers[id], {
          x: backEndPlayer.x,
          y: backEndPlayer.y,
          duration: 0.015,
          ease: 'linear'
        })
      }
    }
  }

  for (const id in frontEndPlayers) {
    if (!backEndPlayers[id]) {
      const toDelete = document.querySelector(`div[data-id="${id}"]`)
      toDelete.parentNode.removeChild(toDelete)

      delete frontEndPlayers[id]
      if (id == socket.id) {
        document.querySelector("#usernameForm").style.display = "block"
      }
    }
  }

})

let animationId
function animate() {
  animationId = requestAnimationFrame(animate)
  c.fillStyle = 'rgba(0, 0, 0, 0.5)'
  c.clearRect(0, 0, canvas.width, canvas.height)

  for (const id in frontEndPlayers) {
    const player = frontEndPlayers[id]
    player.draw()
  }

  for (const id in frontEndProjectiles) {

    const projectile = frontEndProjectiles[id]
    projectile.draw()
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
const playerInputs = []
let sequenceNumber = 0

setInterval(() => {
  if (keys.w.pressed && frontEndPlayers[socket.id].y - frontEndPlayers[socket.id].radius / 2 - SPEED > 0) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: 0, dy: -SPEED })
    frontEndPlayers[socket.id].y -= SPEED;
    socket.emit('keydown', { keycode: 'KeyW', sequenceNumber })
  }
  if (keys.a.pressed && frontEndPlayers[socket.id].x - frontEndPlayers[socket.id].radius / 2 - SPEED > 0) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: -SPEED, dy: 0 })
    frontEndPlayers[socket.id].x -= SPEED
    socket.emit('keydown', { keycode: 'KeyA', sequenceNumber })
  }
  if (keys.s.pressed && frontEndPlayers[socket.id].y + frontEndPlayers[socket.id].radius / 2 + SPEED < 576) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: 0, dy: SPEED })
    frontEndPlayers[socket.id].y += SPEED
    socket.emit('keydown', { keycode: 'KeyS', sequenceNumber })
  }
  if (keys.d.pressed && frontEndPlayers[socket.id].x + frontEndPlayers[socket.id].radius / 2 + SPEED < 1024) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: SPEED, dy: 0 })
    frontEndPlayers[socket.id].x += SPEED
    socket.emit('keydown', { keycode: 'KeyD', sequenceNumber })
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

document.querySelector("#usernameForm").addEventListener('submit', (event) => {
  event.preventDefault()
  document.querySelector("#usernameForm").style.display = 'none'
  socket.emit('initGame', {
    username: document.querySelector("#usernameInput").value,
    width: canvas.width,
    height: canvas.height,
    devicePixelRatio
  })
})