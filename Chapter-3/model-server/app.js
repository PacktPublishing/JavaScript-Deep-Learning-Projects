const express = require('express')
var bodyParser = require('body-parser');


let trainDescriptorsByClass = []
const app = express()

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

let port;
var env = process.env.NODE_ENV || 'development'
if (env == "development") {
    process.env.PORT = 2018;
}
console.log("app live on :", process.env.PORT)
app.get('/api/clean/:pass', (req, res) => {

    if (req.params.pass == '121002') {
        trainDescriptorsByClass = [];
        res.status(200);
        res.send("Model cleaned");
    }

    else {
        res.status(400)
        res.send("Model not cleaned, invalid password");
    }
})

app.post('/api', (req, res) => {
    var descriptorByClass = {
        "descriptors": req.body.descriptors,
        "className": req.body.className
    }

    trainDescriptorsByClass.push(descriptorByClass)
    res.status(200)
    res.send(trainDescriptorsByClass)
})

app.get('/api/getModel', (req, res) => {
    res.status(200)
    res.send(trainDescriptorsByClass)
})

app.listen(process.env.PORT)
