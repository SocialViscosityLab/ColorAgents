class InteractionMatrix {
  constructor(p5, world){
    this.p5 = p5;
    this.world = world;
    this.agents = world.getAgents();
    this.size = 15;
    // this.humans = world.getHumans();
    // this.nonhumans = world.getNonhumans();
  }

  plot(pos, rows, cols){
    this.labels(pos, rows, cols);
    //this.p5.stroke(0,20);
    this.p5.noFill();
    // iterate over rows
    for (var i = 0; i < this.agents.length; i++) {
      // I
      let agentI = this.agents[i];
      // y coordinate
      let yTemp = pos.y + (i * this.size) ;
      // iterate over columns
      for (var j = 0; j < this.agents.length; j++) {
        // J
        let agentJ = this.agents[j];
        // x coordinate
        let xTemp = pos.x + (j*this.size) + this.size + 10;
        // get the distance bewteen agent i and agent j
        let dist = this.markInteraction(agentI, agentJ);
        // if agents interact
        if (dist){
          let alphaMagnitude = this.p5.map(dist.spatialMag, 0, this.agents[i].proximityPixelGap, 0, 255);
          let alphaDistance = this.p5.map(dist.currentDist,0,this.agents[i].proximityPixelGap, 0, 255);
          //this.p5.stroke(0,20);
          // this color represents the ideal distance between agents
          this.p5.fill(this.agents[i].colorValues._rgb[0], this.agents[i].colorValues._rgb[1], this.agents[i].colorValues._rgb[2],alphaMagnitude);
          this.p5.fill(80,alphaMagnitude);
          // Triangle below for desired distance
          this.p5.triangle(xTemp, yTemp, xTemp, yTemp + this.size, xTemp + this.size, yTemp + this.size);
          // this color represents the current distance between agents. The saturated the farther
          this.p5.fill(this.agents[i].colorValues._rgb[0], this.agents[i].colorValues._rgb[1], this.agents[i].colorValues._rgb[2],alphaDistance);
            this.p5.fill(80,alphaDistance);
          // Triangle above for current distance
          this.p5.triangle(xTemp, yTemp, xTemp + this.size, yTemp, xTemp + this.size, yTemp + this.size);

        } else {
          this.p5.noStroke();
          this.p5.noFill();
          this.p5.rect(xTemp, yTemp, this.size, this.size);
        }
      }
    }
  }

  markInteraction(agentI, agentJ){
      // get all the interactants
    let interactants = agentI.getInteractants();
    for (var i = 0; i < interactants.length; i++) {
      // Check if the given agent is in the list of interactants
      if (interactants[i].agent.id === agentJ.id){
        // return the distances
        let index = agentI.distances.findIndex(element => {

          return (element.id == agentJ.id)});

        return agentI.distances[index];
      }
    }
  }

  labels(pos,rows,cols){
    // rows
    this.p5.fill(0,80);
    this.p5.noStroke();
    for (var i = 0; i < this.agents.length; i++) {
      if (!rows){

        this.p5.text(this.agents[i].id, pos.x , pos.y + (i*this.size)+(this.size/2)+5);

      }
    }
    // columns
    for (var i = 0; i < this.agents.length; i++) {
      if (!cols){
        this.p5.push();
        this.p5.translate(pos.x + (i*this.size)+ (this.size*2) + 7, pos.y - 5);
        this.p5.rotate(-Math.PI/2);
        this.p5.text(this.agents[i].id, 0,0);
        this.p5.pop();
      }
    }
  }
}
