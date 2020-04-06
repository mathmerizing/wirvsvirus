let DEPLOYMENT_URL; // "https://julianroth.org/wirvsvirus/flappy_squats"
let gamerFont;
let GOAL_FPS;

// model objects
let Width = 640;
let Height = 480;

let MIRROR_VIDEO_FEED = true;

const modes = {
  RANDOM: 'random',
  SQUAT: 'squat'
}
let PIPE_MODE = modes.SQUAT;
let wProgression = [
  Height * 0.2,
  Height * 0.4,
  Height * 0.6,
  Height * 0.8,
  Height * 0.5,
  Height * 0.8,
  Height * 0.6,
  Height * 0.4
]
let progressionIndex = 0;

let video;
let poseNet;
let overallCertainty = 0.0;
let bodyCenterX = Width * 0.2;
let bodyCenterY = Height * 0.5;
let pose;

let score = 0;
let speedMultiplier = 1.0;
let gameOver = false;
let gameStarted = false;

class Pipe {
  constructor(x, y, gap, width, speed) {
    this.x = x;
    this.y = y;
    this.gap = gap;
    this.width = width;
    this.speed = speed;
    this.passed = false;
  }
}

Pipes = [];
let d = 230;
let first = 1400;
function reset_pipes() {
  Pipes = [];
  Pipes.push(new Pipe(first, 200, 80, 50, 3));
  Pipes.push(new Pipe(first + d, 220, 80, 50, 3));
  Pipes.push(new Pipe(first + 2 * d, 200, 80, 50, 3));
}

let Bird = {
  x: Width * 0.2,
  y: Height * 0.5,
  width: 34,
  height: 24
}; // old_x and old_y for deleting old drawing for better performance

//canvas sizes
let framecount = 0;

function preload() {
  gamerFont = loadFont('PressStart2P-Regular.ttf');
}

function setup() {
  var cnv = createCanvas(Width, Height);
  var x = (windowWidth - Width) / 2;
  var y = (windowHeight - Height) / 2;
  cnv.position(x, y);
  // background
  background_img = loadImage("assets/background.png");
  // bird
  downflap = loadImage("assets/yellowbird-downflap.png");
  midflap = loadImage("assets/yellowbird-midflap.png");
  upflap = loadImage("assets/yellowbird-upflap.png");
  // play & share button
  play_button = loadImage("assets/play_button.png");
  share_button = loadImage("assets/share.png");
  // new pipes
  pipe_green_small = loadImage("assets/green_tiny.png");
  pipe_green_big = loadImage("assets/green_big.png");
  pipe_green_huge = loadImage("assets/pipe-green-bottom.png");
  pipe_red_small = loadImage("assets/red_tiny.png");
  pipe_red_big = loadImage("assets/red_big.png");
  pipe_red_huge = loadImage("assets/pipe-red-bottom.png");
  // position
  position = loadImage("assets/position.png");

  // setup video capture and feed video into PoseNet
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelReady);
  poseNet.on('pose', gotPoses);

  DEPLOYMENT_URL = getURL();
  var my_url = new URL(DEPLOYMENT_URL);
  GOAL_FPS = parseInt(my_url.searchParams.get("fps"));

  // if failed to get int value for FPS, then set as 30
  if (isNaN(GOAL_FPS)) {
    GOAL_FPS = 30;
  }

  console.log("FPS has been set to: " + GOAL_FPS);

  frameRate(GOAL_FPS);
  strokeWeight(0);
}

function draw() {
  background(background_img);

  if (!gameStarted) {
    draw_titlepage();
  }
  else {
    push();
    if (MIRROR_VIDEO_FEED == true) {
      // flip the video vertically to create a video which functions as a mirror
      translate(width, 0); // move canvas to the right
      scale(-1.0, 1.0); // flip x-axis backwards
    }
    tint(255, 40); // make video transparent
    image(video, 0, 0);
    pop();

    if (framecount < 300) {
      draw_startingSequence();
    }

    //game loop
    var Input = input() //input function for new bird position
    if (!gameOver) {
      update(Pipes, Bird, Input);
    }

    draw_bird(Bird);
    draw_pipes(Pipes);
    draw_score();
    if (gameOver) {
      draw_gameOver();
    }
  }


  framecount++;
}

function checkCollision(bird, pipe) {
  let isCollision = bird.x + bird.width - pipe.x > 0 && bird.x - pipe.x < pipe.width && (bird.y + bird.height - pipe.y - pipe.gap > 0 || bird.y - pipe.y + pipe.gap < 0);
  if (isCollision) {
    gameOver = true;
  }
  return isCollision;
}

function draw_startingSequence() {
  push();
  tint(255, 80); // make video transparent
  image(position,0,0,640,480);
  fill(255, 255, 255); // white
  textFont(gamerFont, 30);
  text("Position yourself \n  for squatting", Width * 0.1, Height * 0.9);
  pop();
}

function draw_titlepage() {
  // reset progressionIndex
  progressionIndex = 0;
  // reset bird position
  bodyCenterY = Height * 0.5;
  Bird.y = Height * 0.5;
  draw_bird(Bird);

  push();
  // main title
  fill(255, 255, 255); // white
  textFont(gamerFont, 42);
  text("FLAPPY SQUATS", Width * 0.08, Height * 0.3);

  if (framecount % 60 < 35) {
    textFont(gamerFont, 16);
    text("* Press ENTER to start game *", Width * 0.14, Height * 0.85);
  }

  textFont(gamerFont, 8);
  text("Authors: Annika Heil, Max Schröder, Yerso Checya Sinti, Julian Roth", Width * 0.08, Height * 0.97);

  textFont(gamerFont, 6);
  text("Font    - source: https://github.com/JoelBesada/activate-power-mode", Width * 0.08, Height * 0.985);
  text("Sprites - source: https://github.com/sourabhv/FlapPyBird", Width * 0.08, Height * 0.997);
  pop();
}

function keyPressed() {
  if (!gameStarted && keyCode === ENTER) {
    gameStarted = true;
    reset_pipes();
    framecount = 0;
  }
}

function draw_pipes(pipes) {
  let smallRatio = 0.2;
  let bigRatio = 0.4;
  for (var i = 0; i < pipes.length; i++) {
    let bottomSprite;
    let bottomPipeSize = Height - (pipes[i].y + pipes[i].gap);
    let topSprite;
    let topPipeSize = pipes[i].y - pipes[i].gap;

    if (checkCollision(Bird, pipes[i])) {
      // determine size of red pipes
      if (topPipeSize < Height * smallRatio) {
        topSprite = pipe_red_small;
      } else {
        if (topPipeSize < Height * bigRatio) {
          topSprite = pipe_red_big;
        } else {
          topSprite = pipe_red_huge;
        }
      }
      if (bottomPipeSize < Height * smallRatio) {
        bottomSprite = pipe_red_small;
      } else {
        if (bottomPipeSize < Height * bigRatio) {
          bottomSprite = pipe_red_big;
        } else {
          bottomSprite = pipe_red_huge;
        }
      }
    } else {
      // determine size of green pipes
      if (topPipeSize < Height * smallRatio) {
        topSprite = pipe_green_small;
      } else {
        if (topPipeSize < Height * bigRatio) {
          topSprite = pipe_green_big;
        } else {
          topSprite = pipe_green_huge;
        }
      }
      if (bottomPipeSize < Height * smallRatio) {
        bottomSprite = pipe_green_small;
      } else {
        if (bottomPipeSize < Height * bigRatio) {
          bottomSprite = pipe_green_big;
        } else {
          bottomSprite = pipe_green_huge;
        }
      }
    }
    // draw top pipe
    push();
    translate(0, Height);
    scale(1.0, -1.0);
    image(topSprite, pipes[i].x, Height - pipes[i].y + pipes[i].gap, pipes[i].width - pipes[i].speed, pipes[i].y - pipes[i].gap);
    pop();
    // draw bottom pipe
    image(bottomSprite, pipes[i].x, pipes[i].y + pipes[i].gap, pipes[i].width - pipes[i].speed, Height - pipes[i].y - pipes[i].gap);
  }
}

function draw_bird(bird) {
  if (framecount % 15 < 5) {
    image(downflap, bird.x, bird.y, bird.width, bird.height)
  } else if (framecount % 15 < 10) {
    image(midflap, bird.x, bird.y, bird.width, bird.height)
  } else {
    image(upflap, bird.x, bird.y, bird.width, bird.height)
  }
}

function draw_score() {
  push();
  // Draw rectangles with rounded corners having the following radii:
  // top-left = 0, top-right = 0, bottom-right = Height*0.05, bottom-left = 0.
  fill(255, 255, 255);
  rect(0, 0, Width * 0.29, Height * 0.09, 0, 0, Height * 0.05, 0);
  fill(255, 165, 0); // yellow
  rect(0, 0, Width * 0.28, Height * 0.08, 0, 0, Height * 0.05, 0);

  fill(255, 255, 255); // setting color to white
  textFont(gamerFont, 16);
  text("Score: " + score, Width * 0.02, Height * 0.05); // show the Score
  pop();
}

function draw_gameOver() {
  push();
  fill(255, 255, 255); // white
  let roundCorner = Height * 0.05;
  rect(Width * 0.39, Height * 0.19, Width * 0.52, Height * 0.72, roundCorner, roundCorner, roundCorner, roundCorner);
  fill(255, 165, 0); // yellow
  rect(Width * 0.4, Height * 0.2, Width * 0.5, Height * 0.7, roundCorner, roundCorner, roundCorner, roundCorner);
  fill(255, 255, 255); // setting color to white

  textFont(gamerFont, 32);
  text("GAME OVER", Width * 0.42, Height * 0.3);

  textFont(gamerFont, 16);
  text("Restart:", Width * 0.44, Height * 0.46);
  image(play_button, Width * 0.49, Height * 0.5);

  text("Score:", Width * 0.69, Height * 0.46);
  textFont(gamerFont, 24);
  text(score, Width * (0.74 - 0.02 * (score.toString().length - 1)), Height * 0.58);

  textFont(gamerFont, 16);
  text("Share:", Width * 0.58, Height * 0.7);
  image(share_button, Width * 0.61, Height * 0.73);
  pop();
}

function touchStarted() {
  if (!gameStarted) {
    gameStarted = true;
    reset_pipes();
  }
  if (gameOver) {
    // check if restart has been pressed
    if (mouseX >= Width*0.49 && mouseX <= Width*0.49 + 48 && mouseY >= Height*0.5 && mouseY <= Height*0.5 + 48) {
      gameOver = false;
      score = 0;
      reset_pipes();
      gameStarted = false;
    }

    // check if share has been pressed
    if (mouseX >= Width*0.61 && mouseX <= Width*0.61 + 48 && mouseY >= Height*0.73 && mouseY <= Height*0.73 + 48) {
      let shareableText = getShareableText();
      let linkAdress = 'http://twitter.com/share?url='+encodeURIComponent(DEPLOYMENT_URL)+'&text='+encodeURIComponent(shareableText);
      window.open(linkAdress);
    }
  }
}

// When the user clicks the mouse
function mouseClicked() {
  if (gameOver) {
    // check if restart has been pressed
    if (mouseX >= Width*0.49 && mouseX <= Width*0.49 + 48 && mouseY >= Height*0.5 && mouseY <= Height*0.5 + 48) {
      gameOver = false;
      score = 0;
      reset_pipes();
      gameStarted = false;
    }

    // check if share has been pressed
    if (mouseX >= Width*0.61 && mouseX <= Width*0.61 + 48 && mouseY >= Height*0.73 && mouseY <= Height*0.73 + 48) {
      let shareableText = getShareableText();
      let linkAdress = 'http://twitter.com/share?url='+encodeURIComponent(DEPLOYMENT_URL)+'&text='+encodeURIComponent(shareableText);
      window.open(linkAdress);
    }
  }
}

function getShareableText() {
  return "I scored " + score + " points in Flappy Squats! Get up, start moving and try to beat my score! ";
}

function update(pipes, bird, input) {
  for (var i = 0; i < pipes.length; i++) {
    if (pipes[i].x <= -pipes[i].width) {
      pipes[i].x = Width; //*1.1;

      switch (PIPE_MODE) {
        case modes.RANDOM:
          pipes[i].y = pipes[i].gap + random(Height - 3 * pipes[i].gap);
          break;
        case modes.SQUAT:
          // make W progression
          pipes[i].y = wProgression[progressionIndex];
          progressionIndex++;
          progressionIndex = progressionIndex % wProgression.length;

          //let MAX_PERTURBATION = pipes[i].gap;
          //pipes[i].y = pipes[i].gap + i * Height *0.2 + random(-MAX_PERTURBATION,MAX_PERTURBATION);
          break;
        default:
          pipes[i].y = Height * 0.5;
      }

      pipes[i].gap = Height / 10 + random(Height / 20);
      pipes[i].passed = false;
    }
    if (!gameOver && !pipes[i].passed && pipes[i].x < Bird.x) {
      pipes[i].passed = true;
      score++;
      speedMultiplier += 0.03;
      speedMultiplier = min(speedMultiplier, 3.0);
    }
    pipes[i].x -= pipes[i].speed * speedMultiplier * (30.0 / frameRate());
  }

  bird.y = input;
}

function input() {
  return bodyCenterY;
}

function gotPoses(poses) {
  if (poses.length > 0) {
    // update the keypoints with the new pose data
    pose = poses[0].pose;
    overallCertainty = pose.score;
    // bodyCenterX = 0.25 * (pose.leftShoulder.x+pose.leftHip.x+pose.rightShoulder.x+pose.rightHip.x);
    bodyCenterX = 0.5 * (pose.leftShoulder.x + pose.rightShoulder.x);
    // bodyCenterY = 0.25 * (pose.leftShoulder.y+pose.leftHip.y+pose.rightShoulder.y+pose.rightHip.y);
    bodyCenterY = 0.5 * (pose.leftShoulder.y + pose.rightShoulder.y);
    bodyCenterY = 0.5 * (pose.leftEye.y + pose.rightEye.y);
  }
}

function modelReady() {
  console.log('Let\'s get ready to estimate your pose!!!');
}
