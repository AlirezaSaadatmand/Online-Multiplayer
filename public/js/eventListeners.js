addEventListener('click', (event) => {

    const canvas = document.querySelector('canvas')
    const { top, left } = canvas.getBoundingClientRect()

    const playerPosition = {
        x: frontEndPlayers[socket.id].x,
        y: frontEndPlayers[socket.id].y,
    }
    const angle = Math.atan2(
        event.clientY - playerPosition.y - top,
        event.clientX - playerPosition.x - left
    )
    socket.emit('shoot', {
        x: playerPosition.x,
        y: playerPosition.y,
        angle
    })
})
