class Hud {
    constructor(camera, scene, radius, maxPitch, maxRoll) {
        //искусственный горизонт
        this.attitude = new Attitude(camera, scene, radius, maxPitch, maxRoll);

        this.label = document.createElement('div');
        this.label.style.position = 'absolute';
        this.label.style.width = 100;
        this.label.style.height = 100;
        this.label.style.color = "Lime";
        this.label.style.fontSize = window.innerHeight / 35 + "px";

        let text = `time: -`;
        this.label.innerHTML = text;
        this.label.style.top = 5 + '%';
        this.label.style.left = 5 + '%';
        document.body.appendChild(this.label);
    }
    update(params, rollRads, pitchRads) {
        //let text = `Time: ${Math.floor(params.time)}<br>Score: ${params.score}`;
        let text = "";
        for (let i = 0; i < params.length; i++) {
            text += params[i].name + ": " + "<b>" + params[i].value + "</b>" + " " + params[i].measure + "<br>";
        }




        this.label.innerHTML = text;

        this.attitude.update(rollRads * 180 / Math.PI, pitchRads * 180 / Math.PI);
    }
}