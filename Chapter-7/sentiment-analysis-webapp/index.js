import "babel-polyfill";
import * as tf from '@tensorflow/tfjs';

const modelURL = 'https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/model.json'
const metadataURL = 'https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/metadata.json'
var maxLen
var indexFrom
var wordIndex
var model
var isModelLoaded = false
var happyEmoji = '&#128525;'
var neutralEmoji = '&#128528;'
var angryEmoji = '&#128544;'

const load_model_button = document.getElementById('load-hosted-model');
load_model_button.addEventListener('click', async () => {
	createMessage({message:'Loading model....',color:'green'})
    model = await tf.loadModel(modelURL);
    console.log(model)
    isModelLoaded = true
    createMessage({message:'Model loaded successfully',color:'green'})
    await loadMetadata()
});


async function loadMetadata() {
    const metadataJson = await fetch(metadataURL);
    const sentimentMetadata = await metadataJson.json();
    console.log(sentimentMetadata)
    indexFrom = sentimentMetadata['index_from'];
    maxLen = sentimentMetadata['max_len'];
    console.log('indexFrom = ' + indexFrom);
    console.log('maxLen = ' + maxLen);
    wordIndex = sentimentMetadata['word_index']
    console.log(model)
    //console.table(wordIndex)

}

async function createMessage({message, color}={}) {
    var messageDiv = document.getElementById('message-text')
    messageDiv.innerText = message
    messageDiv.style.color = color
}

var comment_area = document.getElementById('comment');
comment_area.addEventListener('keyup', function(e) {
    console.log(this.value)
    if(!this.value.length){
    	return
    }
    predict(this.value).then(function(response) {
        var score = (response['score'] * 100).toFixed(2)
        var scoreValue = document.getElementById('myBar')
        scoreValue.innerText = score
        scoreValue.style.width = score + '%'
        console.log('score is',score)
        if (score >= 60) {
            document.getElementById('emoji').innerHTML = happyEmoji

        } else if (score >= 40 && score <60) {
        	console.log(score)
            document.getElementById('emoji').innerHTML = neutralEmoji
        } else {
            document.getElementById('emoji').innerHTML = angryEmoji
        }

    })

})


async function predict(text) {
    console.log(text)
    if (!isModelLoaded) {
        createMessage({message:'Load the model first', color:'red'})
        return
    }else{
    	document.getElementById('message-text').innerText= ''
    }
    // Convert to lower case and remove all punctuations.
    const inputText =
        text.trim().toLowerCase().replace(/(\.|\,|\!)/g, '').split(' ');
    // Look up word indices.
    const inputBuffer = tf.buffer([1, maxLen], 'float32');
    for (let i = 0; i < inputText.length; ++i) {
        const word = inputText[i];
        inputBuffer.set(wordIndex[word] + indexFrom, 0, i);
    }
    const input = inputBuffer.toTensor();

    const beginMs = performance.now();
    console.log(model)
    const predictOut = model.predict(input);
    const score = predictOut.dataSync()[0];
    predictOut.dispose();
    const endMs = performance.now();
    let result = { score: score, elapsed: (endMs - beginMs) };
    console.log(result)
    return result
}