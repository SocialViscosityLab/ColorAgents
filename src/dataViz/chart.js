class Chart{
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

  geomPoint(data, label, color){
    this.p5.stroke(color[0], color[1], color[2], 30);
    this.p5.fill(color[0], color[1], color[2], 160);
    let xCoord;
    let yCoord;
    data.forEach((value, key)=>{
      xCoord = this.xAxis.mapPosition(this.p5,key);
      yCoord = this.yAxis.mapPosition(this.p5,value);
      this.p5.ellipse(this.pos.x+xCoord, this.pos.y+yCoord,2,2);
    })
    if (label){
      this.p5.text(label, this.pos.x + xCoord + 2, this.pos.y + yCoord + 2);
    }
  }

  geomPath(data, label, color){
    this.p5.stroke(color[0], color[1], color[2]);
    this.p5.noFill();
    this.p5.beginShape();
    data.forEach((_value, _key)=>{
      let xCoord = this.xAxis.mapPosition(this.p5,_key);
      let yCoord = this.yAxis.mapPosition(this.p5,_value);
      this.p5.vertex(this.pos.x+xCoord, this.pos.y+yCoord);
    })
    this.p5.endShape();
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
      p5.stroke(150);
      p5.line(pos.x, pos.y, pos.x+this.length, pos.y);
      p5.noStroke();
      p5.fill(150);
      p5.text(this.value.toFixed(2), pos.x+this.length, pos.y + 15);
      p5.text(this.label, pos.x+this.length/2, pos.y + 15);
    } else {
      p5.stroke(150);
      p5.line(pos.x, pos.y, pos.x, pos.y-this.length);
      p5.noStroke();
      p5.fill(150);
      p5.text(this.value.toFixed(2), pos.x - 25, pos.y-this.length);
      p5.push();
      p5.translate(pos.x - 5, pos.y-this.length/2);
      p5.rotate(-p5.HALF_PI);
      p5.text(this.label, 0,0);
      p5.pop();
    }
  }
}
