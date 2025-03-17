const playerSprites = [
  '../../image/PlayerTwo.webp',
  '../../image/PlayerOne.png'
]

const playerIndex = Math.floor(Math.random() * playerSprites.length);
class Player {
  constructor({ x, y, radius, color, username }) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.username = username;
    this.sprite = new Image();
    this.spriteLoaded = false;
    this.sprite.src = playerSprites[playerIndex];
    this.sprite.onload = () => {
      this.spriteLoaded = true;
    };
  }

  draw() {
    c.font = '18px roboto';
    c.fillStyle = "white";
    c.fillText(this.username, this.x - 100, this.y + 20);

    c.save();
    // c.shadowColor = this.color;
    c.shadowBlur = 20;

    if (this.spriteLoaded) {
      c.imageSmoothingEnabled = false;
      const spriteWidth = this.radius * 14;
      const spriteHeight = this.radius * 14;
      c.drawImage(
        this.sprite,
        this.x - spriteWidth / 2,
        this.y - spriteHeight / 2,
        spriteWidth,
        spriteHeight
      );
    } else {
      c.beginPath();
      c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      c.fillStyle = this.color;
      c.fill();
    }

    c.restore();
  }
}
