var data = [];

var salesData = [{
  "amount": 230.1,
  "sales":22.1
},{
  "amount": 44.5,
  "sales":39.3
},{
  "amount": 17.2,
  "sales":45.9
},{
  "amount": 151.5,
  "sales":41.3
},{
  "amount": 180.8,
  "sales":10.8
},{
  "amount": 8.7,
  "sales":48.9
},{
  "amount": 57.5,
  "sales":32.8
},{
  "amount": 120.2,
  "sales":19.6
}]


var m = 1;
var b = 0;

function setup() {
    createCanvas(600, 600);
}

function linearRegression() {
    var xsum = 0;
    var ysum = 0;
    for (var i = 0; i < data.length; i++) {
        xsum += data[i].x;
        ysum += data[i].y;
    }
    // for (var i = 0; i < data.length; i++) {        
    //     xsum += map(data[i].x, 0, 1, 0, width);
    //     ysum += map(data[i].y, 0, 1, height, 0);
    // }

    var xmean = xsum / data.length;
    var ymean = ysum / data.length;
    var num = 0;
    var den = 0;
    for (var i = 0; i < data.length; i++) {
        var x = data[i].x;
        var y = data[i].y;
        num += (x - xmean) * (y - ymean);
        den += (x - xmean) * (x - xmean);
    }

    m = num / den;
    b = ymean - m * xmean;
    var equation = "y = "+m+"x + "+b
    document.getElementById('equation').innerHTML = equation
}

function drawLine() {
    var x1 = 0;
    var y1 = m * x1 + b;
    var x2 = 1;
    var y2 = m * x2 + b;

    x1 = map(x1, 0, 1, 0, width);
    y1 = map(y1, 0, 1, height, 0);
    x2 = map(x2, 0, 1, 0, width);
    y2 = map(y2, 0, 1, height, 0);

    stroke(255);
    strokeWeight(2);
    line(x1, y1, x2, y2);
}


function mousePressed() {
    // salesData.map(function(report){
    //   var x = map(report.amount, 0, width, 0, 1);
    //   var y = map(report.sales, 0, height, 1, 0);
    //   var point = createVector(x, y);
    //   data.push(point);
    // })

    var x = map(mouseX, 0, width, 0, 1);
    var y = map(mouseY, 0, height, 1, 0);
    var point = createVector(x, y);
    data.push(point);
    
}

function draw() {
    background('black');    
    for (var i = 0; i < data.length; i++) {
        var x = map(data[i].x, 0, 1, 0, width);
        var y = map(data[i].y, 0, 1, height, 0);
        fill(255);
        stroke(255);
        ellipse(x, y, 8, 8);
    }

    if (data.length > 1) {
        linearRegression();
        drawLine();
    }

}