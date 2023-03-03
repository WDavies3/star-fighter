var canvas;
let game;
var gameOver = false;
var grayWidth;
var blackWidth;
var ctx;
let keys = [];
let stars = [];
let enemies = [];
let playerShots = [];
let enemyShots = [];
let score = 0;
let timeSinceLastShot = new Date();
let player;

function play() {
  let content = document.getElementById("home-page");
  content.remove();
  canvas = document.createElement("canvas");
  document.body.insertBefore(canvas, document.body.childNodes[0]);
  initializeVariables();
  startGame();
}

class GameObject {

  constructor(imageSRC, width, height, speed) {
    this.image = new Image();
    this.image.src = imageSRC;
    this.height = height;
    this.width = width;
    this.speed = speed;
  }

  location(x, y) {
    this.x = x;
    this.y = y;
  }

  draw(ctx) {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }

  hitObject(otherObj) {
    let myLeft = this.x;
    let myRight = this.x + this.width;
    let myTop = this.y;
    let myBottom = this.y + this.height;
    let objLeft = otherObj.x;
    let objRight = otherObj.x + otherObj.width;
    let objTop = otherObj.y;
    let objBottom = otherObj.y + otherObj.height;
    let crash = true;
    if ((myBottom < objTop) ||
      (myTop > objBottom) ||
      (myRight < objLeft) ||
      (myLeft > objRight)) {
      crash = false;
    }
    return crash;
  }
}

class Player extends GameObject {
  constructor(width, height, speed) {
    super("./images/spaceship.gif", width, height, speed);
    this.x = canvas.width / 2 - width / 2;
    this.y = canvas.height - height * 1.5;
    this.health = 5;
  }
}

class Enemy extends GameObject {
  timeSinceEnemyShotLast = new Date();
  constructor(width, height) {
    super("./images/ufo.gif", width, height);
    this.y = 75;
    this.x = Math.floor(Math.random() * blackWidth + grayWidth - width + 5);
    this.speed = 5;
  }

  move() {
    this.x += this.speed;
    if (this.x >= grayWidth + blackWidth - this.width) {
      this.x = grayWidth + blackWidth - this.width - 1;
      this.speed *= -1;
    }

    if (this.x <= grayWidth) {
      this.x = grayWidth + 1;
      this.speed *= -1;
    }
  }

}

class Projectile extends GameObject {
  constructor(imageSRC, x, y, width, height, speed) {
    super(imageSRC, width, height, speed);
    this.x = x;
    this.y = y;
  }

  move() {
    this.y += this.speed;
  }
}

class Star extends GameObject {
  constructor(x, y, speed) {
    super("./images/star.gif", 3, 3);
    this.x = x;
    this.y = y;
    this.speed = speed;
  }

  move() {
    this.y += this.speed;
    if (this.y > canvas.height) {
      this.y = 0 - this.height;
    }
  }
}


function initializeVariables() {
  canvas.height = window.innerHeight - 30;
  canvas.width = window.innerWidth - 30;
  grayWidth = canvas.width / 10;
  blackWidth = canvas.width * 8 / 10;
  ctx = canvas.getContext("2d");
  //populate stars in game area
  for (let i = 0; i < 50; i++) {
    stars.push(new Star(Math.floor(Math.random() * blackWidth + grayWidth), Math.floor(Math.random() * canvas.height), Math.floor((Math.random() * 3) + 3)));
  }
  for (let i = 0; i < 5; i++) {
    enemies.push(new Enemy(75, 50));
  }
  player = new Player(75, 75, 5);
}


document.body.addEventListener("keydown", HandleKeyDown);
document.body.addEventListener("keyup", HandleKeyUp);

//record key down presses
function HandleKeyDown(e) {
  keys[e.keyCode] = true;
}

//record key up presses
function HandleKeyUp(e) {
  keys[e.keyCode] = false;
  // if(keys[32]){
  // }
}

function drawBackGround() {
  //draw black background
  ctx.fillStyle = "#000000";
  ctx.fillRect(grayWidth, 0, blackWidth, canvas.height);
  //draw gray side bars
  ctx.fillStyle = "#a4a9a6";
  ctx.fillRect(0, 0, grayWidth, canvas.height);
  ctx.fillRect(canvas.width * 9 / 10, 0, grayWidth, canvas.height);
}

function displayGameOverScreen(message) {
  drawBackGround()
  ctx.fillStyle = "red";
  ctx.font = "bold 100px Rampart One";
  ctx.textAlign = 'center';
  ctx.fillText(message, (canvas.width / 2), (canvas.height / 3));
}

function displayScore() {
  ctx.fillStyle = "white;"
  ctx.font = "bold 25px times";
  ctx.textAlign = "left";
  ctx.fillText("Score: " + score, grayWidth + 50, 50);
}

function startGame() {
  //if right arrow key is pressed and player is not passed right boundary move player to the right
  if (keys[39]) {
    if (player.x < blackWidth + grayWidth - player.width) {
      player.x += player.speed;
    }
  }
  //if right arrow key is pressed and player is not passed right boundary move player to the right
  if (keys[37]) {
    if (player.x > grayWidth) {
      player.x -= player.speed;
    }
  }
  //if space bar is pressed shoot if shooting delay time has occurred
  if (keys[32]) {
    let checkTime = new Date()
    if (checkTime - timeSinceLastShot > 500) {
      playerShots.push(new Projectile("./images/player_projectile.gif", player.x + player.width / 2 - 2.5, player.y - 25, 5, 25, -10));
      timeSinceLastShot = new Date();
    }

  }
  //clear the screen
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  //draw the background
  drawBackGround();
  //move and draw the stars
  for (let star of stars) {
    star.move();
    star.draw(ctx);
  }
  //draw the player
  player.draw(ctx);
  //draw the enemies
  for (let enemy of enemies) {
    enemy.move();
    enemy.draw(ctx);
    //if enemies collide with each other have them change directions
    for (let i = 0; i < enemies.length; i++) {
      if (enemy.hitObject(enemies[i]) && enemy !== enemies[i]) {
        //change direction
        enemy.speed *= -1;
        //handle enemies on top of each other
        if (enemy.x < enemies[i].x) {
          enemy.x = enemies[i].x - enemy.width - 1;
        }
        else {
          enemies[i].x = enemy.x - enemy.width - 1;
        }
      }
    }
  }
  //move and draw the player's shots
  for (let shot of playerShots) {
    shot.move();
    shot.draw(ctx);
  }

  //let the enemy shoot
  for (let enemy of enemies) {
    let currentTime = new Date()
    if (currentTime - enemy.timeSinceEnemyShotLast > 1500) {
      //10% chance of firing
      let randomChance = Math.ceil(Math.random() * 10);
      if (randomChance > 9) {
        enemyShots.push(new Projectile("./images/enemy_projectile.gif", enemy.x + enemy.width / 2 - 2.5, enemy.y + enemy.height, 5, 25, 10));
        enemy.timeSinceEnemyShotLast = currentTime;
      }
    }
  }

  //move the enemies' shots
  for (let shot of enemyShots) {
    shot.move();
    shot.draw(ctx);
  }

  //test to see if player hit the enemy and if so remove both the enemy
  //and the shot
  if (enemies.length > 0 && playerShots.length > 0) {
    for (let i = enemies.length - 1; i >= 0; i--) {
      for (let k = playerShots.length - 1; k >= 0; k--) {
        if (playerShots[k].hitObject(enemies[i])) {
          playerShots.splice(k, 1);
          enemies.splice(i, 1);
          score++;
        }
      }
    }
  }

  if (enemies.length == 0) {
    cancelAnimationFrame(game);
    displayGameOverScreen("You Win");
    displayScore();
  }

  //test to see if player hit the enemies shots and if so remove both shots
  if (enemyShots.length > 0 && playerShots.length > 0) {
    for (let i = enemyShots.length - 1; i >= 0; i--) {
      for (let k = playerShots.length - 1; k >= 0; k--) {
        if (playerShots[k].hitObject(enemyShots[i])) {
          playerShots.splice(k, 1);
          enemyShots.splice(i, 1);
        }
      }
    }
  }


  //if the player's shot is off the screen remove it from the list
  for (let i = playerShots.length - 1; i >= 0; i--) {
    if (playerShots[i].y < -25) {
      playerShots.splice(i, 1);
    }
  }

  //if the enemies shots are off the screen remove it from the list
  //if enemy shot hit the player remove the shot and the player
  for (let i = enemyShots.length - 1; i >= 0; i--) {
    if (enemyShots[i].hitObject(player)) {
      enemyShots.splice(i, 1);
      player.health--;
      if (player.health <= 0) {
        gameOver = true;
      }
    }
    else if (enemyShots[i].y > canvas.height + 5) {
      enemyShots.splice(i, 1);
    }
  }
  displayScore();
  game = requestAnimationFrame(startGame);
  if (gameOver) {
    cancelAnimationFrame(game);
    displayGameOverScreen("Game Over");
    displayScore();
  }

}


