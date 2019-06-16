
class Lattice{
  constructor(rowLables, colLabels, cellSize){
    this.xLables = this.setColCoords(colLabels, cellSize);
    this.yLables = this.setRowCoords(rowLables, cellSize);
  }

  setColCoords(labels, cellSize){
    let xCoords = new Map();
    for (var i = 0; i < labels.length; i++) {
      xCoords.set(labels[i], i*cellSize);
    }
    return xCoords;
  }

  setRowCoords(labels, cellSize){
    let yCoords = new Map();
    for (var i = 0; i < labels.length; i++) {
      yCoords.set(labels[i], i*cellSize);
    }
    return yCoords;
  }

  getXFor(label){
    return this.xLables.get(label);
  }

  getYFor(label){
    return this.yLables.get(label);
  }
}
