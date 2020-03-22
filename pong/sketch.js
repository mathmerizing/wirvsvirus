let MIRROR_VIDEO_FEED = true;
let video;
//let poseNet;
let overallCertainty = 0.0;
let bodyCenter1X = 640 * 0.2;
let bodyCenter1Y = 480 * 0.5;
let bodyCenter2X = 640 * 0.2;
let bodyCenter2Y = 480 * 0.5;
let pose;
let pose2;

// game
let pointsPlayer1 = 0
let pointsPlayer2 = 0


function setup() {
  createCanvas(640, 480);

  //video


  video = createCapture(VIDEO);
  video.hide();
  const poseNet = ml5.poseNet(video, modelReady);
  poseNet.on('pose', gotPoses);
  //game

  Player1 = new player1()
  Player2 = new player2()
  Ball = new ball()
  frameRate(30)

}
let x = 0

function draw() {
  //video
  background("white")
  push()
  if (MIRROR_VIDEO_FEED == true) {
    // flip the video vertically to create a video which functions as a mirror
    translate(width, 0); // move canvas to the right
    scale(-1.0, 1.0); // flip x-axis backwards
  }
  tint(255, 60); // make video transparent
  image(video, 0, 0);
  pop()
  //game

  drawScores()
  Player1.draw()
  Player2.draw()
  Ball.update()
  Ball.checkCollision([Player1, Player2])
  input1()
  Ball.draw()
}

function drawScores(col = "black") {
  fill(col)
  textSize(height / 20)
  text("Score:", width / 7, 20);
  text(pointsPlayer1, 20 + width / 4, 21)
  text("Score:", width / 4 * 3 - 65, 20);
  text(pointsPlayer2, 20 + width / 4 * 3, 21)
  fill("black")
}

function input1() {
  if (bodyCenter1X > bodyCenter2X) {
    Player1.update(bodyCenter1Y)
    Player2.update(bodyCenter2Y)
  } else {
    Player2.update(bodyCenter1Y)
    Player1.update(bodyCenter2Y)
  }
}

function gotPoses(poses) {
  if (poses.length > 0) {
    // update the keypoints with the new pose data
    pose = poses[0].pose;
    //overallCertainty = (poses[0].pose.score + poses[1].pose.score) / 2;
    // bodyCenterX = 0.25 * (pose.leftShoulder.x+pose.leftHip.x+pose.rightShoulder.x+pose.rightHip.x);
    bodyCenter1X = 0.5 * (poses[0].pose.leftEar.x + poses[0].pose.rightEar.x);
    // bodyCenterY = 0.25 * (pose.leftShoulder.y+pose.leftHip.y+pose.rightShoulder.y+pose.rightHip.y);
    bodyCenter1Y = 0.5 * (poses[0].pose.leftEar.y + poses[0].pose.rightEar.y);
    // bodyCenterX = 0.25 * (pose.leftShoulder.x+pose.leftHip.x+pose.rightShoulder.x+pose.rightHip.x);
    //bodyCenter2X = 0.5 * (poses[1].pose.leftShoulder.x + poses[1].pose.rightShoulder.x);
    // bodyCenterY = 0.25 * (pose.leftShoulder.y+pose.leftHip.y+pose.rightShoulder.y+pose.rightHip.y);
    //bodyCenter2Y = 0.5 * (poses[1].pose.leftShoulder.y + poses[1].pose.rightShoulder.y);
  }
  
  if (poses.length > 1 && poses[1].pose.score > 0.5) {
    bodyCenter2X = 0.5 * (poses[1].pose.leftEar.x + poses[1].pose.rightEar.x);
    bodyCenter2Y = 0.5 * (poses[1].pose.leftEar.y + poses[1].pose.rightEar.y);
  }
  else {
    // TO DO: bot moves!!!
  }
}

function modelReady() {
  console.log('Let\'s get ready to estimate your pose!!!');
}


class player1 {
  constructor() {
    this.height = 100
    this.width = 7
    this.y = height / 2 - this.height / 2
    this.x = 0
  }
  draw() {
    fill('white')
    rect(this.x, this.y, this.width, this.height)
  }
  update(y) {
    y -= this.height / 2 //centralize input
    this.y = min(height - this.height, y)
    if (this.y < 0) {
      this.y = 0
    }

  }
}

class player2 {
  constructor() {
    this.height = 100
    this.width = 7
    this.y = height / 2 - this.height / 2
    this.x = width - this.width
  }
  draw() {
    fill('white')
    rect(this.x, this.y, this.width, this.height)
  }
  update(y) {
    y -= this.height / 2 //centralize input
    this.y = min(height - this.height, y)
    if (this.y < 0) {
      this.y = 0
    }

  }
}

class ball {
  constructor() {
    this.height = 10
    this.width = 10
    this.start()
  }
  start() {
    console.log("Player 1 has", pointsPlayer1, "points and Player 2 has", pointsPlayer2, "points")
    this.collided = false
    this.x = width / 2
    this.y = height / 2
    this.vx = random(1, 5)
    this.vy = random(-3, 3)
    this.dir = int(random(2))
    if (this.dir == 0) {
      this.dir = -1
    }
  }
  draw() {
    fill('white')
    rect(this.x, this.y, this.width, this.height)
  }
  update() {
    this.x += (this.vx * this.dir) * 2
    this.y += this.vy * 2
  }
  checkCollision(players) {
    if (this.dir == -1) { // collision check player 1
      if (this.y + this.height > players[0].y && this.y < players[0].height + players[0].y && this.x > 0 && this.x <= players[0].width) {
        this.dir *= -1
        this.vx = random(1, 5)
        this.vy = random(-3, 3)
        this.collided = true
        if (this.vx ^ 2 + this.vy ^ 2 < 10) {
          this.vx *= 2;
          this.vy *= 2
        }
      }
    } else if //collision player2
    (this.y + this.height > players[1].y && this.y < players[1].height + players[1].y && this.x + this.width >= players[1].x && this.x + this.width < players[1].x + players[1].width) {
      this.dir *= -1
      this.vx = random(1, 5)
      this.vy = random(-3, 3)
      this.collided = true
      if (this.vx ^ 2 + this.vy ^ 2 < 10) {
        this.vx *= 2;
        this.vy *= 2
      }
    }
    //no collision
    if (!this.collided) {
      if (this.x < 0) {
        pointsPlayer2++
        this.start()
      }
      if (this.x + this.width > width) {
        pointsPlayer1++
        this.start()
      }

      if (this.y < 0) {
        this.vy *= -1
        this.y = 10
      }
      if (this.y + this.height > height) {
        this.vy *= -1
        this.y = height - this.height - 10
      }


    }
    this.collided = false
  }

}