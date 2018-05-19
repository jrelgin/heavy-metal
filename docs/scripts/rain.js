// Setup ///////////////////////////////////////////////////////////
var canvas = document.getElementById('canvas');
var sky = canvas.getContext('2d');

var window_width = window.innerWidth * 1.5;
var window_height = window.innerHeight * 1.5;

var fall_speed = 0.7;

var rain_weight = 0.11;
var rain_color = '255,255,255';

var drop_count;
var drops = [];

// Helpers /////////////////////////////////////////////////////////
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.msRequestAnimationFrame     ||
          window.oRequestAnimationFrame      ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

function randomFrom(min, max) {
  return (Math.random() * (max - min) + min);
}

function resizer() {
  window_width = window.innerWidth * 1.5;
  window_height = window.innerHeight * 1.5;
  drop_count = window_width * rain_weight;
  
  canvas.setAttribute('width', window_width);
  canvas.setAttribute('height', window_height);
}

window.addEventListener('resize', resizer, false);

// Drawing /////////////////////////////////////////////////////////
function paintSky() {
  for (var i = 0; i < drop_count; i++) {
    drops[i] = new drop();
    drops[i].reset();
  }
  
  rain();
}

function rain() {
  sky.clearRect(0, 0, window_width, window_height);

  var drops_length = drops.length;

  for (var i = 0; i < drops_length; i++) {
    var drop = drops[i];
    drop.fall();
    drop.draw();
  }

  window.requestAnimFrame(rain);
}

function drop() {

  this.reset = function() {
    this.r = randomFrom(0.8, 1.6);
    this.l = (this.r * 250);
    this.x = randomFrom((window_width * -0.25), (window_width * 1.125));
    this.y = randomFrom(0, (window_height * -1));
    this.dx = randomFrom(2, 8);
    this.dy = (this.r * (90 * fall_speed));
    this.opacity = (this.r * randomFrom(0.2, 0.6));
  };
  
  this.draw = function() {
    sky.beginPath();
    
    var drip = sky.createLinearGradient(this.x, this.y, this.x + this.r, this.y + this.l);
    drip.addColorStop(0, 'rgba(' + rain_color + ', 0)');
    drip.addColorStop(1, 'rgba(' + rain_color + ', ' + this.opacity + ')');
    sky.fillStyle = drip;
        
    //sky.rect(this.x, this.y, this.r, this.l);
    sky.moveTo(this.x, this. y);
    sky.lineTo(this.x + this.r, this.y);
    sky.lineTo(this.x + this.r + (this.dx * (fall_speed * 2)), this.y + this.l);
    sky.lineTo(this.x + (this.dx * (fall_speed * 2)), this.y + this.l);

    sky.closePath();
    sky.fill();
  };
  
  this.fall = function() {
    this.x += this.dx;
    this.y += this.dy;
    
    if (this.y > (window_height * 1.25)) {
      this.reset();
    }
  };
}

resizer();
paintSky();