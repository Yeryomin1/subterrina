
let draw = {};

draw.init = function (canvas) {
    draw.canvas = canvas;
    draw.ctx = canvas.getContext("2d");

    draw._maxSpeed = 800;
    draw._maxPower = 100;
    draw._maxFuel = 100;
    draw._maxOxygen = 100;
    draw._maxDepth = 10;
    draw._maxVerticalSpeed = 800;

    draw._lastData = [0, 0, 100, 100, 0, 0, 500, 0, 15];

    draw._indicatorHeight = 7 * CANVAS_HEIGHT / 30;
    draw._indicatorWidth = 0.05 * CANVAS_WIDTH;

    draw._locatorOrigX = 0.5 * CANVAS_WIDTH;
    draw._locatorOrigY = 0.815 * CANVAS_HEIGHT;

    draw._alarmState = false;
}


//функция рисования всего:
draw.render = function (array) {
    this.drawSpeed((array[0] + draw._lastData[0]) * 0.5 / 0.514);//перевод в узлы
    this.drawPower((array[1] + draw._lastData[1]) * 0.5);
    this.drawFuel((array[2] + draw._lastData[2]) * 0.5);
    this.drawOxygen((array[3] + draw._lastData[3]) * 0.5);
    this.drawAttitude((array[4] + draw._lastData[4]) * 0.5, (array[5] + draw._lastData[5]) * 0.5);
    this.drawDepth((array[6] + draw._lastData[6]) * 0.5 / 305); //перевод в килофуты
    this.drawVerticalSpeed((array[7] + draw._lastData[7]) * 0.5 / 0.514) //перевод в узлы 
    this.drawHeading((array[8] + draw._lastData[8]) * 0.5);
    this.drawEarth(array[4], array[5], array[8]);
    this.alarm(array);
    draw._lastData = array;
}



draw.drawSpeed = function (value) {
    draw._straightIndicator("Speed, knots", value, draw._maxSpeed, 0.24 * CANVAS_WIDTH, 0.05 * CANVAS_HEIGHT);
}

draw.drawPower = function (value) {
    draw._straightIndicator("Power plant, %", value, draw._maxPower, 0.06 * CANVAS_WIDTH, 0.38 * CANVAS_HEIGHT);
}

draw.drawFuel = function (value) {
    draw._straightIndicator("Fuel, %", value, draw._maxFuel, 0.24 * CANVAS_WIDTH, 0.38 * CANVAS_HEIGHT, true);
}

draw.drawOxygen = function (value) {
    draw._straightIndicator("Oxygen, %", value, draw._maxOxygen, 0.06 * CANVAS_WIDTH, 0.05 * CANVAS_HEIGHT, true);
}

draw.drawVerticalSpeed = function (value) {
    draw._straightIndicatorSign("Vertical speed, knots", value, draw._maxVerticalSpeed, 0.74 * CANVAS_WIDTH, 0.05 * CANVAS_HEIGHT);
}

draw.drawDepth = function (value) {
    draw._straightIndicator("Depth, 1000 feet", value, draw._maxDepth, 0.74 * CANVAS_WIDTH, 0.38 * CANVAS_HEIGHT, true);
}


draw.alarm = function (params) {
    this._alarm = false;
    if (params[2] < 10) this._alarm = 2;
    if (params[3] < 10) this._alarm = 3;
    if (params[6] > 2500) this._alarm = 7;
    if (params[4] > 20 || params[4] < -20) this._alarm = 4;
    if (params[5] > 45 || params[5] < -45) this._alarm = 5;
    if (params[6] < 200) this._alarm = 6;
    switch (this._alarm) {
        case false:
            break;
        case 2:
            this.drawFrame("Fuel");
            break;
        case 3:
            this.drawFrame("Oxygen");
            break;
        case 4:
            this.drawFrame("Pitch, " + ((params[4] > 0) ? "nose DOWN" : "nose UP"));
            break;
        case 5:
            this.drawFrame("Roll");
            break;
        case 6:
            this.drawFrame("Surface, nose DOWN");
            break;
        case 7:
            this.drawFrame("Deep, nose UP");
            break;
    }
    this.drawFrame = function (textMsg) {
        this.ctx.beginPath();
        this.ctx.lineWidth = 3;
        this.ctx.fillStyle = 'red';
        this.ctx.strokeStyle = "red";
        this.ctx.font = '20px Verdana';
        this.ctx.strokeRect(0.06 * CANVAS_WIDTH, 0.7 * CANVAS_HEIGHT, draw._indicatorHeight, draw._indicatorWidth);
        this.ctx.fillText("WARNING", 0.07 * CANVAS_WIDTH, 0.75 * CANVAS_HEIGHT);

        this.ctx.beginPath();
        this.ctx.font = '14px Verdana';
        this.ctx.fillText(textMsg, 0.06 * CANVAS_WIDTH, 0.7 * CANVAS_HEIGHT + draw._indicatorWidth + 20);
    }

}



draw.drawEarth = function (pitch, roll, heading) {
    this.ctx.beginPath();
    this.ctx.fillStyle = 'black';
    let radius = CANVAS_HEIGHT * 0.18;
    //this.ctx.fillRect(draw._locatorLeft, draw._locatorTop, draw._indicatorHeight*2, draw._indicatorHeight*1.5);
    this.ctx.arc(draw._locatorOrigX, draw._locatorOrigY, radius, 0, 2 * Math.PI, false);

    this.ctx.stroke();
    this.ctx.arc(draw._locatorOrigX + CANVAS_HEIGHT * 0.45, draw._locatorOrigY, radius, 0, 2 * Math.PI, false);
    this.ctx.fill();
    let line;
    for (let i = 0; i < earth.lines.length; i++) {
        line = earth.getLineForScreen(i, heading * 0.01745, pitch * 0.01745/*, roll* 0.01745*/);
        if (line.dist) this.drawMapMarks(i, heading * 0.01745);
        if (line.visible && isInsideScreen(line.x0 * 200, line.y0 * 200) && isInsideScreen(line.x1 * 200, line.y1 * 200)) {

            this.ctx.beginPath();
            this.ctx.save();


            this.ctx.translate(draw._locatorOrigX, draw._locatorOrigY);
            this.ctx.rotate(-roll * 0.01745);

            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = line.color;
            this.ctx.fillStyle = "white";
            this.ctx.moveTo(/*draw._locatorOrigX + */line.x0 * 200, /*draw._locatorOrigY -*/ line.y0 * 200);
            this.ctx.lineTo(/*draw._locatorOrigX + */line.x1 * 200, /*draw._locatorOrigY -*/ line.y1 * 200);

            this.ctx.stroke();
            this.ctx.font = '12px Verdana';
            if (line.dist) this.ctx.fillText(Math.round(line.dist / 18.52) / 100 + " nm", (line.x0 + line.x1) * 100 + 2, (line.y0 + line.y1) * 100 - 2);
            this.ctx.restore();

            //alert("in");
            //alert(line.x0*1000+" "+line.y0*1000);           
        }
    }
    this.ctx.beginPath();
    this.ctx.strokeStyle = 'white';
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([3, 2]);
    //перекрестие на локаторе
    this.ctx.moveTo(draw._locatorOrigX - radius, draw._locatorOrigY);
    this.ctx.lineTo(draw._locatorOrigX + radius, draw._locatorOrigY);

    this.ctx.moveTo(draw._locatorOrigX, draw._locatorOrigY - radius);
    this.ctx.lineTo(draw._locatorOrigX, draw._locatorOrigY + radius);
    //перекрестие на навигаторе
    this.ctx.moveTo(draw._locatorOrigX - radius + CANVAS_HEIGHT * 0.45, draw._locatorOrigY);
    this.ctx.lineTo(draw._locatorOrigX + radius + CANVAS_HEIGHT * 0.45, draw._locatorOrigY);

    this.ctx.moveTo(draw._locatorOrigX + CANVAS_HEIGHT * 0.45, draw._locatorOrigY - radius);
    this.ctx.lineTo(draw._locatorOrigX + CANVAS_HEIGHT * 0.45, draw._locatorOrigY + radius);


    this.ctx.stroke();
    this.ctx.setLineDash([5, 0]);




    function isInsideScreen(x, y) {
        //return true;
        if (x == undefined || y == undefined) return false;
        return (x * x + y * y < radius * radius);
    }


}

draw.drawMapMarks = function (showedLineNum, heading) {
    this.drawTarget(earth.lines[showedLineNum].z0 / 100, earth.lines[showedLineNum].x0 / 100);
    this.drawArrow(heading);
}
draw.drawTarget = function (x, y) {
if (Math.sqrt(x*x+y*y)<CANVAS_HEIGHT * 0.18){
        this.ctx.beginPath();
    this.ctx.strokeStyle = 'lime';
    this.ctx.moveTo(draw._locatorOrigX + CANVAS_HEIGHT * 0.45 + x - 1, draw._locatorOrigY - y);

    this.ctx.lineTo(draw._locatorOrigX + CANVAS_HEIGHT * 0.45 + x + 1, draw._locatorOrigY - y);

    this.ctx.stroke();
}
this.ctx.strokeStyle = 'white';
}

draw.drawArrow = function (heading) {
    //поворачиваем все
    this.ctx.save();
    this.ctx.translate(draw._locatorOrigX + CANVAS_HEIGHT * 0.45, draw._locatorOrigY);
    this.ctx.rotate(heading);
//размеры символа
    let halfLength = 15;
    let halfWidth = 8;
    this.ctx.beginPath();
    this.ctx.fillStyle = 'yellow';
    this.ctx.strokeStyle = 'orange';
    //правый борт
    this.ctx.moveTo(0, - halfLength);
    this.ctx.lineTo(halfWidth, halfLength);
    //корма
    this.ctx.lineTo(0, halfLength * 0.5);
    this.ctx.lineTo(- halfWidth, halfLength);
    //левый борт
    this.ctx.lineTo(0, - halfLength);
    this.ctx.fill();
    this.ctx.stroke();
//возврат поворота в исходное
    this.ctx.restore();

}




draw._straightIndicatorSign = function (label, currentValue, maxValue, xLeft, yTop) {
    this.ctx.beginPath();
    this.ctx.lineWidth = 1;
    this.ctx.fillStyle = 'black';
    this.ctx.strokeStyle = "black";
    this.ctx.fillRect(xLeft, yTop, draw._indicatorWidth, draw._indicatorHeight);

    this.ctx.beginPath();
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(xLeft + 2, yTop + draw._indicatorHeight / 2/*(1-currentValue/maxValue)*/, draw._indicatorWidth - 4, -0.5 * draw._indicatorHeight * currentValue / maxValue);
    this.ctx.fillStyle = 'black';

    for (let i = 0; i < 11; i++) {
        this.ctx.moveTo(xLeft - ((i == 0 || i == 5 || i == 10) ? 8 : 4), yTop + i * draw._indicatorHeight * 0.1);
        this.ctx.lineTo(xLeft + draw._indicatorWidth + 2, yTop + i * draw._indicatorHeight * 0.1);
        this.ctx.stroke();
    }
    this.ctx.font = '14px Verdana';
    this.ctx.fillStyle = 'black';
    this.ctx.fillText(label, xLeft - 36, yTop - 8);
    this.ctx.fillText(Math.round(currentValue), xLeft + draw._indicatorWidth + 4, yTop + 10);
    this.ctx.fillText(-maxValue, xLeft - 42, yTop + draw._indicatorHeight + 6);
    this.ctx.fillText(0, xLeft - 36, yTop + draw._indicatorHeight * 0.5 + 6);
    this.ctx.fillText(maxValue, xLeft - 36, yTop + 6);
}









draw._straightIndicator = function (label, currentValue, maxValue, xLeft, yTop, tenth) {
    this.ctx.beginPath();
    this.ctx.lineWidth = 1;
    this.ctx.fillStyle = 'black';
    this.ctx.strokeStyle = "black";
    this.ctx.fillRect(xLeft, yTop, draw._indicatorWidth, draw._indicatorHeight);

    this.ctx.beginPath();
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(xLeft + 2, yTop + draw._indicatorHeight * (1 - currentValue / maxValue), draw._indicatorWidth - 4, draw._indicatorHeight * currentValue / maxValue);
    this.ctx.fillStyle = 'black';

    for (let i = 0; i < 11; i++) {
        this.ctx.moveTo(xLeft - ((i == 0 || i == 5 || i == 10) ? 8 : 4), yTop + i * draw._indicatorHeight * 0.1);
        this.ctx.lineTo(xLeft + draw._indicatorWidth + 2, yTop + i * draw._indicatorHeight * 0.1);
        this.ctx.stroke();
    }
    this.ctx.font = '14px Verdana';
    this.ctx.fillStyle = 'black';
    this.ctx.fillText(label, xLeft - 36, yTop - 8);
    this.ctx.fillText(tenth ? Math.round(currentValue * 10) / 10 : Math.round(currentValue), xLeft + draw._indicatorWidth + 4, yTop + 10);
    this.ctx.fillText(0, xLeft - 36, yTop + draw._indicatorHeight + 6);
    this.ctx.fillText(Math.round(maxValue / 2), xLeft - 36, yTop + draw._indicatorHeight * 0.5 + 6);
    this.ctx.fillText(maxValue, xLeft - 36, yTop + 6);
}

draw.drawAttitude = function (pitch, roll) {
    roll *= 0.01745; //перевод в радианы  
    if (pitch > 30) pitch = 30;//нужно ли?
    if (pitch < -30) pitch = -30;
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = "Black";
    this.ctx.beginPath();
    this.ctx.arc(CANVAS_WIDTH * 0.5, CANVAS_HEIGHT * 0.2, CANVAS_HEIGHT * 0.18, 0, Math.PI, false);
    this.ctx.fillStyle = "Black";
    this.ctx.stroke();
    this.ctx.fill();
    this.ctx.arc(CANVAS_WIDTH * 0.5, CANVAS_HEIGHT * 0.2, CANVAS_HEIGHT * 0.18, 0, Math.PI, true);
    this.ctx.stroke();
    this.ctx.lineWidth = 1;

    //силуэт:

    this.ctx.beginPath();
    let topSideVisible = (pitch >= 0);
    this.ctx.strokeStyle = topSideVisible ? "Orange" : "Brown";
    this.ctx.fillStyle = topSideVisible ? "Yellow" : "Red";
    this.ctx.lineWidth = 3;

    this.ctx.moveTo(CANVAS_WIDTH * 0.5, CANVAS_HEIGHT * (0.2 - pitch * 0.006));
    this.ctx.lineTo(CANVAS_WIDTH * 0.5 + CANVAS_HEIGHT * 0.16 * Math.cos(roll), CANVAS_HEIGHT * 0.2 + CANVAS_HEIGHT * 0.16 * Math.sin(roll));
    this.ctx.lineTo(CANVAS_WIDTH * 0.5, CANVAS_HEIGHT * (0.2 - pitch * 0.002));
    this.ctx.lineTo(CANVAS_WIDTH * 0.5 - CANVAS_HEIGHT * 0.16 * Math.cos(roll), CANVAS_HEIGHT * 0.2 - CANVAS_HEIGHT * 0.16 * Math.sin(roll));
    this.ctx.lineTo(CANVAS_WIDTH * 0.5, CANVAS_HEIGHT * (0.2 - pitch * 0.006));
    this.ctx.stroke();
    this.ctx.fill();


    //шкала
    this.ctx.beginPath();
    this.ctx.strokeStyle = "Black";
    this.ctx.fillStyle = "Black";
    this.ctx.lineWidth = 1;
    this.ctx.fillText(20, CANVAS_WIDTH * 0.5 - 28, CANVAS_HEIGHT * 0.08 + 5);
    this.ctx.fillText(10, CANVAS_WIDTH * 0.5 - 28, CANVAS_HEIGHT * 0.14 + 5);

    this.ctx.moveTo(CANVAS_WIDTH * 0.5 - 8, CANVAS_HEIGHT * 0.08);
    this.ctx.lineTo(CANVAS_WIDTH * 0.5 + 8, CANVAS_HEIGHT * 0.08);
    this.ctx.stroke();

    this.ctx.moveTo(CANVAS_WIDTH * 0.5 - 8, CANVAS_HEIGHT * 0.14);
    this.ctx.lineTo(CANVAS_WIDTH * 0.5 + 8, CANVAS_HEIGHT * 0.14);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.strokeStyle = "White";
    this.ctx.fillStyle = "White";

    this.ctx.fillText(10, CANVAS_WIDTH * 0.5 - 34, CANVAS_HEIGHT * 0.26 + 5);
    this.ctx.fillText(20, CANVAS_WIDTH * 0.5 - 34, CANVAS_HEIGHT * 0.32 + 5);

    this.ctx.moveTo(CANVAS_WIDTH * 0.5 - 8, CANVAS_HEIGHT * 0.26);
    this.ctx.lineTo(CANVAS_WIDTH * 0.5 + 8, CANVAS_HEIGHT * 0.26);
    this.ctx.stroke();

    this.ctx.moveTo(CANVAS_WIDTH * 0.5 - 8, CANVAS_HEIGHT * 0.32);
    this.ctx.lineTo(CANVAS_WIDTH * 0.5 + 8, CANVAS_HEIGHT * 0.32);
    this.ctx.stroke();

    //метки крена:
    this.ctx.lineWidth = 2;
    //+-15 градусов
    this.ctx.fillText(15, CANVAS_WIDTH * 0.5 + 0.966 * CANVAS_HEIGHT * 0.16 - 22, CANVAS_HEIGHT * 0.2 + 0.259 * CANVAS_HEIGHT * 0.16);
    this.ctx.moveTo(CANVAS_WIDTH * 0.5 + 0.966 * CANVAS_HEIGHT * 0.16 - 2, CANVAS_HEIGHT * 0.2 + 0.259 * CANVAS_HEIGHT * 0.16);
    this.ctx.lineTo(CANVAS_WIDTH * 0.5 + 0.966 * CANVAS_HEIGHT * 0.16 + 3, CANVAS_HEIGHT * 0.2 + 0.259 * CANVAS_HEIGHT * 0.16 + 1);

    this.ctx.moveTo(CANVAS_WIDTH * 0.5 - 0.966 * CANVAS_HEIGHT * 0.16 + 2, CANVAS_HEIGHT * 0.2 + 0.259 * CANVAS_HEIGHT * 0.16);
    this.ctx.fillText(15, CANVAS_WIDTH * 0.5 - 0.966 * CANVAS_HEIGHT * 0.16 + 4, CANVAS_HEIGHT * 0.2 + 0.259 * CANVAS_HEIGHT * 0.16);
    this.ctx.lineTo(CANVAS_WIDTH * 0.5 - 0.966 * CANVAS_HEIGHT * 0.16 - 3, CANVAS_HEIGHT * 0.2 + 0.259 * CANVAS_HEIGHT * 0.16 + 1);

    //+-30 градусов
    this.ctx.moveTo(CANVAS_WIDTH * 0.5 + 0.866 * CANVAS_HEIGHT * 0.16 - 3, CANVAS_HEIGHT * 0.2 + 0.5 * CANVAS_HEIGHT * 0.16 - 1);
    this.ctx.lineTo(CANVAS_WIDTH * 0.5 + 0.866 * CANVAS_HEIGHT * 0.16 + 3, CANVAS_HEIGHT * 0.2 + 0.5 * CANVAS_HEIGHT * 0.16 + 2);

    this.ctx.moveTo(CANVAS_WIDTH * 0.5 - 0.866 * CANVAS_HEIGHT * 0.16 + 3, CANVAS_HEIGHT * 0.2 + 0.5 * CANVAS_HEIGHT * 0.16 - 1);
    this.ctx.lineTo(CANVAS_WIDTH * 0.5 - 0.866 * CANVAS_HEIGHT * 0.16 - 3, CANVAS_HEIGHT * 0.2 + 0.5 * CANVAS_HEIGHT * 0.16 + 2);
    //+-45 градусов
    this.ctx.moveTo(CANVAS_WIDTH * 0.5 + 0.707 * CANVAS_HEIGHT * 0.16 - 3, CANVAS_HEIGHT * 0.2 + 0.707 * CANVAS_HEIGHT * 0.16 - 3);
    this.ctx.lineTo(CANVAS_WIDTH * 0.5 + 0.707 * CANVAS_HEIGHT * 0.16 + 3, CANVAS_HEIGHT * 0.2 + 0.707 * CANVAS_HEIGHT * 0.16 + 3);

    this.ctx.moveTo(CANVAS_WIDTH * 0.5 - 0.707 * CANVAS_HEIGHT * 0.16 + 3, CANVAS_HEIGHT * 0.2 + 0.707 * CANVAS_HEIGHT * 0.16 - 3);
    this.ctx.lineTo(CANVAS_WIDTH * 0.5 - 0.707 * CANVAS_HEIGHT * 0.16 - 3, CANVAS_HEIGHT * 0.2 + 0.707 * CANVAS_HEIGHT * 0.16 + 3);
    //+-60 градусов
    /*
    this.ctx.moveTo(CANVAS_WIDTH*0.5 + 0.5*CANVAS_HEIGHT*0.16 - 1, CANVAS_HEIGHT*0.2 + 0.866*CANVAS_HEIGHT*0.16 - 3);
    this.ctx.lineTo(CANVAS_WIDTH*0.5 + 0.5*CANVAS_HEIGHT*0.16 + 2, CANVAS_HEIGHT*0.2 + 0.866*CANVAS_HEIGHT*0.16 + 3);
 
    this.ctx.moveTo(CANVAS_WIDTH*0.5 - 0.5*CANVAS_HEIGHT*0.16 + 2, CANVAS_HEIGHT*0.2 + 0.866*CANVAS_HEIGHT*0.16 - 3);
    this.ctx.lineTo(CANVAS_WIDTH*0.5 - 0.5*CANVAS_HEIGHT*0.16 - 1, CANVAS_HEIGHT*0.2 + 0.866*CANVAS_HEIGHT*0.16 + 3);  
    */
    this.ctx.stroke();

}

draw.drawHeading = function (value) {
    //value = 256;
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = "Black";
    this.ctx.beginPath();
    //this.ctx.arc(CANVAS_WIDTH*0.5, CANVAS_HEIGHT*0.2, CANVAS_HEIGHT*0.18, 0, Math.PI, false);
    this.ctx.arc(CANVAS_WIDTH * 0.5, CANVAS_HEIGHT * 0.85, CANVAS_HEIGHT * 0.4, Math.PI * 1.6667, Math.PI * 1.3333, true);
    this.ctx.fillStyle = "Black";
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.lineWidth = 1;
    this.ctx.moveTo(CANVAS_WIDTH * 0.5, CANVAS_HEIGHT * 0.44);
    this.ctx.lineTo(CANVAS_WIDTH * 0.5, CANVAS_HEIGHT * 0.50);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.lineWidth = 2;
    this.ctx.moveTo(CANVAS_WIDTH * 0.5, CANVAS_HEIGHT * 0.50);
    this.ctx.lineTo(CANVAS_WIDTH * 0.5 - 5, CANVAS_HEIGHT * 0.50 + 15);
    this.ctx.lineTo(CANVAS_WIDTH * 0.5, CANVAS_HEIGHT * 0.50 + 12);
    this.ctx.lineTo(CANVAS_WIDTH * 0.5 + 5, CANVAS_HEIGHT * 0.50 + 15);
    this.ctx.lineTo(CANVAS_WIDTH * 0.5, CANVAS_HEIGHT * 0.50);
    this.ctx.strokeRect(CANVAS_WIDTH * 0.5 - 15, CANVAS_HEIGHT * 0.44, 30, -18);
    this.ctx.fillText(Math.floor(value), CANVAS_WIDTH * 0.5 - 14, CANVAS_HEIGHT * 0.44 - 3);
    this.ctx.fillText("HDG", CANVAS_WIDTH * 0.5 - 50, CANVAS_HEIGHT * 0.44 - 3);
    this.ctx.fillText("MAG", CANVAS_WIDTH * 0.5 + 18, CANVAS_HEIGHT * 0.44 - 3);
    this.ctx.stroke();

    this.ctx.beginPath();
    let labelPos = 1;//позиции шкалы с шагом 30
    while (labelPos * 3 < value / 10 && labelPos < 12) labelPos++;
    let left = (labelPos - 1) * 3;
    let right = labelPos * 3;
    //alert(left+" "+right);
    let leftRadians = (left - value / 10) * 0.1745;
    let rightRadians = (right - value / 10) * 0.1745;
    function label(num) {
        let res;
        switch (num) {
            case 0:
            case 36:
                res = "N";
                break;
            case 9:
                res = "E";
                break;
            case 18:
                res = "S";
                break;
            case 27:
                res = "W";
                break;
            default:
                res = num < 10 ? "0" + num : num;
        }
        return res;
    }


    this.ctx.moveTo(CANVAS_WIDTH * 0.5 + CANVAS_HEIGHT * 0.4 * Math.sin(leftRadians), CANVAS_HEIGHT * 0.85 - CANVAS_HEIGHT * 0.4 * Math.cos(leftRadians));
    this.ctx.lineTo(CANVAS_WIDTH * 0.5 + CANVAS_HEIGHT * 0.38 * Math.sin(leftRadians), CANVAS_HEIGHT * 0.85 - CANVAS_HEIGHT * 0.38 * Math.cos(leftRadians));
    this.ctx.fillText(label(left), CANVAS_WIDTH * 0.5 + CANVAS_HEIGHT * 0.34 * Math.sin(leftRadians) - 8, CANVAS_HEIGHT * 0.85 - CANVAS_HEIGHT * 0.34 * Math.cos(leftRadians));



    this.ctx.moveTo(CANVAS_WIDTH * 0.5 + CANVAS_HEIGHT * 0.4 * Math.sin(rightRadians), CANVAS_HEIGHT * 0.85 - CANVAS_HEIGHT * 0.4 * Math.cos(rightRadians));
    this.ctx.lineTo(CANVAS_WIDTH * 0.5 + CANVAS_HEIGHT * 0.38 * Math.sin(rightRadians), CANVAS_HEIGHT * 0.85 - CANVAS_HEIGHT * 0.38 * Math.cos(rightRadians));
    this.ctx.fillText(label(right), CANVAS_WIDTH * 0.5 + CANVAS_HEIGHT * 0.34 * Math.sin(rightRadians) - 8, CANVAS_HEIGHT * 0.85 - CANVAS_HEIGHT * 0.34 * Math.cos(rightRadians));
    this.ctx.stroke();
}

