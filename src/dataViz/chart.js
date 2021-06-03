class Chart {
    constructor(p5, pos, lengthX, lengthY, valX, dependentVariable, minValY, maxValY) {
        this.p5 = p5;
        this.xAxis = new Axis(true, lengthX, 0, valX, "ticks");
        this.yAxis = new Axis(false, lengthY, minValY, maxValY, dependentVariable);
        this.pos = pos;
    }

    canvas() {
        this.xAxis.plot(this.p5, this.pos);
        this.yAxis.plot(this.p5, this.pos);
    }

    geomPoint(data, label, color) {
        this.p5.stroke(color[0], color[1], color[2], 30);
        this.p5.fill(color[0], color[1], color[2], 160);
        let xCoord;
        let yCoord;
        data.forEach((value, key) => {
            xCoord = this.xAxis.mapPosition(this.p5, key);
            yCoord = this.yAxis.mapPosition(this.p5, value);
            this.p5.ellipse(this.pos.x + xCoord, this.pos.y + yCoord, 2, 2);
        })
        if (label) {
            this.p5.text(label, this.pos.x + xCoord + 2, this.pos.y + yCoord + 2);
        }
    }

    geomPath(data, label, color) {
        this.p5.stroke(color[0], color[1], color[2]);
        this.p5.noFill();
        this.p5.beginShape();
        data.forEach((_value, _key) => {
            let xCoord = this.xAxis.mapPosition(this.p5, _key);
            let yCoord = this.yAxis.mapPosition(this.p5, _value);
            this.p5.vertex(this.pos.x + xCoord, this.pos.y + yCoord);
        })
        this.p5.endShape();
    }

    geomVLine(value, color) {
        let xCoord = this.xAxis.mapPosition(this.p5, value);
        if (color) {
            this.p5.stroke(color[0], color[1], color[2]);
        } else {
            this.p5.stroke(255, 0, 0, 100);
        }
        this.p5.line(this.pos.x + xCoord, this.yAxis.pos.y, this.pos.x + xCoord, this.yAxis.pos.y - this.yAxis.length);
    }

    geomTextValueAtKey(data, key) {
        let value = data.get(key);
        let xCoord;
        let yCoord;
        if (value == undefined) {
            value = "No data";
            xCoord = this.xAxis.mapPosition(this.p5, key);
            yCoord = 0;
        } else {
            xCoord = this.xAxis.mapPosition(this.p5, key);
            yCoord = this.yAxis.mapPosition(this.p5, value);
        }
        this.p5.noStroke();
        this.p5.fill(255, 0, 0, 100);
        this.p5.textSize(10);
        this.p5.text(Number(value).toFixed(2), this.pos.x + xCoord + 3, this.pos.y + yCoord);
        this.p5.text(key, this.pos.x + xCoord, this.pos.y + 10);
    }

}

/**** CLASS AXIS *****/

class Axis {
    constructor(isHorizontal, length, minValue, maxValue, label) {
        this.isHorizontal = isHorizontal;
        this.length = length;
        this.label = label;
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.step = length / (maxValue - minValue);
        this.pos;
    }

    mapPosition(p5, val) {
        if (val) {
            let rtn;
            if (val < this.minValue) {
                this.minValue = val;
                return (this.mapPosition(p5, val));
            } else if (val > this.maxValue) {
                this.maxValue = val;
            } else {
                rtn = p5.map(val, this.minValue, this.maxValue, 0, this.length);
            }
            if (this.isHorizontal) {
                return rtn;
            } else {
                return -rtn;
            }
        } else {
            return undefined;
        }
    }

    plot(p5, pos) {
        this.pos = pos;
        if (this.isHorizontal) {
            p5.stroke(150);
            p5.line(pos.x, pos.y, pos.x + this.length, pos.y);
            p5.noStroke();
            p5.fill(150);
            if (typeof(this.maxValue) == 'number')
                p5.text(this.maxValue.toFixed(2), pos.x + this.length, pos.y + 15);
            p5.text(this.label, pos.x + this.length / 2, pos.y + 15);
        } else {
            p5.stroke(150);
            p5.line(pos.x, pos.y, pos.x, pos.y - this.length);
            p5.noStroke();
            p5.fill(150);
            p5.text(this.maxValue.toFixed(2), pos.x - 25, pos.y - this.length);
            p5.text(this.minValue.toFixed(2), pos.x - 25, pos.y);
            if (this.minValue != 0 && this.maxValue != 0) {
                p5.fill(200);
                p5.stroke(230);
                let zeroPos = p5.map(0, this.minValue, this.maxValue, pos.y - this.length, pos.y);
                p5.text('0', pos.x - 25, zeroPos);
                p5.line(pos.x, zeroPos, pos.x + this.length, zeroPos);
            }
            p5.push();
            p5.translate(pos.x - 5, pos.y - this.length / 2);
            p5.rotate(-p5.HALF_PI);
            p5.fill(150);
            p5.text(this.label, 0, 0);
            p5.pop();
        }
    }
}