class Game {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 480;
    this.canvas.height = 640;
    this.ctx = this.canvas.getContext("2d");

    this.player = {
      x: 220,
      y: 640,
      shots: [],
      lastShot: null
    }

    this.keysPressed = {
      left: false,
      right: false,
      up: false,
      down: false,
      z: false,
      x: false,
    }

    this.draw = this.draw.bind(this);
    this.update = this.update.bind(this);
    this.handleKeyboard = this.handleKeyboard.bind(this);

    document.addEventListener('keydown', (e) => this.handleKeyboard(e, true), false);
    document.addEventListener('keyup', (e) => this.handleKeyboard(e, false), false);

    document.body.insertBefore(this.canvas, document.body.childNodes[0]);

    requestAnimationFrame(this.draw);
  }

  update() {
    var step = 4;
    // update player position
    if (this.keysPressed.left && this.player.x > 0) {
      this.player.x -= step;
    }
    if (this.keysPressed.right && this.player.x < 440) {
      this.player.x += step;
    }
    if (this.keysPressed.up && this.player.y > 0) {
      this.player.y -= step;
    }
    if (this.keysPressed.down && this.player.y < 640) {
      this.player.y += step;
    }

    // update shots positions
    this.player.shots = this.player.shots.map(shot => {
      return { ...shot, y: shot.y - 5 };
    }).filter(shot => {
      return shot.y >= 0;
    });

  }

  draw() {
    // update positions
    this.update();

    // draw all the objects
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, 480, 640);

    // draw the player
    this.ctx.fillStyle = 'green';
    this.ctx.beginPath();
    this.ctx.moveTo(this.player.x, this.player.y);
    this.ctx.lineTo(this.player.x + 20, this.player.y - 25);
    this.ctx.lineTo(this.player.x + 40, this.player.y);
    this.ctx.lineTo(this.player.x, this.player.y);
    this.ctx.closePath();
    this.ctx.fill();

    // draw the shots
    this.ctx.fillStyle = 'orange';
    this.player.shots.map(shot => {
      console.log(shot.x, shot.y, shot.x + 1, shot.y - 10);
      this.ctx.fillRect(shot.x, shot.y, shot.x + 1, shot.y - 10);
    });
    requestAnimationFrame(this.draw);
  }

  handleKeyboard(e, value) {
    console.log(e.keyCode, value);
    // handle update of what is pressed
    switch (e.keyCode) {
      case 90:
        this.keysPressed.z = value;
        break;
      case 88:
        this.keysPressed.x = value;
        break;
      case 32:
        var now = (new Date()).getTime();
        if (this.player.lastShot === null || now - this.player.lastShot > 100) {
          this.player.lastShot = now;
          this.player.shots.push({ x: this.player.x, y: this.player.y })
          this.player.shots.push({ x: this.player.x + 40, y: this.player.y })
        }
        break;
      case 37:
        this.keysPressed.left = value;
        break;
      case 38:
        this.keysPressed.up = value;
        break;
      case 39:
        this.keysPressed.right = value;
        break;
      case 40:
        this.keysPressed.down = value;
        break;
    }
  }
}

var game = new Game();
