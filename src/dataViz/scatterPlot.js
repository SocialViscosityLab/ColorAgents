class ScatterPlot{
  constructor(p5, pos, lengthX, lengthY, valX, valY){
    this.p5 = p5;
    this.xAxis = new Axis(true, lengthX, valX, "ticks");
    this.yAxis = new Axis(false, lengthY, valY, "viscosity");
    this.pos =pos;
  }

  canvas(){
    this.xAxis.plot(this.p5,this.pos);
    this.yAxis.plot(this.p5,this.pos);
  }

  plot(x, y, label){
    let xCoord = this.xAxis.mapPosition(this.p5,x);
    let yCoord = this.yAxis.mapPosition(this.p5,y);
    this.p5.ellipse(this.pos.x+xCoord, this.pos.y+yCoord,2,2);
    if (label){
      this.p5.text(label, this.pos.x+xCoord + 2, this.pos.y+yCoord + 2);
    }
  }
}

/**** CLASS AXIS *****/

class Axis{
  constructor(isHorizontal, length, value, label){
    this.isHorizontal = isHorizontal;
    this.length = length;
    this.label = label;
    this.value = value;
    this.step = length/value;
  }

  mapPosition(p5,val){
    if (val){
    let rtn;
    if(val <= this.value){
      rtn = p5.map(val, 0, this.value, 0, this.length);
    } else {
      this.value = val;
      return (this.mapPosition(p5,val));
    }

    if(this.isHorizontal){
      return rtn;
    } else {
      return -rtn;
    }
  } else {
    return undefined;
  }
  }

  plot(p5,pos){
    if(this.isHorizontal){
      p5.line(pos.x, pos.y, pos.x+this.length, pos.y);
      p5.text(this.value, pos.x+this.length, pos.y);
      p5.text(this.label, pos.x+this.length/2, pos.y + 15);
    } else {
      p5.line(pos.x, pos.y, pos.x, pos.y-this.length);
      p5.text(this.value, pos.x, pos.y-this.length);
      p5.push();
      p5.translate(pos.x -5, pos.y-this.length/2);
      p5.rotate(-p5.HALF_PI);
      p5.text(this.label, 0,0);
      p5.pop();
    }
  }
}
