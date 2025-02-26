addEventListener('click', (event) => {
    const playerPosition = {
        x: frontEndPlayers[socket.id].x,
        y: frontEndPlayers[socket.id].y,
        color: frontEndPlayers[socket.id].color
    }
    const angle = Math.atan2(
        event.clientY * devicePixelRatio - playerPosition.y,
        event.clientX * devicePixelRatio - playerPosition.x
    )
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }
    frontEndProjectiles.push(
        new Projectile({ x: playerPosition.x, y: playerPosition.y, radius: 5, color: playerPosition.color, velocity })
    )
    console.log(frontEndProjectiles);

})
