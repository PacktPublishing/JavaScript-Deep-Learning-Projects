import * as tf from '@tensorflow/tfjs';
import yolo, { downloadModel } from 'tfjs-yolo-tiny';

import { Webcam } from './webcam';

let model;
const videobox = new Webcam(document.getElementById('videobox'));

(async function init() {
  try {
    model = await downloadModel();
    await videobox.setup();
    modelLoaded();
    loop();
  } catch(e) {
    console.error(e);
    showError();
  }
})();

async function loop() {
  while (true) {
    const inputImage = videobox.capture();

    const initialTime = performance.now();

    const boxes = await yolo(inputImage, model);

    inputImage.dispose();

    const finalTime = performance.now();
    console.log("YOLO inference took " + (finalTime - initialTime) + " milliseconds.");

    console.log('tf.memory(): ', tf.memory());

    clearRectangles();
    boxes.forEach(box => {
      const {
        top, left, bottom, right, classProb, className,
      } = box;
      let borderWidth = '5px';
      drawRectangle(left, top, right-left, bottom-top, borderWidth,
        `${className} Confidence: ${Math.round(classProb * 100)}%`)
    });

    await tf.nextFrame();
  }
}

const webcamElem = document.getElementById('webcam-wrapper');

function drawRectangle(x, y, w, h, bw, text = '', color = 'yellow') {
  const rect = document.createElement('div');
  rect.classList.add('rect');
  rect.style.cssText = `top: ${y}; left: ${x}; width: ${w}; height: ${h}; border-color: ${color}; border-width: ${bw}`;

  const label = document.createElement('div');
  label.classList.add('label');
  label.innerText = text;
  rect.appendChild(label);

  webcamElem.appendChild(rect);
}

function clearRectangles() {
  const rects = document.getElementsByClassName('rect');
  while(rects[0]) {
    rects[0].parentNode.removeChild(rects[0]);
  }
}

function modelLoaded() {
  const elem = document.getElementById('loading-message');
  elem.style.display = 'none';
  const webcamElem = document.getElementById('webcam-wrapper');
  webcamElem.style.display = 'flex';
}

// function showError() {
//   const elem = document.getElementById('error-message');
//   elem.style.display = 'block';
//   modelLoaded();
// }

