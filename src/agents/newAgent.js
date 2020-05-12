/**
 * Creates instances of nonhuman agents. Extends Agent
 * @extends Agent
 */
class NewHuman extends Agent{
  /**
   * Constructor
   * @param {Number} x        the x coordinate on canvas
   * @param {Number} y        the y coordinate on canvas
   * @param {String} index    the color's name of this agent
   * @param {String} colorPalette the color palette used by this agent
   * @param {[type]} theColor the color values of this agent
   * @param {Number} shortest scalar used by spatial mental model to determine what on canvas how near an agent wants to be from the most similar agent
   * @param {Number} farthest scalar used by spatial mental model to determine what on canvas how far away an agent was to be from the most dissimilar agent

   */
  constructor (x, y, index, theColor, shortest, farthest){
    super(x, y, index);
    /** This can be used to produce the color for theothers, but can't be perceived for the agent */
    this.colorValues = theColor 

    /** This agents' spacial Mental Model. This represents the unique way this agent perceives distances in the world*/
    this.sMentalModel = new SpatialMentalModel(shortest, farthest);
    this.cMentalModel = [];

    /** Visual perception angle in radians*/
    this.visualPerceptionAngle = Math.PI * 3 / 4;

    // The lowest distance this agent starts perceiving something as far away. This is used in the alpha mapping
    // function of the visualization matrix
    this.farthest = farthest;

    // The amplification factor of interaction radius scope
    this.radiusFactor = 10;


    // ----> Variables for learning

    /** The initial learning rate */
    this.alpha = 1;
    /** Decreasing factor for the learning rate */
    this.c = 20;
    /** The optimistic value use for not explore actions */
    this.rPlus = 1;
    /** Keeps a record for the interactants positions before the agent's action */
    this.previousWorldState = [];
    /** Keeps record for previous tuple of [state, action] */
    this.previousDecision = [];
    /** Matrix with the quality of each decision for a specific state */
    this.qTable;
    /** Matrix with the number of times each decision was made for a specific state */
    this.nTable;
  }


  /**
  * Calls one interaction with other agents stored in its own collection of pairs.
  * It is usually used in recursive structures. In this case, this function follows these
  * steps: 
  1) Record agent's current position,
  2) Store agent's last position before moving, 
  3) Filter pairs with whom to interact according to user settings,
  4) If there is any interactant
  ---> Here the learning is activated
  4.1) Estimate the magnitude of next step using this.calculateStep(), 
  4.2) Verfiy if the change is worth to execute the movement. Threshold in user settings,
  4.3 Set the new bearing
  4.4) move or set done status to true.
  5) If no interactants
  5.1) Set done status to true.
  */
interact() {

    // Store my current position
    this.locations.push({ x: this.pos.x, y: this.pos.y });

    // Store the last position before moving
    this.lastPos.set(this.pos);

    // get the interactants
    let interactants = this.retrieveInteractants();

    // Estimate the magnitude and direction of next step with all the current interactants
    // WARNING: This function internally updates spatial distances.
    // See function definition below
    if (interactants.length > 0) {

        //HERE IS DEFINED WHAT MODEL IS USED TO ACT      
        this.train(interactants);

        let nextPos = this.calculateStep(interactants);

        // Get change magnitude threshold using user settings 
        let magnitudeThreshold = DOM.sliders.tolerance.value * (this.sMentalModel.farthest - this.sMentalModel.shortest);
        magnitudeThreshold += this.sMentalModel.shortest;

        // Verfiy if the change is worth to execute the movement
        if (nextPos.mag() > Number(magnitudeThreshold)) {

            this.bearing = nextPos.heading();

            this.iAmDone = false;
            // Move
            this.move2(nextPos.normalize());
        } else {
            this.iAmDone = true;
        }
    } else {
        this.iAmDone = true;
    }
}


  // ------------------------> Beginning of learning methods
  
  /**
   * Create an abstraction of the current state of the world based on the interactans of the agent
   * @param {Array} interactants the collection of interactans of this agent.
   * @return {Array} the representation of the state
   */
  train(interactants){
    let state = representAbstractState(interactants);
    let model = []; //the active action

    /**
    1) the reward is calculated for this state
    2) Alpha is updated: this.alpha = this.alpha (this.c/this.c + this.nTable[this.previousDecision])   
    3) the Q-table is updated: this.qTable[this.previousDecision] = this.qTable[this.previousDecision] + alpha * (reward + (gamma * argmax(this.qTable[state])) - this.qTable[this.previousDecision])
    4) the N-table is updated
    * For each posible action
    5) Check if the action has been explored the minimum number of times before in the current state
    5.1) If it hasn't, the action has a temporal value equals to the optimistics rPlus
    5.2) If it has the action takes the q-value for the matrix
    6) The action with the higher calue is chosen as the current model
    7) The previous decision is set to the current state and the chosen action
    */
  }


  /**
   * Create an abstraction of the current state of the world based on the interactans of the agent
   * @param {Array} interactants the collection of interactans of this agent.
   * @return {Array} the representation of the state
   */
  representAbstractState(interactants){
    let state = {}
    /**
      * Simplification of the world state
      */
    return state
  }


   /**
   * Calculates a reward based on two options
   * @param {Array} interactants the collection of interactans of this agent.
   * @return {Array} the representation of the state
   */
  calculateReward(interactants){
    let lastModel = this.previousDecision[1]
    let reward = 0;
    /**
      * How will be the reward be calculated?
      * Should it be positive is the world behave
      * as it was expected by the action (color model) used?
      * Evaluates the model in terms of the resultant behavior
      */

    return reward
  } 


  /**
   * Returns a value between 0 and 1, where 1 is the farthest perceived distance
   * indexA and indexB must be between 0 and colorPalette.length
   * @param {Array} color simple order list of the colors 
   * @return {Number} The value between 0 and 1, where 1 is the farthest perceived distance
   */
  getPerceivedColorDistance(targetColor) {
    let indexA = this.cMentalModel.indexOf(this.index)
    let indexB = this.cMentalModel.indexOf(targetColor);

    if (indexA < this.cMentalModel.length && indexB < this.cMentalModel.length) {
        let delta = Math.abs(indexA - indexB);
        switch (this.sensibility) {
            case 'linear':
                return delta / (this.cMentalModel.length - 1);
                break;
            case 'chordal':
                let subAngle = Math.PI * 2 / this.cMentalModel.length;
                let totalAngle = subAngle * delta;
                if (totalAngle > Math.PI) {
                    totalAngle = Math.PI * 2 - totalAngle;
                }
                let distance = totalAngle / Math.PI;
                return distance;
                break;
            case 'exponential':
                // This function is y = a^x where 0 < a < 1. The closer to 0 the tightest
                // the graph elbow. 0.97 is a good number. This reseambles the exponential
                // model of human perception defined by Stevens (1975) in Psychophysics:
                // introduction to its perceptual, neural, and social prospects. Wiley

                return 1 - Math.pow(0.97, delta);
                break;
        }
    } else {
        console.log('index value exceeds color array length');
    }
  }
  
  // ------------------------> End of Learning methods










//-------------------------> Common methods

    /**
   * Estimate direction and magnitude of a step by adding the vectors towards each interactant
   * @param {Array} interactants the collection of interactans of this agent.
   * @return {p5.Vector} the vector
   */
  calculateStep(interactants, colorMentalModel) {

    let vector;

    for (let i of interactants) {
        i = i.agent;

        // Calculate vector magnitude

        // Use the mental model to calculate the perceived distance to each interactant
        let perceivedColorDistance = this.getPerceivedColorDistance(i.index);

        /*
        There are spatial distances between this agent's location and the interactants'
        locations. Such distances may not correspond to this agent's perceived color
        distance when converted into spatial distances. The result of mapping the
        perceived color distance into a spatial distance is the spatial magnitude.
        If the difference between the spatial magnitude and the spatial distance is
        negative, this agent should get closer to the other agent, and viceversa.

        This means that this agent should have a mechanism to 'transduce' perceived
        color distance into the spatial distances. That is why we need a Spatial Mental
        Model.
        */
        let spatialMag = this.sMentalModel.mapMagnitude(perceivedColorDistance);

        //Calculate the current spatial distance
        let currentDist = Utils.euclideanDist(this, i);

        //Calculate the difference between the spatialMagnitude and the actual spatial distance
        let deltaDist = currentDist - spatialMag;

        // Update distances. This could be done somewhere else, but here it saves the cost of iterating over all the interactants
        // TODO: Ask where is this happening
        //this.updateDistanceMap(i.id, spatialMag, currentDist);

        // for the first interactant
        if (!vector) {
            // Calculate the angle between this and the pair agent
            let tmp = Math.atan2(i.pos.y - this.pos.y, i.pos.x - this.pos.x);
            vector = new mainP5.createVector(Math.cos(tmp) * deltaDist, Math.sin(tmp) * deltaDist);
        } else {
            let tmp = Math.atan2(i.pos.y - this.pos.y, i.pos.x - this.pos.x);
            let tmpV = new mainP5.createVector(Math.cos(tmp) * deltaDist, Math.sin(tmp) * deltaDist)
            vector.add(tmpV);
        }
    }
    if (vector == undefined) {
        return new mainP5.createVector(0, 0);
    } else {
        return vector;
    }
}


  /**
   * Retrieves a filtered subset of agents from the total set of pairs. By default it retrieves all of them
   *  @param {Array} agents The list of agents with whom this agent will interact. Agents in this list will be matched with
   *  this agent's list of pairs and set their {boolean} interactant parameter to TRUE.
   *  @return {Array} The list of "TRUE" interactants
   */
  retrieveInteractants(otherAgents) {
    let agents;
    if (!otherAgents) {
        agents = this.getPairs();
    } else {
        agents = otherAgents;
    }

    // read the user choice
    let val = DOM.sliders.range;
    let interactants;
    switch (DOM.lists.rule.value) {
        case 'nClosest':
            DOM.labels.sliderValue.innerHTML = val.value;
            interactants = Utils.chooseNClosest(this, Number(val.value), agents);
            break;
        case 'radius':
            DOM.labels.sliderValue.innerHTML = val.value * this.radiusFactor;
            interactants = Utils.chooseByRadius(this, Number(val.value) * this.radiusFactor, agents);
            break;
        case 'byField':
            DOM.labels.sliderValue.innerHTML = val.value * this.radiusFactor * 2;
            interactants = Utils.chooseByField(this, Number(val.value) * this.radiusFactor * 2, agents);
            break;
        case 'all':
            interactants = this.resetInteractants();
            break;
    }
    return interactants.filter(this.isInteractant);
  }
}
