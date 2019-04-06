class Agent{
  constructor(x, y, id){
    // id
    this.id = id;
    // PVector current pos
    this.pos = globalP5.createVector(x,y);
    // lastPosition
    this.lastPos = globalP5.createVector(x,y);
    // bearing
    this.bearing = globalP5.map(Math.atan2(this.pos.y - 250, this.pos.x- 250),0,Math.PI*2, -Math.PI, Math.PI);
    // The pairs in the world. Stores objects with two attributes: agent{Agent} and interactant{boolean}
    this.pairs=[];
  }

  addPair(a,i){
      this.pairs.push({agent:a, interactant:i});
  }

  resetInteractants(){
    for (let p of this.pairs) {
      p.interactant = true;
    }
    return this.pairs;
  }
  getPairs(){
    return this.pairs;
  }

  isInteractant(element){
    return element.interactant == true;
  }

  isHumanInteractant(element){
    return (element.interactant == true && element.agent instanceof Human);
  }

  isNonhumanInteractant(element){
    return (element.interactant == true && element.agent instanceof Nonhuman);
  }

  getInteractants(){
    return this.pairs.filter(this.isInteractant);
  }

  getHumanInteractants(){
    return this.pairs.filter(this.isHumanInteractant);
  }

  getNonhumanInteractants(){
    return this.pairs.filter(this.isNonhumanInteractant);
  }

  pairsWith(agent){
    for (let i = 0; i < this.pairs.length; i++) {
      if (this.pairs[i].agent.id == agent.id){
        return true;
      }
    }
    return false;
  }

/**
* Moves closer or away from the position of the other agent
@param  dist the magnitude of the displacement
@param  angle the direction of this movement
*/
  move(dist, angle){
    // Get step in x
    var stepX = Math.cos(angle) * dist * this.stepLengthFactor;
    // Get step in y
    var stepY = Math.sin(angle) * dist * this.stepLengthFactor;
    // move forward in x & y
    this.pos.x += stepX;
    this.pos.y += stepY;
  }
}
