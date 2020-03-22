//global variables
let bossSpeed = 0.75
let alienSpeed = 1; //will be adjusted as there are fewer aliens
let shift = 0;
let increment = 0.2
let loss = false
let gameStarted = false
//canvas sizes
let Width = 480
let Height = 480
//font and score variables
let gamerFont;
let score = 0;

//used for sprite manipulation
let framecount = 0;
let blinkspeed = 100;

//used for video

let MIRROR_VIDEO_FEED = true; //hier auf false geändert
let video;
let poseNet;
let overallCertainty = 0.0;
let bodyCenterX = Width * 0.2;
let bodyCenterY = Height * 0.5;
let pose;

//score functions
function preload() {
  gamerFont = loadFont('PressStart2P-Regular.ttf');
}

function draw_gameOver() {
  push();
  fill(46, 49, 49); // black
  let roundCorner = Height * 0.05;
  // rectangle with round corners
  rect(Width * 0.19, Height * 0.09, Width * 0.52, Height * 0.72, roundCorner, roundCorner, roundCorner, roundCorner);

  fill(255, 255, 255); // white

  textFont(gamerFont, 32);
  text("GAME OVER", Width * 0.23, Height * 0.3);

  text("Score:", Width * 0.32, Height * 0.56);
  textFont(gamerFont, 24);
  text(score, Width * (0.42 - 0.02 * (score.toString().length - 1)), Height * 0.68);
  pop();
}

function drawScore() {
  push();
  fill(0, 0, 0);
  rect(0, 0, 5 / 20 * Width, 1 / 20 * Height)

  fill(255, 255, 255);

  textFont(gamerFont, 16);
  text("Score:", 0, 0)

  pop();
}
// model objects

class spaceObject {
  constructor(x, y, width, height, sprites) {
    this.visible = true
    this.x = x;
    this.y = y;
    this.width = width
    this.height = height
    this.sprites = sprites
  }
  draw() {
    if (this.visible) {
      if (this.sprites.length == 2 && framecount % blinkspeed < blinkspeed / 2) {
        if (framecount % blinkspeed < blinkspeed / 2) {
          image(this.sprites[1], this.x, this.y, this.width, this.height)
        }
      } else {
        image(this.sprites[0], this.x, this.y, this.width, this.height)
      }
    }
  }
  explosion() {
    this.visible = false
  }
}



class alien1 extends spaceObject {
  constructor(x, y) {
    super(x, y, 8, 8, [loadImage("sprites/alien-1-a.png"), loadImage("sprites/alien-1-b.png")])
    this.points = 40
  }
  update() {
    if (this.x <= Width / 20) {
      shift = 1
    } else if (this.x >= Width * 19 / 20) {
      shift = -1
    }
  }
}

class alien2 extends spaceObject {
  constructor(x, y) {
    super(x, y, 11, 8, [loadImage("sprites/alien-2-a.png"), loadImage("sprites/alien-2-b.png")])
    this.points = 20
  }
  update() {

    if (this.x <= Width / 20) {
      shift = 1
    } else if (this.x >= Width * 19 / 20) {
      shift = -1
    }
  }
}

class alien3 extends spaceObject {
  constructor(x, y) {
    super(x, y, 12, 8, [loadImage("sprites/alien-3-a.png"), loadImage("sprites/alien-3-b.png")])
    this.points = 10
  }
  update() {
    if (this.x <= Width / 20) {
      shift = 1
    } else if (this.x >= Width * 19 / 20) {
      shift = -1
    }
  }
}


class alien4 extends spaceObject {
  constructor(x, y) {
    super(x, y, 12, 8, [loadImage("sprites/alien-4-a.png")])
    this.points = 200
  }
  update() {
    if (this.x < Width) {
      this.x += bossSpeed
    } else {
      this.x = -0.1 * Width
    }
  }
}

class player extends spaceObject {
  constructor(x, y) {
    super(x, y, 13, 8, [loadImage("sprites/spaceship.png")])
    this.health = 4
  }
  update(Input) {

    this.x = Width - Input;
    /*if (keyIsDown(LEFT_ARROW)) {
      this.x = max(Width / 20, this.x - 5)
    }
    if (keyIsDown(RIGHT_ARROW)) {
      this.x = min(Width * 19 / 20, this.x + 5)
    }
    if (keyIsDown(UP_ARROW)) {
      this.y = max(Height / 20, this.y - 5)
    }
    if (keyIsDown(DOWN_ARROW)) {
      this.y = min(Height * 19 / 20, this.y + 5)
    }
  */
  }

}


class playerBullet extends spaceObject {

  constructor(x, y) {
    super(x, y, 3, 8, [loadImage("sprites/shot-a.png"), loadImage("sprites/shot-d.png")])
    this.bulletSpeed = 3
  }
  update(fleet, motherShip, barricades) {
    this.y -= this.bulletSpeed
    for (var i = 0; i < fleet.ships.length; i++) {
      if (checkCollision(this, fleet.ships[i]) && fleet.ships[i].visible && this.visible) {
        score += fleet.ships[i].points
        fleet.ships[i].explosion()
        this.explosion()
        fleet.ships.splice(i, 1)

      }
      if (checkCollision(this, motherShip)) {
        this.explosion()
        score += motherShip.points
        motherShip.explosion()
      }



      if (checkCollision(this, barricades[0]) && barricades[0].visible) {
        this.explosion()
        barricades[0].health -= 1
        if (barricades[0].health <= 0) {
          barricades[0].explosion()
        }
      }

      if (checkCollision(this, barricades[1]) && barricades[1].visible) {
        this.explosion()
        barricades[1].health -= 1
        if (barricades[1].health <= 0) {
          barricades[1].explosion()
        }
      }

      if (checkCollision(this, barricades[2]) && barricades[2].visible) {
        this.explosion()
        barricades[2].health -= 1
        if (barricades[2].health <= 0) {
          barricades[2].explosion()
        }
      }

      if (checkCollision(this, barricades[3]) && barricades[3].visible) {
        this.explosion()
        barricades[3].health -= 1
        if (barricades[3].health <= 0) {
          barricades[3].explosion()
        }
      }


      this.draw()
    }
  }
}


class enemyBullet extends spaceObject {
  //TO DO : constructor
  constructor(x, y) {
    super(x, y, 3, 8, [loadImage("sprites/shot-a.png"), loadImage("sprites/shot-d.png")])
    this.bulletSpeed = 3
  }
  update(barricades, player) {
    this.y += this.bulletSpeed

    if (checkCollision(this, barricades[0]) && barricades[0].visible) {
      this.explosion()
      barricades[0].health -= 30
      if (barricades[0].health <= 0) {
        barricades[0].explosion()
      }
    }

    if (checkCollision(this, barricades[1]) && barricades[1].visible) {
      this.explosion()
      barricades[1].health -= 30
      if (barricades[1].health <= 0) {
        barricades[1].explosion()
      }
    }

    if (checkCollision(this, barricades[2]) && barricades[2].visible) {
      this.explosion()
      barricades[2].health -= 30
      if (barricades[2].health <= 0) {
        barricades[2].explosion()
      }
    }

    if (checkCollision(this, barricades[3]) && barricades[3].visible) {
      this.explosion()
      barricades[3].health -= 10
      if (barricades[3].health <= 0) {
        barricades[3].explosion()
      }
    }
    if (checkCollision(this, player)) {
      this.explosion()
      player.health--
      if (player.health == 0) {
        player.explosion()
      }

    }
    this.draw()
  }
}







class fleet {
  constructor() {
    // fleet
    this.ships = [];
    this.speed = 1
    for (var i = 0; i < 11; i++) {

      this.ships.push(new alien1(int((Width / 20) * (5 + i)), int((Height / 20) * 3)))

      this.ships.push(new alien2(int((Width / 20) * (5 + i)), int((Height / 20) * 4)))
      this.ships.push(new alien2(int((Width / 20) * (5 + i)), int((Height / 20) * 5)))
      this.ships.push(new alien3(int((Width / 20) * (5 + i)), int((Height / 20) * 6)))
      this.ships.push(new alien3(int((Width / 20) * (5 + i)), int((Height / 20) * 7)))
    }

  }
  draw() {
    for (var i = 0; i < this.ships.length; i++) {
      this.ships[i].draw();
    }
  }
  update() {
    for (var i = 0; i < this.ships.length; i++) {
      if (this.ships[i].visible) {
        this.ships[i].update();
      }
    }
    if (shift == 1) {
      this.setDown()
      this.speed = -this.speed + increment
      shift = 0
    } else if (shift == -1) {
      this.setDown()
      this.speed = -this.speed - increment
      shift = 0
    }
    for (i = 0; i < this.ships.length; i++) {
      this.ships[i].x += this.speed
    }
  }
  setDown() {
    for (var i = 0; i < this.ships.length; i++) {
      this.ships[i].y += 4;
    }
  }

}

class barricade extends spaceObject {
  constructor(x, y) {
    super(x, y, 28, 12, null);
    this.health = 300
  }
  draw() {
    if (this.visible) {
      strokeWeight(2)
      fill("red")
      rect(this.x, this.y, this.width, this.height)
      fill("green")
      rect(this.x, this.y, this.health / 300 * this.width, this.height)

      strokeWeight(0)
    }
  }
}

function setup() {
  var cnv = createCanvas(Width, Height);
  var x = (windowWidth - Width) / 2;
  var y = (windowHeight - Height) / 2;
  cnv.position(x, y);
  frameRate(60);
  strokeWeight(0)
  Fleet = new fleet()
  Player = new player(Width / 2, Height * 19 / 20)
  Boss = new alien4(0, Height * 2 / 20)
  ourBullets = []
  enemyBullets = []
  Barricades = []

  Barricades.push(new barricade(1 / 20 * Width, 17 / 20 * Height))
  Barricades.push(new barricade(6 / 20 * Width, 17 / 20 * Height))
  Barricades.push(new barricade(11 / 20 * Width, 17 / 20 * Height))
  Barricades.push(new barricade(16 / 20 * Width, 17 / 20 * Height))

  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelReady);
  poseNet.on('pose', gotPoses);

}


function draw() {
  //game loop
  if (!loss) {
    if (!gameStarted) {
      drawTitlepage(framecount);
    } else {
      background(46, 49, 49)
      push()
      if (MIRROR_VIDEO_FEED == true) {
        // flip the video vertically to create a video which functions as a mirror
        translate(width, 0); // move canvas to the right
        scale(-1.0, 1.0); // flip x-axis backwards
      }
      tint(255, 100); // make video transparent
      image(video, 0, 0);
      pop();
      //drawScore()
      textFont(gamerFont, 12);
      fill("white")
      text("Score:", 8, 13);
      text(score, 80, 14)
      text("Lives:", Width - 105, 13);
      text(Player.health - 1, Width - 30, 14)
      fill("black")

      Fleet.update()
      Fleet.draw()
      var Input = input() //Player input

      Player.update(Input)
      Player.draw()
      Boss.update()
      Boss.draw()
      if (Fleet.ships.length == 0) {
        Fleet = new fleet()
      }
      if (framecount % 40 == 0) {
        ourBullets.push(new playerBullet(Player.x + Player.width / 2, Player.y + Player.height))
      }

      if (framecount % 20 == 0) {
        var i = int(random(Fleet.ships.length))
        if (Fleet.ships.length > 0) {
          enemyBullets.push(new enemyBullet(Fleet.ships[i].x + Fleet.ships[i].width / 2, Fleet.ships[i].y + Fleet.ships[i].height))
        }
      }
      for (var i = 0; i < ourBullets.length; i++) {
        ourBullets[i].update(Fleet, Boss, Barricades)
        if (!ourBullets[i].visible || ourBullets[i].y < 0) {
          ourBullets.splice(i, 1)
        }
      }
      for (i = 0; i < enemyBullets.length; i++) {
        enemyBullets[i].update(Barricades, Player)
        if (!enemyBullets[i].visible || enemyBullets[i].y > Height) {
          enemyBullets.splice(i, 1)
        }
      }
      for (i = 0; i < Barricades.length; i++) {
        Barricades[i].draw()
      }

      framecount++;
      if (Player.visible) {
        for (i = 0; i < Fleet.ships.length; i++) {
          if (Fleet.ships[i].visible && Fleet.ships[i].y >= 19 / 20 * Height) {
            loss = true
          }
        }
      } else {
        loss = true
      }
    }
  } else {
    background(0, 0, 0)
    draw_gameOver()
  }
}

function input() {
  return bodyCenterX;
}

function drawTitlepage(frame){
  // reset position
  bodyCenterX = Width * 0.5;

  background(46, 49, 49); // color == outer space
  push();

  // main title
  fill(255, 255, 255); // white
  textFont(gamerFont, 28);
  text("Space Invaders", Width * 0.08, Height * 0.3);

  if (frame % 60 < 35) {
    textFont(gamerFont, 14);
    text("* Press ENTER to start game *", Width * 0.08, Height * 0.65);
  }

  textFont(gamerFont, 7);
  text("Authors: Annika Heil, Max Schröder, Yerso Checya Sinti, Julian Roth", Width * 0.01, Height * 0.97);

  textFont(gamerFont, 6);
  text("Sprites - source: https://www.spriters-resource.com/arcade/spaceinv/", Width * 0.01, Height * 0.985);
  pop();
  framecount++;
}

function keyPressed() {
  if (!gameStarted && keyCode === ENTER) {
    gameStarted = true;
    framecount = 0;
  }
}
function checkCollision(bullet, obj) {
  return bullet.x + bullet.width - obj.x > 0 && bullet.x - obj.x < obj.width && !(bullet.y + bullet.height - obj.y - obj.height > 0 || bullet.y - obj.y + obj.height < 0)
}

function gotPoses(poses) {
  if (poses.length > 0) {
    // update the keypoints with the new pose data
    pose = poses[0].pose;
    overallCertainty = pose.score;
    bodyCenterX = 0.25 * (pose.leftShoulder.x + pose.leftHip.x + pose.rightShoulder.x + pose.rightHip.x);
    //bodyCenterX = 0.5 * (pose.leftShoulder.x + pose.rightShoulder.x);
    bodyCenterY = 0.25 * (pose.leftShoulder.y + pose.leftHip.y + pose.rightShoulder.y + pose.rightHip.y);
    //bodyCenterY = 0.5 * (pose.leftShoulder.y + pose.rightShoulder.y);
    //bodyCenterY = 0.5 * (pose.leftEye.y + pose.rightEye.y);
  }
}

function modelReady() {
  console.log('Let\'s get ready to estimate your pose!!!');
}
