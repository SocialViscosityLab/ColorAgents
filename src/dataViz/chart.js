/**
 * Class for creating a chart with x and y axes, plotting points, paths, vertical lines,
 * and displaying text values at specific keys.
 */

export class Chart {
  /**
   *
   * @param {p5} p5 the p5 renderer
   * @param {Object} pos the position of the chart
   * @param {number} lengthX the length of the x-axis
   * @param {number} lengthY the length of the y-axis
   * @param {Array} valX the values for the x-axis
   * @param {string} dependentVariable the dependent variable for the y-axis
   * @param {number} minValY the minimum value for the y-axis
   * @param {number} maxValY the maximum value for the y-axis
   */
  constructor(p5, pos, lengthX, lengthY, valX, dependentVariable, minValY, maxValY) {
    this.p5 = p5;
    this.xAxis = new Axis(true, lengthX, 0, valX, "ticks");
    this.yAxis = new Axis(false, lengthY, minValY, maxValY, dependentVariable);
    this.pos = pos;
  }

  /**
   * Plots the chart on the canvas.
   */
  canvas() {
    this.xAxis.plot(this.p5, this.pos);
    this.yAxis.plot(this.p5, this.pos);
  }

  /**
   * Inspired in ggplot2, this function plots points on the chart based on the provided data, label, and color.
   * @param {*} data
   * @param {*} label
   * @param {*} color
   */
  geomPoint(data, label, color) {
    this.p5.stroke(color[0], color[1], color[2], 30);
    this.p5.fill(color[0], color[1], color[2], 160);
    let xCoord;
    let yCoord;
    data.forEach((value, key) => {
      xCoord = this.xAxis.mapPosition(this.p5, key);
      yCoord = this.yAxis.mapPosition(this.p5, value);
      this.p5.ellipse(this.pos.x + xCoord, this.pos.y + yCoord, 2, 2);
    });
    if (label) {
      this.p5.text(label, this.pos.x + xCoord + 2, this.pos.y + yCoord + 2);
    }
  }

  /**
   * Inspired in ggplot2, this function plots a path on the chart based on the provided data, label, and color.
   * @param {*} data 
   * @param {*} label 
   * @param {*} color 
   */
  geomPath(data, label, color) {
    this.p5.stroke(color[0], color[1], color[2]);
    this.p5.noFill();
    this.p5.beginShape();
    data.forEach((_value, _key) => {
      let xCoord = this.xAxis.mapPosition(this.p5, _key);
      let yCoord = this.yAxis.mapPosition(this.p5, _value);
      this.p5.vertex(this.pos.x + xCoord, this.pos.y + yCoord);
    });
    this.p5.endShape();
  }

  /**
   * Inspired in ggplot2, this function plots a vertical line on the chart at the specified value with the given color.
   * @param {number} value the x-coordinate where the line should be plotted
   * @param {Array} color the color of the line
   */
  geomVLine(value, color) {
    let xCoord = this.xAxis.mapPosition(this.p5, value);
    if (color) {
      this.p5.stroke(color[0], color[1], color[2]);
    } else {
      this.p5.stroke(255, 0, 0, 100);
    }
    this.p5.line(this.pos.x + xCoord, this.yAxis.pos.y, this.pos.x + xCoord, this.yAxis.pos.y - this.yAxis.length);
  }

  /**
   * Inspired in ggplot2, this function plots the value of a specific key on the chart.
   * @param {*} data the data to plot
   * @param {string} key the key for which to plot the value
   */
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

/**
 * Class representing an axis in a chart, either horizontal or vertical, with methods to map values 
 * to positions and plot the axis on the canvas.
 */
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

  /**
   * Maps a value to a position on the axis.
   * @param {p5} p5 
   * @param {number} val 
   * @returns 
   */
  mapPosition(p5, val) {
    if (val) {
      let rtn;
      if (val < this.minValue) {
        this.minValue = val;
        return this.mapPosition(p5, val);
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

  /**
   * Plots the axis on the canvas.
   * @param {p5} p5 
   * @param {Vector} pos 
   */
  plot(p5, pos) {
    this.pos = pos;
    if (this.isHorizontal) {
      p5.stroke(150);
      p5.line(pos.x, pos.y, pos.x + this.length, pos.y);
      p5.noStroke();
      p5.fill(150);
      if (typeof this.maxValue == "number") p5.text(this.maxValue.toFixed(2), pos.x + this.length, pos.y + 15);
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
        p5.text("0", pos.x - 25, zeroPos);
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
