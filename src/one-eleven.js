"use strict";

import p5 from "p5";
import SimplexNoise from 'simplex-noise';


export default class OneEleven {

    static font;

    static preload(p5) {
        this.font = p5.loadFont("overpass-mono-bold.otf");
    }

    constructor(p5, seed, foregroundColor, backgroundColor, edgeSize = 2500, samplesPerCycle = 100000) {
        this.seed = seed
        this.foregroundColor = foregroundColor;
        this.backgroundColor = backgroundColor;
        this.edgeSize = edgeSize;
        this.samplesPerCycle = samplesPerCycle;

        this.currentStage = 0;
        this.decaying = false;

        this.referenceImage = p5.createGraphics(this.edgeSize, this.edgeSize);
        this.referenceImage.pixelDensity(1);
        this.referenceImage.randomSeed(seed);
        this.referenceImage.noiseSeed(seed);

        this.renderedImage = p5.createGraphics(this.edgeSize, this.edgeSize);
        this.renderedImage.pixelDensity(1);
        this.renderedImage.randomSeed(seed);
        this.renderedImage.noiseSeed(seed);

        this.renderedImage.background(this.backgroundColor);

        this.SETUP_STAGES = 33;

        this.REFLECTIVE = p5.random() < 0.666;
        this.RELEVANT = p5.random() < 0.444;
        this.IRREVERENT = p5.random() < 0.333;
        this.NOSTALGIC = p5.random() > 0.222;
        this.RARE = p5.random() < 0.1;
        this.DECAY_INFLECTION = p5.random() < 0.1 ? p5.random() / 12 : ((p5.random() * 4 + 0.3) * (p5.random() > 0.5 ? 1 : -1));
        this.Y_DECAY_INFLECTION = (p5.random() + 0.6) * (p5.random() > 0.5 ? 1 : -1);

        this.#drawTextIntoReferenceImage();
        this.#drawMatteIntoReferenceImage();
        this.referenceImage.loadPixels();
    }

    renderFullSetup() {
        while (this.currentStage < this.SETUP_STAGES) {
            this.renderStage();
        }
    }

    renderStage() {
        this.#drawCycle(this.renderedImage);
        if (this.currentStage++ == this.SETUP_STAGES) {
            this.decaying = true;
        }
    }

    #clearStroke(p5) {
        var c = p5.color("#fff");
        c.setAlpha(0);
        p5.stroke(c);
        p5.strokeWeight(0);
    }

    drawRenderedInto(p5, x, y, w, h) {
        p5.push();
        p5.image(this.renderedImage, x, y, w, h);
        p5.pop();
    }

    drawReferenceInto(p5, x, y, w, h, showBackground = true) {
        p5.push();
        this.#clearStroke(p5)
        if (showBackground) {
            p5.fill(this.backgroundColor);
            p5.rect(x, y, w, h);
        }
        p5.image(this.referenceImage, x, y, w, h);
        p5.pop();
    }

    #margin() {
        return (this.referenceImage.width / 64);
    }

    #lineHeight() {
        return this.#margin() * 1.7355;
    }

    #maskImageHasDataAt(p5, x, y) {
        return false;
        // let's come
        // const density = referenceImageMask.pixelDensity();
        // const checkX = p5.floor((x/p5.width)*(referenceImageMask.width)*density)
        // const checkY = p5.floor((y/p5.height)*(referenceImageMask.height)*density)
        // const index = (checkX + checkY*referenceImageMask.width*density) * 4;
        // return referenceImageMask.pixels[index + 3] > 0;
    }


    #drawMatteIntoReferenceImage = () => {
        const p5 = this.referenceImage;
        p5.push();
        p5.stroke(this.foregroundColor);
        p5.noFill();
        p5.strokeWeight(p5.ceil(this.#margin(p5) * 2));
        p5.rect(0, 0, p5.width, p5.width);
        p5.pop();
    }

    #drawTextIntoReferenceImage() {
        const p5 = this.referenceImage;
        p5.push();
        p5.textFont(OneEleven.font);

        p5.textAlign(p5.LEFT, p5.TOP);
        p5.fill(this.foregroundColor);

        var line = 0;
        var margin = this.#margin(p5)
        var lineHeight = this.#lineHeight(p5)

        p5.textSize(lineHeight);
        p5.text("THIS ART WAS MINTED ON FXHASH FOR (AT MOST) 1111 TEZ", margin * 3, margin * 3 + lineHeight * 2 * (line++));
        p5.text("IT WAS RELEASED AS A DUTCH AUCTION WITH 111 ITERATIONS", margin * 3, margin * 3 + lineHeight * 2 * (line++));
        p5.text("PRESS `S` TO SAVE OR `R` TO RESET", margin * 3, margin * 3 + lineHeight * 2 * (line++));
        p5.text("------------------------------------------------------", margin * 3, margin * 3 + lineHeight * 2 * (line++));
        p5.text("COLLECTION NAME: One Eleven", margin * 3, margin * 3 + lineHeight * 2 * (line++));
        p5.text("ARTIST: an0n", margin * 3, margin * 3 + lineHeight * 2 * (line++));
        p5.text("TWITTER: @an0n_tez", margin * 3, margin * 3 + lineHeight * 2 * (line++));
        p5.text("ROYALTIES: 11%", margin * 3, margin * 3 + lineHeight * 2 * (line++));
        p5.text("LICENSE: cc0", margin * 3, margin * 3 + lineHeight * 2 * (line++));
        p5.text(`COLOR: ${this.backgroundColor}`, margin * 3, margin * 3 + lineHeight * 2 * (line++));
        p5.text(`REFLECTIVE: ${this.REFLECTIVE ? "yes" : "no"}`, margin * 3, margin * 3 + lineHeight * 2 * (line++));
        p5.text(`RELEVANT: ${this.RELEVANT ? "yes" : "no"}`, margin * 3, margin * 3 + lineHeight * 2 * (line++));
        p5.text(`IRREVERENT: ${this.IRREVERENT ? "yes" : "no"}`, margin * 3, margin * 3 + lineHeight * 2 * (line++));
        p5.text(`NOSTALGIC: ${this.NOSTALGIC ? "yes" : "no"}`, margin * 3, margin * 3 + lineHeight * 2 * (line++));
        p5.text(`RARE: ${this.RARE ? "yes" : "no"}`, margin * 3, margin * 3 + lineHeight * 2 * (line++));
        p5.textSize(lineHeight / 1.34);
        p5.textAlign(p5.LEFT, p5.BOTTOM);
        p5.text(`SEED: ${fxhash}`, margin * 3, p5.height - margin * 3);
        p5.pop();
    }

    #drawCycle(p5) {
        var refDensity = this.referenceImage.pixelDensity()

        this.#clearStroke(p5);

        var i = this.samplesPerCycle;
        var margin = this.#margin(p5)

        var color = p5.color(this.foregroundColor);
        color.setAlpha(this.decaying ? 16 : 192);

        this.backgroundColor.setAlpha(16);

        while (i > 0) {
            i--;

            var refX = p5.floor((i / this.samplesPerCycle) * (this.referenceImage.width * refDensity));
            var refY = p5.floor(this.referenceImage.height * refDensity * p5.random());

            var x = ((p5.width * p5.pixelDensity()) / (this.referenceImage.width * refDensity)) * refX;
            var y = ((p5.height * p5.pixelDensity()) / (this.referenceImage.height * refDensity)) * refY;

            const index = (p5.floor(refX) + p5.floor(refY) * this.referenceImage.width * refDensity) * 4;

            if (this.referenceImage.pixels[index + 3] == 0 || this.referenceImage.pixels[index + 1] < 0.2 || this.referenceImage.pixels[index + 2] < 0.2) {
                continue;
            }
            var spread = p5.min(p5.height * 2, p5.abs(((this.currentStage - this.SETUP_STAGES) * p5.width / 512) * this.Y_DECAY_INFLECTION))
            var yDecayOffset = (this.Y_DECAY_INFLECTION > 0 ? 1 : -1) * (this.decaying ? (p5.random() - 0.05) * spread : 0);
            var decayOffset = yDecayOffset * this.DECAY_INFLECTION;

            var xR = x / p5.pixelDensity();
            var yR = y / p5.pixelDensity();
            var xROffset = xR + decayOffset;
            var yROffset = yR + yDecayOffset;

            if (this.decaying
                && (xROffset < margin || xROffset > p5.width - margin
                    || yROffset < margin || yROffset > p5.height - margin)) {
                continue;
            }


            p5.fill(color);
            if (!this.#maskImageHasDataAt(p5, xROffset, yROffset)) {
                p5.circle(
                    xROffset,
                    yROffset,
                    p5.width / 1256 * (this.decaying ? 2 : 1)
                );
            }

            if (this.decaying) {
                p5.fill(this.backgroundColor);
                var bgX = xR + p5.random() * p5.width / 512;
                var bgY = yR + p5.random() * p5.width / 512;
                if (!this.#maskImageHasDataAt(p5, bgX, bgY)) {
                    p5.circle(
                        bgX,
                        bgY,
                        p5.width / 1200
                    );
                }

                if (!this.#maskImageHasDataAt(p5, xROffset, yROffset)) {
                    p5.circle(
                        xROffset,
                        yROffset,
                        p5.width / 3500
                    );
                }
            }
        }
    }
}

