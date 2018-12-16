const ml = require('ml-regression');
const csv = require('csvtojson');
const SLR = ml.SLR; // Simple Linear Regression

const csvFilePath = './data/sales-report.csv'; // Data
let dataSet = [], // parsed Data
    X = [], // Input
    y = []; // Output

let regressionModel;

const readline = require('readline'); // For user prompt to allow predictions

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function prepareData() {
    csv()
        .fromFile(csvFilePath)
        .on('json', (jsonObj) => {
            dataSet.push(jsonObj);
        })
        .on('done', () => {

            dataSet.forEach((row) => {
                X.push(parseFloat(row.City_1));
                y.push(parseFloat(row.Sales));
            });
            console.log(X)
            console.log(y)
            trainModel();
        });

}

prepareData()


function trainModel() {
    regressionModel = new SLR(X, y); // Train the model on training data
    console.log(regressionModel.toString());
    predictOutput();
}


function predictOutput() {
    rl.question('Enter input X for prediction (Press CTRL+C to exit) : ', (answer) => {
        console.log(`At X = ${answer}, y =  ${regressionModel.predict(parseFloat(answer))}`);
        predictOutput();
    });
}