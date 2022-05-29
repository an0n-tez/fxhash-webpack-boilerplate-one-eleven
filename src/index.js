import p5 from "p5";
import SimplexNoise from 'simplex-noise';
import OneEleven from './one-eleven.js';

// these are the variables you can use as inputs to your algorithms
console.log(fxhash) // the 64 chars hex number fed to your algorithm
const seed = ~~(fxrand() * 123456789);
let s;
let simplex = new SimplexNoise(`${seed}`);

var B_R = Math.floor(fxrand() * 256);
var B_G = Math.floor(fxrand() * 256);
var B_B = Math.floor(fxrand() * 256);
var BACKGROUND_COLOR = 0;
var FOREGROUND_COLOR = 0;

var WHITE = "#E4DECC";
var veryBeginning;
var hasCreatedReferenceImage = false;

let attributes = {
  "One Eleven Extension": true,
  "Color": `rgba(${B_R}, ${B_G}, ${B_B}, 1)`
}

window.$fxhashFeatures = attributes;

function margin(p5) {
  return (p5.width / 64);
}

function lineHeight(p5) {
  return margin(p5) * 1.7355;
}

function clearStroke(p5) {
  var c = p5.color("#fff");
  c.setAlpha(0);
  p5.stroke(c);
  p5.strokeWeight(0);
}

const addTexture = (p5) => {
  p5.loadPixels();

  var density = p5.pixelDensity()
  var textureDensity = 1500;

  for (let x = 0; x < p5.width * density; x++) {
    for (let y = 0; y < p5.height * density; y++) {

      const index = (x + y * p5.width * density) * 4;
      var divi = 4 * density;
      var n = simplex.noise2D(Math.floor(textureDensity * (x / p5.width)), Math.floor(textureDensity * (y / p5.height))) * (isFxpreview ? 16 : 20);

      if (p5.pixels[index] + p5.pixels[index + 1] + p5.pixels[index + 2] < 100) {
        n = n * 0.05;
      }

      p5.pixels[index] = Math.min(255, Math.max(0, p5.pixels[index] + n));
      p5.pixels[index + 1] = Math.min(255, Math.max(0, p5.pixels[index + 1] + n));
      p5.pixels[index + 2] = Math.min(255, Math.max(0, p5.pixels[index + 2] + n));
    }
  }
  p5.updatePixels();
}

const reset = (p5) => {
  // reset vars and random generators
  veryBeginning = Date.now();
  hasCreatedReferenceImage = false;
  p5.randomSeed(seed);
  p5.noiseSeed(seed);
  simplex = new SimplexNoise(`${seed}`);
  // setup colors for One Eleven
  BACKGROUND_COLOR = p5.color(B_R, B_G, B_B);
  FOREGROUND_COLOR = p5.color(255 - B_R, 255 - B_G, 255 - B_B);
  BACKGROUND_COLOR.setAlpha(255);
  self.oneEleven = new OneEleven(p5, seed, FOREGROUND_COLOR, BACKGROUND_COLOR);
  // prep the canvas and start looping.
  p5.background(WHITE);
  p5.loop();
  p5.frameRate(30);
}

let sketch = function (p5) {

  p5.preload = function () {
    OneEleven.preload(p5); // make sure we preload the font, its quite important
    veryBeginning = Date.now();
  }

  p5.setup = function () {
    var minEdge = Math.min(p5.windowWidth, p5.windowHeight);
    p5.createCanvas(minEdge, minEdge);
    reset(p5);
  };

  p5.draw = function () {

    // create the reference images once
    if (!hasCreatedReferenceImage) {
      console.table(window.$fxhashFeatures)
      hasCreatedReferenceImage = true;
      // draw the reference image without the background on the main canvas
      self.oneEleven.drawReferenceInto(p5, 0, 0, p5.width / 2, p5.height / 2, false);
      // draw the reference image with the background on the main canvas
      self.oneEleven.drawReferenceInto(p5, p5.width / 2, 0, p5.width / 2, p5.height / 2, true);
      console.log(`Time to draw reference images: ${(Date.now() - veryBeginning) / 1000} seconds`);
      return;
    }

    // render one frame to the rendered image canvas
    self.oneEleven.renderStage();
    // draw the rendered image on the main canvas
    self.oneEleven.drawRenderedInto(p5, 0, p5.height / 2, p5.width / 2, p5.height / 2);

    if (self.oneEleven.currentStage == self.oneEleven.SETUP_STAGES) {
      // SETUP_STAGES is the number of cycles needed to render the textured image
      // we check for it so we know right when its ready. (see notes below.)
      self.oneEleven.drawRenderedInto(p5, p5.width / 2, p5.height / 2, p5.width / 2, p5.height / 2);
      fxpreview();
      console.log(`Time to render preview: ${(Date.now() - veryBeginning) / 1000} seconds`);
    }

    // ------- notes:
    // if we didn't want to wait all these cycles, just call: self.oneEleven.renderFullSetup(); (which just runs renderStage() a bunch of times)
    //
    // you can always get the rendered image at : self.oneEleven.renderedImage
    // you can always get the reference image at : self.oneEleven.referenceImage (this has no background)

  };

  p5.windowResized = function () {
    var minEdge = Math.min(p5.windowWidth, p5.windowHeight);
    p5.resizeCanvas(minEdge, minEdge);
    reset(p5);
  }

  p5.keyPressed = function () {
    var key = p5.keyCode;
    console.log(`pressed: ${p5.keyCode}`)

    if (key == 67) { // C
      reset(p5);
    }

    if (key == 83) { // S
      p5.save(`one-eleven-template-${fxhash}_${p5.width}.png`);
    }
  }

  p5.mousePressed = function () {
  }
}

let myp5 = new p5(sketch, window.document.body);
