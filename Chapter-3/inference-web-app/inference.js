 let maxDistance = 0.6
 let minConfidence = 0.7
 let useBatchProcessing = false
 let trainDescriptorsByClass
 let minFaceSize = 200
 let isModelLoaded = false;

 async function getTrainedFaceDescriptorModel() {

     const url = "https://face-recog-serv.herokuapp.com/api/getModel";

     return JSON.parse($.ajax({
         url: url,
         method: "GET",
         async: false
     }).responseText)
 }

 async function onPlay(videoEl) {

     if (videoEl.paused || videoEl.ended || !modelLoaded)
         return false

     const { width, height } = faceapi.getMediaDimensions(videoEl)
     const canvas = $('#overlay').get(0)
     canvas.width = width
     canvas.height = height

     if (!isModelLoaded) {
         trainDescriptorsByClass = await getTrainedFaceDescriptorModel()
         isModelLoaded = true;
     }

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