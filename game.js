var canvas = document.getElementById("game");
var context = canvas.getContext("2d");
var GRAVITY_FORCE = 0.01;
var leftKey = false;
var rightKey = false;
var upKey = false;
var finalVelocity = 0;
var gameOver = false;
var peakXPositions = [];
var lastRightLeg = false;
var lastLeftLeg = false;
var cracksDrawn = false;
for(var i = 0; i < 4; i ++){
  peakXPositions.push(Math.floor(canvas.width * Math.random()));
}
var peakYPositions = [];
for(var i = 0; i < peakXPositions.length; i ++){
  peakYPositions.push((Math.random()/4 + .75) * 100);
}

var randomBumps = [];
var numberOfBumps = Math.floor(30 * (.25 * Math.random() + .75));
for(var i = 0; i < numberOfBumps; i ++){
  randomBumps.push(Math.floor(canvas.width * Math.random()));
}

var heights = [];
for(var i = 0; i < canvas.width; i ++){
  var closest = canvas.width;
  var closestIndex = -1;
  for(var a = 0; a < peakXPositions.length; a ++){
    var distance = Math.abs(peakXPositions[a] - i);
    if(distance < closest){
      closest = distance;
      closestIndex = a;
    }
  }
  var equation = peakYPositions[closestIndex] * Math.pow(Math.E/(200 * Math.sqrt(2 * Math.PI)), (Math.pow(closest, 2) / 80000));
  var closestBump = canvas.width;
  for(var a = 0; a < numberOfBumps; a ++){
    var bumpDistance = Math.abs(i - randomBumps[a]);
    if(bumpDistance < closestBump){
      closestBump = bumpDistance;
    }
  }
  var bumpyValue = equation + (15 * Math.pow(Math.E/(30 * Math.sqrt(2 * Math.PI)), (Math.pow(closestBump, 2) / 1800)));
  var finalValue = bumpyValue * (.01 * Math.random() + .99);
  heights.push(finalValue);
}

function Spaceship(size, position, power) {
    this.color = "blue";
    this.width = size;
    this.height = size * 2.5;
    this.position = position;
    this.velocity = {
      x: 0,
      y: 0
    };
    this.angle = 0;
    this.engineOn = false;
    this.rotation = 0;
    this.power = power;
    this.leftLegX;
    this.leftLegY;
    this.rightLegX;
    this.rightLegY;
    this.excessAngle = Math.atan((2 * this.width)/((5 * this.height) + (10 * this.width * Math.sqrt(2))));//Angle (constant) used in many calculations.
    this.circleRadius = (this.width * Math.sqrt(2)) + (this.height/4.3); //Used for calculating positions of legs with sin() and cos(). Constant.
    this.damage = 0; //1 is damaged + not drivable, 2 is destroyed, 3 is annihilated.(I can't spell that word.)
    this.impactVelocity = 0; //velocity of last impact.
    this.speed = 0; //Current speed.
}

function drawRect(x, y, width, height, color){
  context.beginPath();
  context.fillStyle = color;
  context.fillRect(x, y, width, height);
  context.closePath();
}

Spaceship.prototype.draw = function(){
  context.save();
  context.translate(this.position.x, this.position.y);
  context.rotate(this.angle);
  drawRect(this.width * -0.5, this.height * -0.5, this.width, this.height, this.color);
  context.beginPath();
  context.arc(0, this.height * -0.2, this.width/1.1, 0, 2 * Math.PI);
  context.fillStyle = this.color;
  context.fill();
  context.closePath();
  context.rotate(Math.PI/4);
  drawRect((this.width*Math.sqrt(2))/2, 0, this.height/2, this.width/5, this.color);
  drawRect(0, (this.width*Math.sqrt(2))/2, this.width/5, this.height/2, this.color);
  context.rotate(-Math.PI/4);
  if(this.engineOn){
        context.beginPath();
        context.moveTo(this.width * -0.5, this.height * 0.5);
        context.lineTo(this.width * 0.5, this.height * 0.5);
        context.lineTo(0, this.height * 0.5 + (Math.random() * 5 * this.height/16));
        context.lineTo(this.width * -0.5, this.height * 0.5);
        context.closePath();
        context.fillStyle = "orange";
        context.fill();
  }
  context.restore();
  if(this.position.y < -this.height){
    context.beginPath();
    context.moveTo(this.position.x, 0);
    context.lineTo(this.position.x - 15, 15);
    context.lineTo(this.position.x + 15, 15);
    context.lineTo(this.position.x, 0);
    context.closePath();
    context.fillStyle = "gray";
    context.fill();
  }
  drawRect(10, 10, 20, 20, "gray");
  context.beginPath();
  context.fillStyle = "gray";
  context.moveTo(20, 20);
  context.lineTo((Math.cos(this.angle - (Math.PI/2)) * 10) + 20, (Math.sin(this.angle - (Math.PI/2)) * 10) + 20);
  context.stroke();
  context.closePath();
  /*
  context.beginPath();
  context.fillStyle = "gray";
  context.moveTo(20, 20);
  context.lineTo((Math.cos(Math.atan(this.velocity.y/this.velocity.x)) * 10) + 20, (Math.sin(Math.atan(this.velocity.y/this.velocity.x)) * 10) + 20);
  context.stroke();
  context.closePath();
  */
  drawRect(32, 10, 60, 20, "gray");
  drawText(Math.round(this.speed * 10)/10, 44, 28, "black");
  drawRect(this.rightLegX, this.rightLegY, 1, 1, "gray");
  if(this.damage != 0 && !cracksDrawn){
    for(var i = 0; i < 4; i ++){
      var x = canvas.width/2;
      var y = canvas.height/2;
      var up = (Math.random() > .5);
      var left = (Math.random() > .5);
      context.beginPath();
      context.strokeStyle = "white";
      context.moveTo(x, y);
      while(x < canvas.width && x > 0 && y < canvas.height && y > 0){
        x += (Math.random() * 100 - ((left) ? 65 : 35));
        y += (Math.random() * 100 - ((up) ? 60 : 40));
        context.lineTo(x, y);
      }
      context.stroke();
      context.closePath();
    }
    cracksDrawn = true;
  }
}

Spaceship.prototype.update = function(){
  if(this.damage == 0){
    this.rightLegX = this.position.x + Math.cos(this.angle + (Math.PI/4) + this.excessAngle) * this.circleRadius;
    this.rightLegY = this.position.y + Math.sin(this.angle + (Math.PI/4) + this.excessAngle) * this.circleRadius;//Right Leg
    this.leftLegX = this.position.x + Math.cos(this.angle + ((3 * Math.PI)/4) - this.excessAngle) * this.circleRadius;//Left Leg
    this.leftLegY = this.position.y + Math.sin(this.angle + ((3 * Math.PI)/4) - this.excessAngle) * this.circleRadius;//Left Leg
    //this.lowestY = this.position.y + ((lowestY1 > lowestY2) ? lowestY1 : lowestY2);
    if(leftKey){
      this.rotation -= this.power * Math.PI / 240;
    }
    if(rightKey){
      this.rotation += this.power * Math.PI / 240;
    }
    this.rotation += -(this.rotation * Math.PI/180); //Friction
    this.angle += this.rotation;

    this.engineOn = upKey;
    if(this.engineOn){
      this.velocity.x -= this.power * Math.sin(-this.angle);
      this.velocity.y -= this.power * Math.cos(this.angle);
    }
    this.velocity.y += GRAVITY_FORCE; //Gravity
    var rightLegOnGround = this.rightLegY > canvas.height - heights[Math.floor(this.rightLegX)];
    var leftLegOnGround = this.leftLegY > canvas.height - heights[Math.floor(this.leftLegX)];

    if(rightLegOnGround){
      if(!lastRightLeg){
        var torque = (Math.PI/500) * Math.sin(this.angle - this.excessAngle + (Math.PI/2)) * this.circleRadius * GRAVITY_FORCE;// sin(theta) * F * R
        this.rotation -= torque;
        if(!leftLegOnGround){
          this.impactVelocity = Math.sqrt(Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.y, 2));
          this.velocity.x -= 0.5 * this.velocity.x * this.velocity.y;
        }
      }
      var forceY = this.velocity.y;
      if(this.velocity.y > 0){
        this.velocity.y = -((forceY)/4);
      }
      if(this.rightLegY - canvas.height + heights[Math.floor(this.rightLegX)] > 3){
        this.velocity.y -= 0.03;
      }
      this.velocity.x += (this.velocity.x > 0) ? -0.01 : 0.01;
    }

    if(leftLegOnGround){
      if(!lastLeftLeg){
        var torque = (Math.PI/500) * Math.sin(this.angle - this.excessAngle + (Math.PI/2)) * this.circleRadius * GRAVITY_FORCE;// sin(theta) * F * R
        this.rotation += torque;
        if(!rightLegOnGround){
          this.impactVelocity = Math.sqrt(Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.y, 2));
          this.velocity.x -= 0.5 * this.velocity.x * this.velocity.y;
        }
      }
      var forceY = this.velocity.y;
      if(this.velocity.y > 0){
        this.velocity.y = -((forceY)/4);
      }
      if(this.leftLegY - canvas.height + heights[Math.floor(this.leftLegX)] > 3){
        this.velocity.y -= 0.03;
      }
      this.velocity.x += (this.velocity.x > 0) ? -0.01 : 0.01;
    }

    var topOnGround = false;

    if(topOnGround){
      this.impactVelocity = Math.sqrt(Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.y, 2));
      this.damage = 1;
    }

    this.rotation += (leftLegOnGround && !rightLegOnGround) ? 0.001 : ((rightLegOnGround && !leftLegOnGround) ? -0.001 : 0);
    if(leftLegOnGround && rightLegOnGround){
      this.rotation = 0;
    }
    lastRightLeg = rightLegOnGround;
    lastLeftLeg = leftLegOnGround;
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.speed = Math.sqrt(Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.y, 2));
    if(this.position.x > canvas.width + this.width){
      this.position.x = -this.width + 1;
    }
    if(this.position.x < -this.width){
      this.position.x = canvas.width + this.width - 1;
    }
  }
  if(this.impactVelocity > 1){
    this.damage = 1;
    gameOver = true;
  }
  if(this.impactVelocity > 2){
    this.damage = 2;
    gameOver = true;
  }
  if(this.impactVelocity > 3){
    this.damage = 3;
    gameOver = true;
  }
}

function drawText(text, x, y, color){
  context.beginPath();
  context.font = "26px serif";
  context.fillStyle = color;
  context.fillText(text, x, y);
  context.closePath();
}

function drawScene(){
  drawRect(0, 0, canvas.width, canvas.height, "black");
  for(var i = 0; i < heights.length; i ++){
    drawRect(i, canvas.height - heights[i], 1, heights[i], "gray");
  }
}

function gameOverScreen(){
  drawText(finalVelocity, 50, 100, "gray");
}

var lander = new Spaceship(10, {x:100, y:100}, 0.04);

function draw()
{
    context.clearRect(0, 0, canvas.width, canvas.height);

    drawScene();

    lander.update();

    lander.draw();

    if(!gameOver){
      requestAnimationFrame(draw);
    }else{
      gameOverScreen();
    }
}

function keyUp(e){
    switch(e.keyCode){
        case 37:
            leftKey = false;
            break;
        case 39:
            rightKey = false;
            break;
        case 38:
            upKey = false;
            break;
    }
}

document.addEventListener('keyup', keyUp);

function keyDown(e){
    switch(e.keyCode){
        case 37:
            leftKey = true;
            break;
        case 39:
            rightKey = true;
            break;
        case 38:
            upKey = true;
            break;
    }
}

document.addEventListener('keydown', keyDown);

draw();
