
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
    console.log("The New agent is: ", index);

    /** This can be used to produce the color for theothers, but can't be perceived for the agent */
    this.colorValues = theColor;

    /** This agents' spacial Mental Model. This represents the unique way this agent perceives distances in the world*/
    this.sMentalModel = new SpatialMentalModel(shortest, farthest);
    this.cMentalModel = [];
    this.currentModelInx = -1;
    this.sensibility = DOM.lists.sensibility.value;

    DOM.lists.sensibility.addEventListener('change', () => {
      this.sensibility = DOM.lists.sensibility.value;    
    });

    /** Visual perception angle in radians*/
    this.visualPerceptionAngle = Math.PI * 3 / 4;

    // The lowest distance this agent starts perceiving something as far away. This is used in the alpha mapping
    // function of the visualization matrix
    this.farthest = farthest;

    // The amplification factor of interaction radius scope
    this.radiusFactor = 10;


    // ----> Methaparamethers for learning

    /** The initial learning rate */
    this.a = 1;
    /** Decreasing factor for the learning rate */
    this.c = 20;
    /** The optimistic value use for not explore actions */
    this.rPlus = 1;
    /** The minimum count of explorations for each model */
    this.NE = 1;
    /** Keeps a record for the interactants list */
    this.prevState = '';
    /** Keeps record of the expected result, and current the result */
    this.expectedResult = { };
    this.interactantsRegister = { }
    /** Matrix with the quality of each decision for a specific state */
    this.qTable;
    /** Matrix with the number of times each decision was made for a specific state */
    this.nTable;
    /** Posible actions to take, in this context, the posible color models for the agent */
    this.models;
    /** Swith if the agent is learning */
    this.learning = true;
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
            this.move(nextPos.mag(),nextPos.heading(), this.stepLengthFactor);
          } else {
            console.log("not moving anymore")
            for(let r in this.expectedResult){
              this.expectedResult[r]=0;
            }
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
   */
  train(interactants){

    let [state, smplInteractants] = this.getAbstractState(interactants);

    if(state != this.prevState){
      console.log("updating Tables");
      if(this.prevState == ''){
        this.qTable = this.createQTable(interactants);
      }else{
        this.qTable = this.createQTable(interactants,this.qTable);
      }

      this.nTable = new Array(this.qTable.length).fill(0);
      //The previous state register is updated
      this.prevState = state
    }

    //If there is already a expected result from the agent
    if(this.cMentalModel.length > 0){
  
      let result = this.getResult(smplInteractants);
      let reward = this.calculateReward(result);
      
      if(reward != 0){
      //Updates the N-table if there is a reward (positive or negative)
      this.nTable[this.currentModelInx] = this.nTable[this.currentModelInx] + 1;
      }

      // Updates the Q-table 
      let alpha = this.a * (this.c / (this.c + this.nTable[this.currentModelInx]));
      this.qTable[this.currentModelInx] = this.qTable[this.currentModelInx] + (alpha * reward);
    }
    
    // Looks for the models with higher quality and set the current color modet to it
    let modelCandidates = [];
    for (let i = 0; i < this.nTable.length; i++) {
      if(this.nTable[i] < this.NE){
        modelCandidates.push(this.rPlus);
      }else{
        modelCandidates.push(this.qTable[i]);
      }
    }

    //Looks for the candidate with the higher value
    
    this.currentModelInx = modelCandidates.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1]; //ArgMax form
    this.cMentalModel = this.models[this.currentModelInx].split(" ");

    //Register the current interactants
    this.interactantsRegister = smplInteractants;
    
    console.log("N-Table")
    console.log(this.nTable)
    console.log("Q-Table")
    console.log(this.qTable)
  }

/**
   * Takes a list of interactants and translated to an order list of their ids
   * condenced in an simple string
   * @param {Object} interactants
   * @return {String} Abstraction of the state
   */
  getAbstractState(interactants){
    let state = interactants.map(i => i.agent.id);
    let smplInteractants = { }
    state.sort();

    state.forEach(a => {
      let tempInt = interactants.find(i => {
        let tempId = String(i.agent.id)
        return tempId == a;
      });
      smplInteractants[a] = {x:tempInt.agent.pos.x,y:tempInt.agent.pos.y}
    });
    console.log(smplInteractants)

    return [state.join(" "), smplInteractants];
  }

/**
   * reinterpret the agents' coordinates to identify if the interactants got farther
   * or closer to the agent.
   * @param {Object} interactants
   * @return {Object} Result, list of the "action" took for each agent respect this agent
   */
  getResult(interactants){
    let result = { }
    for(let ir in this.interactantsRegister){
      let currentDist = NaN; 
      let prevDist = Utils.dist(this.pos.x, this.pos.y, this.interactantsRegister[ir].x, this.interactantsRegister[ir].y);

      if(ir in interactants){
        //TODO: consider ignore if distance is larger than the farthest value
        currentDist = Utils.dist(this.pos.x, this.pos.y, interactants[ir].x, interactants[ir].y); 
      }

      // If I can't find the interactant in my new list, I assume is now out of my range
      if(currentDist == NaN){
        //result[ir.agent.id] = -1;
        result[ir] = -1;
      }else{
        //result[ir.agent.id] = Math.sign(prevDist-currentDist);
        result[ir] = Math.sign(prevDist-currentDist);
      }
    }
    return result;
  }

  /**
   * Create a table that contains the abstraction of all whte posible state of the world.
   * The state is based on the interactans of the agent, then, the table will have a dimension for each possible interactant
   * With two options, the agent is interacting (1) or not (0)
   * @return {list} List with the quality values spaces
   */
  createQTable(interactants, qLearned){
    let models = []
    let agentArray = [this.id]
    this.getPairs().forEach(element => {
      let pair = element.agent.id;
      if (interactants.includes(element)){
        agentArray.push(pair)
      }else{
        if(pair in (this.prevState.split(" "))){
          // TODO: Test is this is working to keep colors that were interactants before in the possible models.
          agentArray.push(pair)
        }else{
          //This allows the agent to calculate the distances between the interactants without including all agents.
          agentArray.push("blanc");
        }
      }
    });

    let cmbs = Combinatorics.permutation(agentArray).toArray();
    cmbs = new Set(cmbs.map(p => p.join(" ")));

    cmbs.forEach(cmb => {
      let invModel = cmb.split(" ").reverse().join(" ");
      if(!models.includes(invModel)){
        models.push(cmb);
      }
    });
    /**
     * If there are previous models with low quality (q < 0).
     * The low quality models are filered out from
     * the new list of models, taking into account the previously 
     * evaluated colors positions only. 
    */
   let filteredModels = []; 
    if(qLearned){
      // Filter out the models with negative quality
      for (let i = 0; i < qLearned.length; i++) {
        if(qLearned[i] < 0){         
          //Identify the low quality model
          let lqModel = this.models[i].split(" ");
          models.forEach(m => {
            let disc = true;
            let tempModel = m.split(" ");
            for (let j = 0; j < tempModel.length; j++) {
              if(lqModel[j] != "blanc"){
                if(tempModel[j] != lqModel[j]){
                  disc = false;
                }
              } 
            }
            if(disc && !filteredModels.includes(m)){
              filteredModels.push(m);
            }
          });
        }        
      }
      
      //Here the previously explored low quality models are excluded
      // but the previous quality values are ignored. 
      // TODO: The agent could use the quality values 
      // to start the new q-tables. 
      console.log("Filtered low quality models: "+filteredModels.length);
    }
    //Updates the possible models to consider
    this.models = models.filter((m)=> !filteredModels.includes(m));

    // Pass an array of values to create a vector with the array dimensions.
    return new Array(this.models.length).fill(0);
  }


   /**
   * Calculates a reward based on two options
   * @param {Array} interactants the collection of interactans of this agent.
   * @return {Array} the representation of the state
   */
  calculateReward(result){
    let reward = 0;
    console.log(this.expectedResult)
    console.log(result)
    if(this.expectedResult != { }){
      for (let er in this.expectedResult) {

        if(!isNaN(this.expectedResult[er])){
          if(this.expectedResult[er] === result[er]){
            reward += 0.01;
          }else{
            reward -= 0.1;
          }          
        }
      }
      return reward;
    }
  }


  /**
   * Returns a value between 0 and 1, where 1 is the farthest perceived distance
   * indexA and indexB must be between 0 and colorPalette.length
   * @param {Array} color simple order list of the colors 
   * @return {Number} The value between 0 and 1, where 1 is the farthest perceived distance
   */
  getPerceivedColorDistance(targetColor) {
    let indexA = this.cMentalModel.indexOf(this.id)
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
  calculateStep(interactants) {

    let vector;

    for (let i of interactants) {
        i = i.agent;

        // Calculate vector magnitude

        // Use the mental model to calculate the perceived distance to each interactant
        let perceivedColorDistance = this.getPerceivedColorDistance(i.id);

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
        
        /** if the agents is farther than the farthest value, 
         * the expectations about this agent is not considered in the evaluation of the model
         */ 
        if(currentDist > this.farthest){
          this.expectedResult[i.id] = NaN;
        }else{
        // This will indicate if the agents expect that the specific interactant get closer or farther for it
          this.expectedResult[i.id] = Math.sign(deltaDist)
        }

        // Update distances. This could be done somewhere else, but here it saves the cost of iterating over all the interactants
        this.updateDistanceMap(i.id, spatialMag, currentDist);


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