/**
* The primary class to define an agent situated in a cartesian space.
*/
class Agent{
  /**
  * Instantiates an agent in a cartesian space
  * @param {Number} x  A location on x axis
  * @param {Number} y  A location on y axis
  * @param {String} id A unique identifier
  */
  constructor(x, y, id){
    /** Unique {String} identifier for this agent */
    this.id = id;
    /** A {PVector} storing current x and y */
    this.pos = globalP5.createVector(x,y);
    /** The {PVector} position previously stored at this.pos before this.pos was updated*/
    this.lastPos = globalP5.createVector(x,y);
    /** The direction this agent is pointing towards, i.e., its bearing */
    this.bearing = globalP5.map(Math.atan2(this.pos.y - 250, this.pos.x- 250),0,Math.PI*2, -Math.PI, Math.PI);
    /** A map storing pairs of {agent}agent: {boolean}interactant.*/
    this.pairs=[];
  }

  /**
  * Adds an agent to the list of interactants of this agent
  * @param {[Agent]} a [Agent to be added]
  * @param {[Boolean]} i [Whether the given agent interacts or not with this agent]
  */
  addPair(a,i){
    this.pairs.push({agent:a, interactant:i});
  }

  /**
  * Sets TRUE to all interactant fields of agents stored in this.pairs
  */
  resetInteractants(){
    for (let p of this.pairs) {
      p.interactant = true;
    }
    return this.pairs;
  }

  /**
  * Get all pairs
  * @return {[Array]} [All pairs of this agent]
  */
  getPairs(){
    return this.pairs;
  }

  /**
  * Wheter or not the given element interacts with this agent
  * @param  {[Agent]}  element [description]
  * @return {Boolean}         [description]
  */
  isInteractant(element){
    return element.interactant == true;
  }

  /**
  * Wheter or not the given element interacts with this agent AND is an isntance of Human
  * @param  {[Agent]}  element [description]
  * @return {Boolean}         [description]
  */
  isHumanInteractant(element){
    return (element.interactant == true && element.agent instanceof Human);
  }

  /**
  * Wheter or not the given element interacts with this agent AND is an isntance of Nonhuman
  * @param  {[Agent]}  element [description]
  * @return {Boolean}         [description]
  */
  isNonhumanInteractant(element){
    return (element.interactant == true && element.agent instanceof Nonhuman);
  }

  /**
  * Returns all the interactants set to TRUE in the collection of pairs
  * @return {[Array]} [description]
  */
  getInteractants(){
    return this.pairs.filter(this.isInteractant);
  }

  /**
  * Returns all the Human interactants in the collection of pairs
  * @return {[Array]} [description]
  */
  getHumanInteractants(){
    return this.pairs.filter(this.isHumanInteractant);
  }

  /**
  * Returns all the Nonhuman interactants in the collection of pairs
  * @return {[Array]} [description]
  */
  getNonhumanInteractants(){
    return this.pairs.filter(this.isNonhumanInteractant);
  }

  /**
  * Returns TRUE if the given agent is a pair of this agent
  * @param  {[Agent]} agent [description]
  * @return {[Boolean]}       [description]
  */
  pairsWith(agent){
    for (let i = 0; i < this.pairs.length; i++) {
      if (this.pairs[i].agent.id == agent.id){
        return true;
      }
    }
    return false;
  }

  /**
  Moves closer or away from the position of the other agent
  @param  dist the magnitude of the displacement
  @param  angle the direction of this movement
  */
  move(dist, angle, stepLengthFactor){
    // Get step in x
    var stepX = Math.cos(angle) * dist * stepLengthFactor;
    // Get step in y
    var stepY = Math.sin(angle) * dist * stepLengthFactor;
    // move forward in x & y
    this.pos.x += stepX;
    this.pos.y += stepY;
  }

  /**
  *Moves to the new position
  *@param  vector the vector to be added to this agent's position
  */
  move2(vector){
    this.pos.add(vector);
  }
}
