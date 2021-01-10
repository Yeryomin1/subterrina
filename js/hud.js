class Hud {
    constructor(camera, scene, radius, maxPitch, maxRoll) {
        //искусственный горизонт
        this.attitude = new Attitude(camera, scene, radius, maxPitch, maxRoll);

        //текстовый hud:
        this.label = document.createElement('div');
        this.label.style.position = 'absolute';
        this.label.style.width = 100;
        this.label.style.height = 100;
        this.label.style.color = "Lime";
        this.label.style.fontSize = window.innerHeight / 35 + "px";

        let text = ``;
        this.label.innerHTML = text;
        this.label.style.top = 5 + '%';
        this.label.style.left = 5 + '%';
        document.body.appendChild(this.label);

        //Сообщение:
        this.msg = document.createElement('div');
        this.msg.style.position = 'absolute';
        this.msg.style.width = 100;
        this.msg.style.height = 100;
        this.msg.style.color = "Yellow";
        this.msg.style.fontSize = window.innerHeight / 15 + "px";
        this.msg.innerHTML = text;
        this.msg.style.top = 50 + '%';
        this.msg.style.left = 5 + '%';
        document.body.appendChild(this.msg);
    }
    update(params, rollRads, pitchRads, message) {
        //текстовый hud:
        let text = "";
        for (let i = 0; i < params.length; i++) {
            text += params[i].name + ": " + "<b>" + params[i].value + "</b>" + " " + params[i].measure + "<br>";
        }
        this.label.innerHTML = text;
        //сообщение:
        this.msg.innerHTML = "<b>" + message + "</b>";

        this.attitude.update(rollRads * 180 / Math.PI, pitchRads * 180 / Math.PI);
    }
}