class Game {
  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = 480;
    this.canvas.height = 640;
    this.startTime = new Date().getTime();
    this.ctx = this.canvas.getContext("2d");

    this.score = 0;

    this.player = {
      x: 220,
      y: 640,
      shots: [],
      lastShot: null
    };

    this.enemies = [];

    this.keysPressed = {
      left: false,
      right: false,
      up: false,
      down: false,
      z: false,
      x: false
    };

    this.draw = this.draw.bind(this);
    this.update = this.update.bind(this);
    this.handleKeyboard = this.handleKeyboard.bind(this);
    this.deployEnemies = this.deployEnemies.bind(this);

    document.addEventListener(
      "keydown",
      e => this.handleKeyboard(e, true),
      false
    );
    document.addEventListener(
      "keyup",
      e => this.handleKeyboard(e, false),
      false
    );

    document.body.insertBefore(this.canvas, document.body.childNodes[0]);

    requestAnimationFrame(this.draw);
  }

  deployEnemies() {
    // which side?
    var side = parseInt(Math.random() * 3);
    var start = {};
    switch (side) {
      case 0:
        start = { x: 10, y: 300, xVelocity: 10, yVelocity: 0 };
        break;
      case 1:
        start = { x: 10, y: 40, xVelocity: 0, yVelocity: 10 };
        break;
      case 2:
        start = { x: 450, y: 40, xVelocity: 0, yVelocity: 10 };
        break;
      case 3:
        start = { x: 450, y: 300, xVelocity: -10, yVelocity: 0 };
        break;
    }

    var numEnemies = parseInt(Math.random() * 3) + 2;
    for (var i = 0; i < numEnemies; i++) {
      this.enemies.push({ x: start.x, y: start.y, level: 0 });
      switch (side) {
        case 0:
          start.x -= 50;
          break;
        case 1:
          start.y -= 50;
          break;
        case 2:
          start.y += 50;
          break;
        case 3:
          start.x += 50;
          break;
      }
    }
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

    var now = new Date().getTime();
    if (now - this.startTime >= 5000) {
      this.startTime = now;
      this.deployEnemies();
    }

    // update enemy positions
    this.enemies = this.enemies
      .map(enemy => {
        var offset = enemy.level * 40;
        // lower right
        if (enemy.x >= 440 && enemy.y >= 300 + offset) {
          enemy.xVelocity = 0;
          enemy.yVelocity = -10;
        }

        // upper right
        if (enemy.x >= 440 && enemy.y <= 40 + offset) {
          enemy.xVelocity = -10;
          enemy.yVelocity = 0;
          enemy.level += 1;
        }

        // upper left
        if (enemy.x <= 20 && enemy.y <= 40 + offset) {
          enemy.xVelocity = 0;
          enemy.yVelocity = 10;
        }
        // lower left
        if (enemy.x <= 20 && enemy.y >= 300 + offset) {
          enemy.xVelocity = 10;
          enemy.yVelocity = 0;
        }

        enemy.x += enemy.xVelocity;
        enemy.y += enemy.yVelocity;

        return { ...enemy };
      })
      .filter(enemy => {
        return enemy.y < 620;
      });

    // update shots positions
    this.player.shots = this.player.shots
      .map(shot => {
        return { ...shot, y: shot.y - 10 };
      })
      .filter(shot => {
        return shot.y >= 0;
      });

    // check enemy and shot collisions
    this.player.shots.map(shot => {
      this.enemies.map(enemy => {
        if (
          enemy.x <= shot.x &&
          enemy.x + 20 >= shot.x &&
          enemy.y <= shot.y &&
          enemy.y + 20 >= shot.y
        ) {
          // remove the shot
          this.player.shots.splice(this.player.shots.indexOf(shot), 1);
          // remove the enemy
          this.enemies.splice(this.enemies.indexOf(enemy), 1);
          // add points
          this.score += 10;
        }
      });
    });

    // check enemy and player collisions
  }

  draw() {
    // update positions
    this.update();

    // draw all the objects
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, 480, 640);

    // score
    this.ctx.fillStyle = "white";
    this.ctx.font = "30px Arial";
    this.ctx.fillText(`Score: ${this.score}`, 10, 50);

    // draw the player
    this.ctx.fillStyle = "green";
    this.ctx.beginPath();
    this.ctx.moveTo(this.player.x, this.player.y);
    this.ctx.lineTo(this.player.x + 20, this.player.y - 25);
    this.ctx.lineTo(this.player.x + 40, this.player.y);
    this.ctx.lineTo(this.player.x, this.player.y);
    this.ctx.closePath();
    this.ctx.fill();

    // draw the shots
    this.ctx.fillStyle = "orange";
    this.player.shots.map(shot => {
      this.ctx.fillRect(shot.x, shot.y, 3, -15);
    });

    // draw enemies
    this.ctx.fillStyle = "blue";
    this.enemies.map(enemy => {
      this.ctx.fillRect(enemy.x, enemy.y, 20, 20);
    });

    requestAnimationFrame(this.draw);
  }

  handleKeyboard(e, value) {
    // console.log(e.keyCode, value);
    // handle update of what is pressed
    switch (e.keyCode) {
      case 90:
        this.keysPressed.z = value;
        break;
      case 88:
        this.keysPressed.x = value;
        break;
      case 32:
        var now = new Date().getTime();
        if (this.player.lastShot === null || now - this.player.lastShot > 100) {
          this.player.lastShot = now;
          this.player.shots.push({ x: this.player.x, y: this.player.y });
          this.player.shots.push({ x: this.player.x + 36, y: this.player.y });
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
