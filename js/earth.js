let earth = {};
earth.init = function () {
    //подземная база:
    let minX = 8000;
    let size = 200;
    let step = size * 0.2;

    earth.centreX = minX + size / 2;
    earth.centreY = size / 2;
    earth.centreZ = size / 2;
    earth.radius = 0.5 * Math.sqrt(3) * size;
    earth.collisionState = false;
    earth.inGoal = false;
    earth.winOrLose = 0; //"-1" game over, "1" - Mission accomplished


    earth.lines = [];

    for (let i = 0; i < 6; i++) {
        //горизонтальные:
        earth.lines.push({ x0: minX + size, y0: i * step, z0: 0, x1: minX + size, y1: i * step, z1: size, color: "yellow" });
        earth.lines.push({ x0: minX, y0: i * step, z0: 0, x1: minX, y1: i * step, z1: size, color: "yellow" });
        earth.lines.push({ x0: minX + i * step, y0: 0, z0: 0, x1: minX + i * step, y1: 0, z1: size, color: "yellow" });
        earth.lines.push({ x0: minX + i * step, y0: size, z0: 0, x1: minX + i * step, y1: size, z1: size, color: "yellow" });
        earth.lines.push({ x0: minX + size, y0: i * step, z0: 0, x1: minX, y1: i * step, z1: 0, color: "yellow" });

        //вертикальные:
        earth.lines.push({ x0: minX + size, y0: size, z0: i * step, x1: minX + size, y1: 0, z1: i * step, color: "yellow" });
        earth.lines.push({ x0: minX + i * step, y0: 0, z0: 0, x1: minX + i * step, y1: size, z1: 0, color: "yellow" });
        earth.lines.push({ x0: minX, y0: 0, z0: i * step, x1: minX, y1: size, z1: i * step, color: "yellow" });
    }
    //ворота:
    earth.lines.push({ x0: minX + step, y0: step, z0: size, x1: minX + step, y1: size - step, z1: size, color: "lime", showDist: true });
    earth.lines.push({ x0: minX + size - step, y0: step, z0: size, x1: minX + size - step, y1: size - step, z1: size, color: "lime" });
    earth.lines.push({ x0: minX + step, y0: step, z0: size, x1: minX + size - step, y1: step, z1: size, color: "lime" });
    earth.lines.push({ x0: minX + step, y0: size - step, z0: size, x1: minX + size - step, y1: size - step, z1: size, color: "lime" });
}

earth.update = function (dx, dy, dz) {
    for (let i = 0; i < this.lines.length; i++) {
        this.lines[i].x0 -= dx;
        this.lines[i].y0 += dy;
        this.lines[i].z0 -= dz;

        this.lines[i].x1 -= dx;
        this.lines[i].y1 += dy;
        this.lines[i].z1 -= dz;
    }
    //столкновение с базой по контрольной точке

    this.centreX -= dx;
    this.centreY += dy;
    this.centreZ -= dz;

    let dist = Math.sqrt(this.centreX * this.centreX + this.centreY * this.centreY + this.centreZ * this.centreZ);
    if (dist < this.radius) {

        if (this.centreZ > 0) this.winOrLose = -1;
        else if (Math.sqrt(this.centreX * this.centreX + this.centreY * this.centreY) > 50)  this.winOrLose = -1;
        else this.winOrLose = 1;
    }

}


earth.getLineForScreen = function (num, heading, pitch/*, roll*/) {
    //alert(1);
    let tempX0 = this.lines[num].x0;
    let tempX1 = this.lines[num].x1;

    let tempY0 = this.lines[num].y0;
    let tempY1 = this.lines[num].y1;

    let tempZ0 = this.lines[num].z0;
    let tempZ1 = this.lines[num].z1;
    //alert(2);

    //поворот вокруг оси Х на угол крена:
    /*           
               tempY0 = tempY0*Math.cos(roll) - tempZ0*Math.sin(roll);
               tempZ0 = tempY0*Math.sin(roll) + tempZ0*Math.cos(roll);       
               
               tempY1 = tempY1*Math.cos(roll) - tempZ1*Math.sin(roll);
               tempZ1 = tempY1*Math.sin(roll) + tempZ1*Math.cos(roll);
    */


    //alert(3);

    //поворот вокруг оси Y на угол курса:
    tempX0 = tempX0 * Math.cos(heading) + tempZ0 * Math.sin(heading);
    tempZ0 = -this.lines[num].x0 * Math.sin(heading) + this.lines[num].z0 * Math.cos(heading);

    tempX1 = tempX1 * Math.cos(heading) + tempZ1 * Math.sin(heading);
    tempZ1 = -this.lines[num].x1 * Math.sin(heading) + this.lines[num].z1 * Math.cos(heading);
    //alert(4);
    //поворот вокруг оси Z на угол тангажа:
    let x0 = tempX0;
    tempX0 = tempX0 * Math.cos(pitch) - tempY0 * Math.sin(pitch);
    tempY0 = x0 * Math.sin(pitch) + tempY0 * Math.cos(pitch);

    let x1 = tempX1;
    tempX1 = tempX1 * Math.cos(pitch) - tempY1 * Math.sin(pitch);
    tempY1 = x1 * Math.sin(pitch) + tempY1 * Math.cos(pitch);
    //alert(5);
    //let turn = (heading > Math.PI*0.5 && heading < Math.PI)||(heading > Math.PI*1.5 && heading < Math.PI*2);

    if (num == 0) {
        //console.log("x="+ Math.atan(tempZ0 / tempX0));
        console.log("z=" + tempZ0);
    }



    if (tempX0 > 0 && tempX1 > 0) {
        //alert(6);
        return {

            visible: true,
            x0: Math.atan(tempZ0 / tempX0),
            y0: Math.atan(tempY0 / tempX0),
            x1: Math.atan(tempZ1 / tempX1),
            y1: Math.atan(tempY1 / tempX1),
            color: this.lines[num].color,
            dist: this.lines[num].showDist ?
                Math.sqrt(this.lines[num].x0 * this.lines[num].x0 + this.lines[num].y0 * this.lines[num].y0 + this.lines[num].z0 * this.lines[num].z0) : undefined





            /*
            x0: Math.sin(Math.atan2(this.lines[num].z0, this.lines[num].x0) - heading),
            y0: Math.sin(Math.atan(this.lines[num].y0 / this.lines[num].x0) - pitch),
            x1: Math.sin(Math.atan2(this.lines[num].z1, this.lines[num].x1) - heading),
            y1: Math.sin(Math.atan(this.lines[num].y1 / this.lines[num].x1) - pitch),
            color: this.lines[num].color,
            dist: this.lines[num].showDist ?
                Math.sqrt(this.lines[num].x0 * this.lines[num].x0 + this.lines[num].y0 * this.lines[num].y0 + this.lines[num].z0 * this.lines[num].z0) : undefined
        */
        };
    }

    else return {
        visible: false,
        dist: this.lines[num].showDist ?
            Math.sqrt(this.lines[num].x0 * this.lines[num].x0 + this.lines[num].y0 * this.lines[num].y0 + this.lines[num].z0 * this.lines[num].z0) : undefined
    };
}