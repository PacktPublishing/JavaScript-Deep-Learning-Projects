let trainButtonIsClicked = false;
let maxDistance = 0.6
let minConfidence = 0.7
let useBatchProcessing = false
let trainDescriptorsByClass
let modelLoaded = false
let minFaceSize = 200
let forwardTimes = []
let timeoutId
let images = []
let isTrained = false;
let classes = [];

async function train() {
    let trainingLabel = document.getElementById("trainingLabelText").value
    trainDescriptorsByClass = await initTrainDescriptorsByClass(faceapi.recognitionNet, images.length, trainingLabel);
    console.log(trainDescriptorsByClass)
    console.log(typeof(trainDescriptorsByClass))
    isTrained = true;
    // updateResults()

}

async function takeScreenshot() {
    var hidden_canvas = document.getElementById("hiddenCanvas"),
        video = document.getElementById("inputVideo"),
        image = new Image(),

        // Get the exact size of the video element.
        width = video.videoWidth,
        height = video.videoHeight,

        // Context object for working with the canvas.
        context = hidden_canvas.getContext('2d');

    // Set the canvas to the same dimensions as the video.
    hidden_canvas.width = width;
    hidden_canvas.height = height;

    // Draw a copy of the current frame from the video on the canvas.
    context.drawImage(video, 0, 0, width, height);

    // Set the dataURL as source of an image element, showing the captured photo.
    image.setAttribute('src', hidden_canvas.toDataURL('image/png'));

    //Align the face and get the image as CanvasElement
    let imageCanvas = await locateAndAlignFacesWithSSD(image)


    // push the canvas element into array only when there is one face detected, this will be the final training data
    if (imageCanvas.length == 1) {
        $("#trainingDataBlock").show()
        $("#errorText").hide()
        images.push(imageCanvas)
    }

    //Update face container
    $('#facesContainer').empty()
    images.forEach(async (faceCanvas, i) => {
        $('#facesContainer').append(faceCanvas)
    })
}

async function initTrainDescriptorsByClass(net, numImagesForTraining = 1, className) {

    if (numImagesForTraining == 0) {
        $("#errorText").html("No Images for training found")
        $("#errorText").show()
        throw new Error("No Images for training found")
    } else if (numImagesForTraining == 1) {
        $("#errorText").html("Atleast use 2 image for training")
        $("#errorText").show()
        throw new Error("Only one Image for training found")
    }
    if (className == "") {
        $("#errorText").html("Label not provided by user")
        $("#errorText").show()
        throw new Error("Label not provided by user")
    }

    if (!(className == "") && !(numImagesForTraining == 0)) {
        $("#errorText").hide()
    }



    const descriptors = []
    for (let i = 1; i < (numImagesForTraining + 1); i++) {
        const img = images[i - 1]
        descriptors.push((await net.computeFaceDescriptor(img))[0])
    }

    const descriptorByClass = {
        descriptors,
        className
    }

    console.log(descriptorByClass)
    let trainDescriptorsByClass = [];
    trainDescriptorsByClass.push(descriptorByClass)
    localStorage.setItem('trainDescriptorsByClass',JSON.stringify(trainDescriptorsByClass))
    return trainDescriptorsByClass

}

async function onPlay(videoEl) {

    if (videoEl.paused || videoEl.ended || !modelLoaded)
        return false

    const { width, height } = faceapi.getMediaDimensions(videoEl)
    const canvas = $('#overlay').get(0)
    canvas.width = width
    canvas.height = height

    if (!isTrained) {
        result = await faceapi.locateFaces(videoEl, minConfidence)
        faceapi.drawDetection(canvas, result.map(det => det.forSize(width, height)), { withScore: true, textColor: '#ccff00', fontSize: 18 })

    }



    if (isTrained) {
        const fullFaceDescriptions = (await faceapi.allFaces(videoEl, minConfidence, useBatchProcessing))
            .map(fd => fd.forSize(width, height))

        fullFaceDescriptions.forEach(({ detection, descriptor }) => {
            faceapi.drawDetection(canvas, [detection], { withScore: true, textColor: '#ccff00', fontSize: 18 })



            const bestMatch = getBestMatch(descriptor)
            var text = `${bestMatch.distance < maxDistance ? bestMatch.className : 'unknown'} (${bestMatch.distance})`
            // var { x, y, height: boxHeight } = detection.getBox()
            faceapi.drawText(
                canvas.getContext('2d'),
                detection.getBox().x,
                detection.getBox().y + detection.getBox().height,
                text, { textColor: '#ccff00', fontSize: 18 }
            )

        })


    }
    setTimeout(() => onPlay(videoEl))
}


function getBestMatch(queryDescriptor) {
    function computeMeanDistance(descriptorsOfClass) {
        return faceapi.round(
            descriptorsOfClass
            .map(d => faceapi.euclideanDistance(d, queryDescriptor))
            .reduce((d1, d2) => d1 + d2, 0) /
            (descriptorsOfClass.length || 1)
        )
    }
    return trainDescriptorsByClass
        .map(
            ({ descriptors, className }) => ({
                distance: computeMeanDistance(descriptors),
                className
            })
        )
        .reduce((best, curr) => best.distance < curr.distance ? best : curr)
}

async function locateAndAlignFacesWithSSD(inputImgEl) {
    const input = await faceapi.toNetInput(inputImgEl)

    const locations = await faceapi.locateFaces(input, minConfidence)

    const unalignedFaceImages = await faceapi.extractFaces(input.getInput(0), locations)

    // detect landmarks and get the aligned face image bounding boxes
    const alignedFaceBoxes = await Promise.all(unalignedFaceImages.map(
        async (faceCanvas, i) => {
            const faceLandmarks = await faceapi.detectLandmarks(faceCanvas)
            return faceLandmarks.align(locations[i])
        }
    ))
    const alignedFaceImages = await faceapi.extractFaces(input.getInput(0), alignedFaceBoxes)

    return alignedFaceImages
}

async function run() {
    await faceapi.loadModels('models')
    modelLoaded = true

    const videoEl = $('#inputVideo').get(0)
    navigator.getUserMedia({ video: {} },
        stream => videoEl.srcObject = stream,
        err => console.error(err)
    )
}

$(document).ready(function() {
    $("#errorText").hide()
    run()
})