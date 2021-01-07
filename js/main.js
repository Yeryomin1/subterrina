window.onload = function () {

    class External {
        constructor(threeScene, objNum) {
            this.objects = new THREE.Object3D();

            let material = new THREE.MeshPhongMaterial({
                color: 0xdaa520,
                specular: 0xbcbcbc,
                side: THREE.DoubleSide,
            });
            for (let i = 0; i < objNum; i++) {
                let geometry = new THREE.SphereGeometry(Math.random() * 20 + 1, Math.random() * 10 + 2, Math.random() * 10 + 2);

                let item = new THREE.Mesh(geometry, material);
                item.position.x = (Math.random() - 0.5) * 1000;
                item.position.y = (Math.random() - 0.5) * 200;
                item.position.z = -5000 + Math.random() * 4990;
                item.rotation.z = Math.random() * Math.PI;
                item.rotation.y = Math.random() * Math.PI;
                this.objects.add(item);
            }

            let planeSize = 10000;
            let geometry = new THREE.PlaneBufferGeometry(planeSize, planeSize);
            let surface = new THREE.Mesh(geometry, material);
            surface.rotation.x = Math.PI * -.5;
            surface.position.set(0, 150, 0);
            this.objects.add(surface);

            this.pivot = new THREE.Object3D();
            this.pivot.add(this.objects);

            threeScene.add(this.pivot);
        }
    }

    let vehicle = {
        pitch: 0,
        roll: 0,
        heading: 0,
        lastPitch: 0,
        lastRoll: 0,
        lastHeading: 0,

        speed: 20,
        omegaX: 0,
        omegaY: 0,
        omegaZ: 0,

        epsilonX: 0,
        epsilonY: 0,
        epsilonZ: 0,

        efficiency: 2,
        damping: 2,

        xAxis: {},
        yAxis: {},
        zAxis: {},

        frameRate: 0,
        frameCount: 0,
        startTime: 0,
    };

    let renderer;
    let scene;
    let camera;

    function init() {
        let gui = new dat.GUI();
        gui.add(vehicle, 'efficiency').min(0).max(5).step(0.2);
        gui.add(vehicle, 'damping').min(0).max(10).step(0.5);

        let width = window.innerWidth;
        let height = window.innerHeight;
        let canvas = document.getElementById('drawingCanvas');

        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);

        renderer = new THREE.WebGLRenderer({ canvas: canvas });
        renderer.setClearColor(0x000000);
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
        camera.position.set(0, 0, 1);
        camera.lookAt(0, 0, -1);

        //создаем свет
        let spotLight = new THREE.SpotLight(0xffffff);
        spotLight.position.set(0, 0, 1);
        scene.add(spotLight);
        //туман
        //scene.fog = new THREE.Fog(0x000000, 2, 10000);
        //искусственный горизонт
        vehicle.attitude = new Attitude(camera, scene, 0.25, 90, 90);
        //внешние объекты
        vehicle.external = new External(scene, 40);
        //связанная система координат:
        //X:
        vehicle.xAxis.x = 0;
        vehicle.xAxis.y = 0;
        vehicle.xAxis.z = -1;
        //Y:
        vehicle.yAxis.x = 0;
        vehicle.yAxis.y = 1;
        vehicle.yAxis.z = 0;
        //Z:
        vehicle.zAxis.x = 1;
        vehicle.zAxis.y = 0;
        vehicle.zAxis.z = 0;

        //keyboard:
        document.addEventListener('keydown', function (event) {
            switch (event.code) {
                case "KeyW":
                    vehicle.epsilonZ = vehicle.efficiency;
                    break;
                case "KeyS":
                    vehicle.epsilonZ = -vehicle.efficiency;
                    break;
                case "KeyA":
                    vehicle.epsilonY = -vehicle.efficiency;
                    break;
                case "KeyD":
                    vehicle.epsilonY = vehicle.efficiency;
                    break;
                case "Numpad8":
                    vehicle.speed = 100;
                    break;
                case "Numpad2":
                    vehicle.speed = -10;
                    break;
                case "Numpad4":
                    vehicle.epsilonX = vehicle.efficiency;
                    break;
                case "Numpad6":
                    vehicle.epsilonX = -vehicle.efficiency;
                    break;
            }
        });

        document.addEventListener('keyup', function (event) {
            switch (event.code) {
                case "KeyW":
                    vehicle.epsilonZ = 0;
                    break;
                case "KeyS":
                    vehicle.epsilonZ = 0;
                    break;
                case "KeyA":
                    vehicle.epsilonY = 0;
                    break;
                case "KeyD":
                    vehicle.epsilonY = 0;
                    break;
                case "Numpad2":
                    vehicle.speed = 0;
                    break;
                case "Numpad4":
                    vehicle.epsilonX = 0;
                    break;
                case "Numpad6":
                    vehicle.epsilonX = 0;
                    break;
            }
        });

        //таймер
        vehicle.time = new Date();
        vehicle.startTime = vehicle.time;
    }

    vehicle.update = function () {
        vehicle.elapsed = (new Date() - vehicle.time) / 1000;
        vehicle.time = new Date();
        //подсчет fps:
        this.frameCount++;
        console.log("total frame rate = " + 1000 * this.frameCount / (vehicle.time - this.startTime));

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        vehicle.omegaX += (vehicle.epsilonX - vehicle.omegaX * vehicle.damping) * vehicle.elapsed;
        vehicle.omegaY += (vehicle.epsilonY - vehicle.omegaY * vehicle.damping) * vehicle.elapsed;
        vehicle.omegaZ += (vehicle.epsilonZ - vehicle.omegaZ * vehicle.damping) * vehicle.elapsed;

        vehicle.attitude.update(vehicle.roll * 180 / Math.PI, vehicle.pitch * 180 / Math.PI);
    }

    //Цикл анимации:
    function loop() {
        vehicle.update();

        //вектор мгновенной угловой скорости в ГСК:
        //модуль:
        let omegaVal = Math.sqrt(vehicle.omegaX * vehicle.omegaX +
            vehicle.omegaY * vehicle.omegaY + vehicle.omegaZ * vehicle.omegaZ);
        //направление:
        let omegaG = {};
        omegaG.x = (vehicle.xAxis.x * vehicle.omegaX + vehicle.yAxis.x * vehicle.omegaY +
            vehicle.zAxis.x * vehicle.omegaZ) / omegaVal;
        omegaG.y = (vehicle.xAxis.y * vehicle.omegaX + vehicle.yAxis.y * vehicle.omegaY +
            vehicle.zAxis.y * vehicle.omegaZ) / omegaVal;
        omegaG.z = (vehicle.xAxis.z * vehicle.omegaX + vehicle.yAxis.z * vehicle.omegaY +
            vehicle.zAxis.z * vehicle.omegaZ) / omegaVal;

        console.log(omegaVal);
        console.log(omegaG.y);

        if (omegaVal > 0) {
            //поворачиваем объект:

            let axisOfRotation = new THREE.Vector3(omegaG.x, omegaG.y, omegaG.z);
            vehicle.external.pivot.rotateOnAxis(axisOfRotation, omegaVal * vehicle.elapsed);


            //поворачиваем оси ССК:
            rotateVecOnAxis(vehicle.xAxis, omegaG, -omegaVal * vehicle.elapsed);
            rotateVecOnAxis(vehicle.yAxis, omegaG, -omegaVal * vehicle.elapsed);
            rotateVecOnAxis(vehicle.zAxis, omegaG, -omegaVal * vehicle.elapsed);
        }

        function rotateVecOnAxis(vec, axis, radians) {
            let tX = vec.x;
            let tY = vec.y;
            let tZ = vec.z;
            let sin = Math.sin(radians);
            let cos = Math.cos(radians);

            vec.x = tX * (cos + (1 - cos) * axis.x * axis.x) + tY * ((1 - cos) * axis.x *
                axis.y - sin * axis.z) + tZ * ((1 - cos) * axis.x * axis.z + sin * axis.y);

            vec.y = tX * ((1 - cos) * axis.y * axis.x + sin * axis.z) + tY * (cos + (1 - cos) *
                axis.y * axis.y) + tZ * ((1 - cos) * axis.y * axis.z - sin * axis.x);

            vec.z = tX * ((1 - cos) * axis.z * axis.x - sin * axis.y) + tY * ((1 - cos) *
                axis.z * axis.y + sin * axis.x) + tZ * (cos + (1 - cos) * axis.z * axis.z);
        }

        //обновляем углы:
        vehicle.pitch = Math.asin(vehicle.xAxis.y);

        let rollAbs = Math.acos((vehicle.xAxis.x * vehicle.zAxis.z - vehicle.xAxis.z * vehicle.zAxis.x) /
            Math.sqrt(vehicle.xAxis.z * vehicle.xAxis.z + vehicle.xAxis.x * vehicle.xAxis.x));

        vehicle.roll = vehicle.zAxis.y > 0 ? -rollAbs : rollAbs;

        vehicle.heading = (vehicle.xAxis.z < 0 ? Math.atan(-
            vehicle.xAxis.x / vehicle.xAxis.z) : Math.PI + Math.atan(-
                vehicle.xAxis.x / vehicle.xAxis.z));

        //линейное перемещение пространства вдоль оси X ССК:
        vehicle.external.objects.position.x -= vehicle.elapsed * vehicle.speed * Math.cos(vehicle.pitch) * Math.sin(vehicle.heading);
        vehicle.external.objects.position.z += vehicle.elapsed * vehicle.speed * Math.cos(vehicle.pitch) * Math.cos(vehicle.heading);
        vehicle.external.objects.position.y -= vehicle.elapsed * vehicle.speed * Math.sin(vehicle.pitch);

        //рендеринг
        renderer.render(scene, camera);
        //рекурсивная анимация
        requestAnimationFrame(function () { loop(); });
    }

    init();
    loop();
}