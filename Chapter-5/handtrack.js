if(handTrack){
    alert("Module for handtrack.js loaded successfully")
}else{
    alert("Something went wrong")
}
console.log(handTrack)
let videoToggleButton = document.getElementById("toggleButton");
let video = document.getElementById("myvideobox");
videoToggleButton.addEventListener("click", () => {
    
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((streamVideoObject) => {
                video.srcObject = streamVideoObject;
            })
            .catch((error) => {
                console.log(error)
                console.log("Something went wrong!");
            });
    }
});

const handimg = document.getElementById("handimageframe");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
let status = document.getElementById("status");

let isVideo = false;
let model = null;



const modelParams = {
    flipHorizontal: true,   // flip e.g for video  
    maxNumBoxes: 20,        // maximum number of boxes to detect
    iouThreshold: 0.5,      // ioU threshold for non-max suppression
    scoreThreshold: 0.6,    // confidence threshold for predictions.
}

function startVideo() {
    handTrack.startVideo(video).then(function (status) {
        console.log("video started", status);
        if (status) {
            status.innerText = "Video started. Now tracking"
            isVideo = true
            runDetection()
        } else {
            status.innerText = "Please enable video"
        }
    });
}

function toggleVideo() {
    if (!isVideo) {
        status.innerText = "Starting video"
        startVideo();
    } else {
        status.innerText = "Stopping video"
        handTrack.stopVideo(video)
        isVideo = false;
        status.innerText = "Video stopped"
    }
}





videoToggleButton.addEventListener("click", function(){
    toggleVideo();
});



function runDetection() {
    model.detect(video).then(predictions => {
        console.log("Predictions: ", predictions);
        model.renderPredictions(predictions, canvas, context, video);
        if (isVideo) {
            requestAnimationFrame(runDetection);
        }
    });
}

function runDetectionImage(img) {
    model.detect(img).then(predictions => {
        console.log("Predictions: ", predictions);
        model.renderPredictions(predictions, canvas, context, img);
    });
}

// Load the model.
handTrack.load(modelParams).then(lmodel => {
    // detect objects in the image.
    model = lmodel
    status.innerText = "Loaded Model!"
    runDetectionImage(handimg)
    videoToggleButton.disabled = false
});



