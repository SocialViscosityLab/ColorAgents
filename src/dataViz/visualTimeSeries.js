/**
* TBD
*/
class VisualTimeSeries {
  /**
  * Constructor
  * @param {P5} p5    An instance of P5.js
  * @param {World} world An instance of the world
  * @param {Map} metrics The metrics of interactions
  */
  constructor(p5, world, metrics){
    // The p5.js instance
    this.p5 = p5;
    // the world instance
    this.world = world;
    // the metrics
    this.metrics = metrics;
  }

  plot2(pos, matrix){
    this.lattice(pos);

    this.p5.noFill();
    // iterate over rows
    for (var i = 0; i < matrix.length; i++) {

      let agentI = matrix[i].id;
      // y coordinate
      let yTemp = pos.y + this.lattice2.getYFor(agentI) ;
      // iterate over columns
      for (var j = 0; j < matrix[i].interactions.length; j++) {

        let interaction = matrix[i].interactions[j];
        let agentJ = interaction.interactant;
        // x coordinate
        let xTemp = pos.x + this.lattice2.getXFor(agentJ) + this.size + 10;

        let alphaMagnitude = this.p5.map(interaction.spatialMag, 0, 100, 0, 255);
        let alphaDistance = this.p5.map(interaction.currentDist,0, 100, 0, 255);

        // this color represents the ideal distance between agents
        //this.p5.fill(agentI.colorValues._rgb[0], agentI.colorValues._rgb[1], agentI.colorValues._rgb[2],alphaMagnitude);
        this.p5.fill(80,alphaMagnitude);
        // Triangle below for desired distance
        this.p5.triangle(xTemp, yTemp, xTemp, yTemp + this.size, xTemp + this.size, yTemp + this.size);
        // this color represents the current distance between agents. The saturated the farther
        //this.p5.fill(agentI.colorValues._rgb[0], agentI.colorValues._rgb[1], agentI.colorValues._rgb[2],alphaDistance);
        this.p5.fill(80,alphaDistance);
        // Triangle above for current distance
        this.p5.triangle(xTemp, yTemp, xTemp + this.size, yTemp, xTemp + this.size, yTemp + this.size);
      }
    }
  }
}
