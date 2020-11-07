window.onload = function () {

    var canvas = document.getElementById("drawingCanvas");
    var context = canvas.getContext("2d");




    //объекты:
    let game = {};

    game._modalWindow = document.getElementById("modalWindow");
    game._instructionWindow = document.getElementById("instructionWindow");
    game._messageWindow = document.getElementById("messageWindow");

    game._messageTitle = document.getElementById("messageTitle");
    game._messageText = document.getElementById("messageText");

    game._instructionTitle = document.getElementById("instructionTitle");
    game._instructionText = document.getElementById("instructionText");



    game.init = function () {
        draw.init(canvas);
        earth.init();

        //поля:        
        game._stop = true;



        game._frameRate = 60;

        game._pitch = 0;
        game._roll = 0;
        game._heading = 15;
        game._speed = 0;//метры в секунду
        game._verticalSpeed = 0;
        game._power = 0;
        game._depth = 500;//метры
        game._fuel = 100;
        game._oxygen = 100;
        game._earthX = 0;
        game._earthZ = 0;
        game._fuelPerSecond = 0;
        game._oxygenPerSecond = 0.4;

        game._controlPitch = 0;
        game._controlRoll = 0;
        game._controlHeading = 0;
        game._powerSpeed = 0;

        game._angularAccelZ = 0;
        game._angularSpeedZ = 0;
        game._angularDempingZ = 0.5;

        game._angularAccelX = 0;
        game._angularSpeedX = 0;
        game._angularDempingX = 0.5;

        game._angularAccelY = 0;
        game._angularSpeedY = 0;
        game._angularDempingY = 0.5;

        game._maxFinishSpeed = 20;

    }

    //сообщение в модальном окне:
    game.alert = function (msgTitle, msgText) {
        game._messageWindow.style.display = "block";
        game._messageTitle.innerHTML = msgTitle;
        game._messageText.innerHTML = msgText;
    }


    //интерфейс объекта:

    game.controlZToOrigin = function () {
        game._controlPitch = 0;
    }

    game.controlZDown = function () {
        game._controlPitch = 1000;
    }

    game.controlZUp = function () {
        game._controlPitch = -1000;
    }

    game.controlXToOrigin = function () {
        game._controlRoll = 0;
    }

    game.controlXRight = function () {
        game._controlRoll = -1000;
    }

    game.controlXLeft = function () {
        game._controlRoll = 1000;
    }

    game.controlToLeft = function () {
        game._controlHeading = 2000;
    }

    game.controlToRight = function () {
        game._controlHeading = -2000;
    }

    game.controlYToOrigin = function () {
        game._controlHeading = 0;
    }

    game.powerUp = function () {
        if (game._power < 7) {
            game._powerSpeed = 0.4;
        }
    }

    game.powerDown = function () {
        if (game._power > 0) {
            game._powerSpeed = -0.4;
        }

    }

    game.setStop = function (command) {
        game._stop = command;
        if (game._stop) game._modalWindow.style.display = "block";
        else game._modalWindow.style.display = "none";
    }

    game.run = function () {
        //time control:
        //frame time, seconds:
        game.elapsed = (performance.now() - game.current) / 1000;
        //timing:
        game.current = performance.now();

        //рисование:
        context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        //перерисовка:

        draw.render([game._speed, game._power * 14.286, game._fuel, game._oxygen, game._pitch, game._roll, game._depth, game._verticalSpeed, game._heading]);
        game.update(game.elapsed);



    }


    //функция преобразования массива на шаг вперед:        
    game.update = function (elapsed) {
        //проверка состояния "Пауза":
        if (game._stop) return;
        //проверка возможности продолжения игры:
        if (game._oxygen < 0 || game._roll > 55 || game._roll < -55 || game._pitch > 25 || game._pitch < -25 || game._depth < 0 || game._depth > 2800 || earth.winOrLose == -1 || (earth.winOrLose == 1 && game._speed > game._maxFinishSpeed)) {
            game.setStop(true);
            if (game._oxygen < 0) game.alert("GAME OVER", "Lack of oxygen");
            if (game._roll > 55 || game._roll < -55) game.alert("GAME OVER", "The mole is destroyed. Roll restriction violated.");
            if (game._pitch > 25 || game._pitch < -25) game.alert("GAME OVER", "The mole is destroyed. Pitch restriction violated.");
            if (game._depth > 2800) game.alert("GAME OVER", "The mole is destroyed. Depth restriction violated.");
            if (game._depth < 0) game.alert("GAME OVER", "The mole is destroyed. Surface reached.");
            if (earth.winOrLose == -1) game.alert("GAME OVER", "Collision. The underground base is destroyed.");
            if (earth.winOrLose == 1 && game._speed > game._maxFinishSpeed) game.alert("GAME OVER", "The maximum speed of the contact is exceeded. The underground base is destroyed.");
        }
        if (earth.winOrLose == 1 && game._speed <= game._maxFinishSpeed) {
            game.setStop(true);
            game.alert("Mission accomplished", "Great job!!!");
        }
        //реализуется физика:
        if (game._fuel < 0) {
            game._fuel = 0;
            game._fuelPerSecond = 0;
            game._power = 0;
        }
        //курс зациклен:
        if (game._heading >= 360) game._heading -= 360;
        if (game._heading < 0) game._heading += 360;

        let acceleration = -9.8 * Math.sin(game._pitch * 0.01745) + 10 * game._power - 0.2 * game._speed /*- (game._speed > 1 ? 10 : 0)*/;
        if (acceleration < 0 && game._speed < 1) game._speed = 0;
        else game._speed += acceleration * elapsed;
        if (game._speed > 20) {
            let radiansRoll = game._roll * 0.01745;
            let radiansPitch = game._pitch * 0.01745;           

            let angularAccelZmole = -0.00005 * game._speed * game._controlPitch + 0.04 * game._speed * (Math.random() - 0.5);
            let angularAccelXmole = -0.00005 * game._speed * game._controlRoll + 0.04 * game._speed * (Math.random() - 0.5);
            let angularAccelYmole = -0.00005 * game._speed * game._controlHeading + 0.04 * game._speed * (Math.random() - 0.5);


            game._angularSpeedX += (angularAccelXmole - game._angularSpeedX * game._angularDempingX) * elapsed;
            game._angularSpeedY += (angularAccelYmole - game._angularSpeedY * game._angularDempingY) * elapsed;
            game._angularSpeedZ += (angularAccelZmole - game._angularSpeedZ * game._angularDempingZ) * elapsed;

            game._pitch += (game._angularSpeedZ * Math.cos(radiansRoll)  - game._angularSpeedY * Math.sin(radiansRoll))* elapsed;
            game._roll += (game._angularSpeedX + game._angularSpeedY*Math.sin(radiansPitch)) * elapsed;
            game._heading += (game._angularSpeedY+ game._angularSpeedZ * Math.sin(radiansRoll)) * elapsed;


        }
        //режим силовой установки:
        if (game._powerSpeed) {
            let newVal = game._power + game._powerSpeed * elapsed;
            if ((game._powerSpeed > 0 && Math.floor(game._power) == Math.floor(newVal))
                || (game._powerSpeed < 0 && Math.ceil(game._power) == Math.ceil(newVal))) {
                game._power = newVal;
            }
            else if (game._powerSpeed < 0) {
                game._power = Math.floor(game._power);
                game._powerSpeed = 0;
            }
            else if (game._powerSpeed > 0) {
                game._power = Math.ceil(game._power);
                game._powerSpeed = 0;
            }
            game._fuelPerSecond = 0.2 * Math.sqrt(game._power);
        }


        game._verticalSpeed = game._speed * Math.sin(game._pitch / 57.3);
        game._depth -= game._verticalSpeed * elapsed;

        game._fuel -= game._fuelPerSecond * elapsed;
        game._oxygen -= game._oxygenPerSecond * elapsed;
        //передаются приращения в следующей системе координат:
        //начало координат - в кроте (в earth.update() передается смещение начала координат)
        //Оси X и Z - в горизонтальной плоскости, Х - на север
        //У - вверх
        earth.update(game._speed * Math.cos(game._pitch / 57.3) * Math.cos(game._heading / 57.3) * elapsed,
            game._verticalSpeed * elapsed,
            game._speed * Math.cos(game._pitch / 57.3) * Math.sin(game._heading / 57.3) * elapsed)

    }

    //обработка нажатий на кнопки:
    startBut.onclick = function () {
        game.init();
        game.setStop(false);

    }

    informBut.onclick = function () {
        game._instructionTitle.innerHTML = "Controls";
        game._instructionText.innerHTML = "Use keys 'W' and 'S' to control power plant,\
         'A'/'D' - left/right turn. Numpad keys: '8'/'2' - nose down/up,\
          '4'/'6' - roll left/right .<br><b>Subterrina operating restrictions:</b>\
          <br>pitch - 20 degrees (up and down); <br>roll - 45 degrees (left and right);\
          <br>maximum depth - 8200 feet.";
    }

    settingsBut.onclick = function () {
        let mouseFn = function (event) {
            //alert("мышь");   
            game._controlRoll = CANVAS_WIDTH * 0.5 - event.offsetX;
            game._controlPitch = CANVAS_HEIGHT * 0.5 - event.offsetY;
            //временно!!!
            if (!game._stop) {
                //game._angularAccelZ = -0.00005 * game._speed * game._controlPitch;
                //game._angularAccelX = -0.00005 * game._speed * game._controlRoll;
            }




        }
        let inp = confirm("Do you want to use the mouse to control the vehicle?");
        if (inp) {
            alert("Mouse movement affects the values of roll and pitch angles");
            // mouse:
            canvas.addEventListener('mousemove', mouseFn);
            document.getElementsByTagName('html')[0].style.cursor = "none";
        }
        else {
            alert("Use numpad to control the values of roll (4, 6) and pitch (2, 8) angles");
            canvas.removeEventListener('mousemove', mouseFn);
            document.getElementsByTagName('html')[0].style.cursor = "default";
        }
    }







    //keyboard:
    document.addEventListener('keydown', function (event) {
        switch (event.code) {
            case "KeyW":
                game.powerUp();
                break;
            case "KeyS":
                game.powerDown();
                break;
            case "KeyA":
                game.controlToLeft();
                break;
            case "KeyD":
                game.controlToRight();
                break;
            case "Numpad8":
                game.controlZDown();
                break;
            case "Numpad2":
                game.controlZUp();
                break;
            case "Numpad4":
                game.controlXLeft();
                break;
            case "Numpad6":
                game.controlXRight();
                break;
        }
    });

    document.addEventListener('keyup', function (event) {
        switch (event.code) {
            case "KeyA":
                game.controlYToOrigin();
                break;
            case "KeyD":
                game.controlYToOrigin();
                break;
            case "Numpad8":
            case "Numpad2":
                game.controlZToOrigin();
                break;
            case "Numpad4":
            case "Numpad6":
                game.controlXToOrigin();
                break;
        }
    });



    //цикл игры: 

    let interval = setInterval(game.run, 1000 / game._frameRate);



};