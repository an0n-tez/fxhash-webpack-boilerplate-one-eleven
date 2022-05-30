import p5 from "p5";
import SimplexNoise from 'simplex-noise';
import OneEleven from './one-eleven.js';


// SAMPLE CODE
// This code was used for the fxhash collection #13830: One Eleven (Landscape/Landfill)
// if you want to use or adapt this for you project, update the code in src/index.js to this, and that should work


// these are the variables you can use as inputs to your algorithms
console.log(fxhash) // the 64 chars hex number fed to your algorithm
const seed = ~~(fxrand() * 123456789);
let simplex = new SimplexNoise(`${seed}`);

var EDGE_DIVISOR = Math.floor(fxrand() * 3)*2 + 6;
var RANDOMNESS = fxrand() > 0.666 ? 0 : fxrand()/16;
var RARE = fxrand() > 0.88;
var FROM_RIGHT = fxrand() > 0.5;
var START_Y_PERCENT = fxrand() * 0.4 + 0.3;
var DENSITY = RARE ? 3 : 1 + Math.floor(fxrand() * 4) * 3;
var JAGGED = 1 + Math.floor(fxrand() * 4) * 2 + Math.floor(EDGE_DIVISOR/3);
var BACKGROUND_COLOR = 0;
var FOREGROUND_COLOR = 0;

var POINT_COUNT = 22 * (DENSITY + 4);
var currentY = 0

var WHITE = "#E4DECC";
var BLACK = "#35312C";

var BASE_COLOR;

var veryBeginning;

// TODO: get attributes from other thing maybe?
let attributes = {
  "Monochrome-ish": RANDOMNESS == 0,
  "Wireframe-ish": RARE,
  "From Right": FROM_RIGHT,
  "Density": DENSITY,
  "Jaggedness": JAGGED,
}

window.$fxhashFeatures = attributes;

const clearStroke = (p5) => {
  var c = p5.color("#fff");
  c.setAlpha(0);
  p5.stroke(c);
  p5.strokeWeight(0);
}


const addMatte = (p5) => {
  p5.push();
  BASE_COLOR.setAlpha(255);
  p5.stroke(BASE_COLOR);
  p5.noFill();
  p5.strokeWeight(p5.width / 24);
  p5.rect(0, 0, p5.width, p5.height);
  p5.pop();
}

const addTexture = (p5, divisor = 1) => {
  p5.loadPixels();

  var density = p5.pixelDensity()
  var textureDensity = 1500;

  for (let x = 0; x < p5.width * density; x++) {
    for (let y = 0; y < p5.height * density; y++) {

      const index = (x + y * p5.width * density) * 4;
      var divi = 4 * density;
      var n = simplex.noise2D(Math.floor(textureDensity * (x / p5.width)), Math.floor(textureDensity * (y / p5.height))) * (RARE ? 22 : 33 - DENSITY) / divisor / (isFxpreview ? 2 : 1);

      if (p5.pixels[index] + p5.pixels[index + 1] + p5.pixels[index + 2] < 150) {
        n = n * 0.33;
      }
      if (p5.pixels[index] + p5.pixels[index + 1] + p5.pixels[index + 2] > 600) {
        n = n * 0.33;
      }

      p5.pixels[index] = Math.min(255, Math.max(0, p5.pixels[index] + n));
      p5.pixels[index + 1] = Math.min(255, Math.max(0, p5.pixels[index + 1] + n));
      p5.pixels[index + 2] = Math.min(255, Math.max(0, p5.pixels[index + 2] + n));
    }
  }
  p5.updatePixels();
}

const randomizeCurrentOneEleven = (p5) => {
  var B_R = p5.floor(p5.random() * 256);
  var B_G = p5.floor(p5.random() * 256);
  var B_B = p5.floor(p5.random() * 256);
  BACKGROUND_COLOR = p5.color(B_R, B_G, B_B);
  FOREGROUND_COLOR = p5.color(255 - B_R, 255 - B_G, 255 - B_B);
  BACKGROUND_COLOR.setAlpha(RARE ? 128 : 255);
  FOREGROUND_COLOR.setAlpha(RARE ? 222 : 255);
  self.oneEleven = new OneEleven(p5, seed, FOREGROUND_COLOR, BACKGROUND_COLOR);
}

const reset = (p5) => {
  p5.smooth();
  p5.randomSeed(seed);
  p5.noiseSeed(seed);
  randomizeCurrentOneEleven(p5);
  currentY = 0
  veryBeginning = Date.now();
  simplex = new SimplexNoise(`${seed}`);
  clearStroke(p5);
  if (p5.random() < 0.5) {
    BASE_COLOR = p5.color(p5.random()*255,p5.random()*255,p5.random()*255);
  } else {
    BASE_COLOR = p5.color(p5.random() < 0.5 ? WHITE : BLACK);
  }
  p5.background(BASE_COLOR);
  p5.push();
  var cc = p5.color(p5.random()*255,p5.random()*255,p5.random()*255);
  p5.fill(cc);
  var cx = p5.width*p5.random();
  var cy = p5.height*p5.random()/2 - p5.height/8;
  var cr = (p5.random() + 0.3)*p5.width;
  p5.circle(cx, cy, cr);
  p5.pop();
  addMatte(p5);
  p5.frameRate(60);
  p5.loop();
}

let sketch = function (p5) {

  p5.preload = function () {
    OneEleven.preload(p5); // make sure we preload the font, its quite important
    veryBeginning = Date.now();
  }

  p5.setup = function () {
    // var min = p5.min(p5.windowWidth, p5.windowHeight);
    // p5.createCanvas(min, min);

    var maxWidth = p5.floor(p5.min(p5.windowWidth, p5.windowHeight * (4 / 5)));
    p5.createCanvas(maxWidth, maxWidth * (5/4));
    p5.pixelDensity(isFxpreview ? 1 : 3);
    reset(p5);
    console.table(window.$fxhashFeatures)
  };

  p5.draw = function () {

    if (p5.random() < RANDOMNESS) {
      randomizeCurrentOneEleven(p5);
    }

    p5.push();

    var fadeColor = p5.color(BASE_COLOR);
    var fadeAlpha = p5.max(5, 44 - currentY*0.2);

    fadeColor.setAlpha(fadeAlpha);

    if (currentY % (DENSITY + 7) == 0) {
      p5.background(fadeColor);
    }

    var currentYNoise = 0;
    var currentEdgeNoise = 0;
    var currentRotationalNoise = 0;

    for (var currentX = 0; currentX < POINT_COUNT; currentX++) {
      p5.push();
      currentYNoise += (p5.width / (333 / JAGGED)) * simplex.noise3D(currentX, currentY, 0);
      currentEdgeNoise += (p5.width / 128) * simplex.noise3D(currentX, currentY, 1);
      currentRotationalNoise += simplex.noise3D(currentX, currentY, 2);

      var edge = p5.width / (EDGE_DIVISOR) + currentEdgeNoise;
      var x = currentX * p5.width / POINT_COUNT + edge / 3;
      var y = currentY * p5.height / POINT_COUNT * START_Y_PERCENT + (1 - START_Y_PERCENT) * p5.height + currentYNoise;

      var showBG = !RARE;

      if (p5.random() < ((RARE ? 0.001 : 0.003)/DENSITY)) {
        y -= ((edge/2.5)*(p5.random() + 1.11));
        showBG = true;
      }

      if (FROM_RIGHT) {
        x = p5.width - x;
      }

      p5.translate(x, y);
      p5.rotate(p5.PI / 32 * currentRotationalNoise);
      self.oneEleven.drawReferenceInto(p5, -edge / 2, -edge / 2, edge, edge, showBG);
      p5.pop();
    }

    p5.pop();

    addMatte(p5);
    if (++currentY == POINT_COUNT) {
      addTexture(p5);
      fxpreview();
      console.log(`Time to render preview: ${(Date.now() - veryBeginning) / 1000} seconds`);
      p5.noLoop()
    }

  };

  p5.windowResized = function () {
    // var min = p5.min(p5.windowWidth, p5.windowHeight);
    // p5.resizeCanvas(min, min);

    var maxWidth = p5.floor(p5.min(p5.windowWidth, p5.windowHeight * (4 / 5)));
    p5.resizeCanvas(maxWidth, maxWidth * (5/4));
    reset(p5);
  }

  p5.keyPressed = function () {
    var key = p5.keyCode;
    console.log(`pressed: ${p5.keyCode}`)

    if (key == 83) { // S
      p5.save(`one-eleven-landscape-landfill-${fxhash}_${p5.width*p5.pixelDensity()}_${p5.height*p5.pixelDensity()}.png`);
    }

    if (key >= 49 && key <= 54) {
      p5.pixelDensity(key-48);
      reset(p5);
    }
  }

  p5.mousePressed = function () {
  }
}

let myp5 = new p5(sketch, window.document.body);
