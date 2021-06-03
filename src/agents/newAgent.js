/**
 * Creates instances of nonhuman agents. Extends Agent
 * @extends Agent
 */
class NewHuman extends Agent {
    /**
     * Constructor
     * @param {Number} x        the x coordinate on canvas
     * @param {Number} y        the y coordinate on canvas
     * @param {String} index    the color's name of this agent
     * @param {[type]} theColor the color values of this agent
     * @param {Number} shortest scalar used by spatial mental model to determine what on canvas how near an agent wants to be from the most similar agent
     * @param {Number} farthest scalar used by spatial mental model to determine what on canvas how far away an agent was to be from the most dissimilar agent

     */
    constructor(x, y, index, theColor, shortest, farthest, cModelPermutations) {
        super(x, y, index);

        /** This can be used to produce the color for theothers, but can't be perceived for the agent */
        this.colorValues = theColor;

        /** This agents' spacial Mental Model. This represents the unique way this agent perceives distances in the world*/
        this.sMentalModel = new SpatialMentalModel(shortest, farthest);
        /** List of possible permutations for a color mentalmodel in the agent's context (including all the agents) */
        this.cModelPermutations = cModelPermutations;
        /** List of possible permutations for a color mental model in the agent's tick (include only the current interactants) */
        this.models;
        /** Features of the models based on the mental distance between the learning agent an the others */
        this.pdModels = {};

        /** Stores the active color mental model*/
        this.cMentalModel = [];
        /** Index of the active color mental model in the array of possible models*/
        this.currentModelInx = -1;

        /** Defines how agents perceive distances*/
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


        // ----> Metaparameters for learning

        /** The initial learning rate */
        this.a = DOM.sliders.rate.value;
        /** Decreasing factor for the learning rate */
        this.c = DOM.sliders.decreasing.value;
        /** The optimistic value to asign to non-explored actions */
        this.rPlus = 1;
        /** The minimum count of explorations for each model before the agent change to a greedy stategy*/
        this.NE = DOM.sliders.exploration.value;


        // ----> Records related to the learning process

        /** Keeps a record for the interactants list */
        this.prevState = '';
        /** Keeps record of the expected result, and current the result */
        this.expectedResult = {};
        this.interactantsRegister = {}
            /** List of qualities for each model */
        this.qTable;
        /** Matrix with the number of times each model has been explored */
        this.nTable;
        /** Register of the selected models and their ego-quality values */
        this.selectedModels = [];
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

        if (interactants.length > 0) {

            //After each training, the agent select a color mental model to use for its actions
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
                this.move(nextPos.mag(), nextPos.heading(), this.stepLengthFactor);
            } else {
                for (let r in this.expectedResult) {
                    this.expectedResult[r] = 0;
                }
                this.iAmDone = true;
            }
        } else {
            this.iAmDone = true;
        }
    }


    // -----------------> Beginning of learning methods

    /**
     * Create or updates the Q table to select the best candidate model to use
     * @param {Array} interactants the collection of interactans of this agent.
     */
    train(interactants) {
        //Initialize the candidate models and the rewards as empty arrays
        let modelCandidates = [];
        let rewards = [];

        // Generate an abstraction of the state and the interactants by their ids and positions
        let [state, smplInteractants] = this.getAbstractState(interactants);

        // Confirms if the interactant list changed to generate a new Tables with the new interactantas
        if (state != this.prevState) {
            if (this.prevState == '') {
                this.qTable = this.createQTable(smplInteractants, false);
            } else {
                // If it is not the first evaluated state, the quality values in the old state are translated to the new q-table
                this.qTable = this.createQTable(smplInteractants, true);
            }
            this.nTable = new Array(this.qTable.length).fill(0);
        }

        //If there is already a expected result from the agent
        if (this.cMentalModel.length > 0 && state == this.prevState) {
            let result = this.getResult(smplInteractants);
            //Calculate the reward based on the diference from the expectation to the actual result
            rewards = this.calculateInferedReward(result);
        }

        for (let m = 0; m < this.models.length; m++) {
            //The q-table is updated With the rewards
            if (rewards.length > 0) {
                let reward = rewards[m];
                if (reward != 0) {
                    this.nTable[m] = this.nTable[m] + 1;
                    //The q-table is updated
                    let alpha = this.a * (this.c / (this.c + this.nTable[m]));
                    this.qTable[m] = this.qTable[m] + (alpha * reward);
                }
            }
            //Define the candidates values based on exploration vs explotation
            if (this.nTable[m] < this.NE) {
                modelCandidates.push(this.rPlus);
            } else {
                modelCandidates.push(this.qTable[m]);
            }
        }

        //Updates the registers
        this.prevState = state
        this.interactantsRegister = smplInteractants;

        //Chose the candidate with the higher value as the current model
        this.currentModelInx = modelCandidates.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1]; //ArgMax form
        this.cMentalModel = this.models[this.currentModelInx].split(" ");
        // console.log(this.qTable[this.currentModelInx])
        this.selectedModels.push({ model: this.models[this.currentModelInx], fModel: this.pdModels[this.models[this.currentModelInx]], qValue: this.qTable[this.currentModelInx] })

        //  console.log("N-Table")
        //  console.log(this.nTable)
        //  console.log("Q-Table")
        //  console.log(this.qTable)
    }


    /**
     * Takes a list of interactants and translated to an order list of their ids
     * condenced in an simple string
     * @param {Object} interactants
     * @return {String, object} String with interactants names, and interactants names with their current positions
     */
    getAbstractState(interactants) {
        let state = interactants.map(i => i.agent.id);
        let smplInteractants = {}
        state.sort();

        state.forEach(a => {
            let tempInt = interactants.find(i => {
                let tempId = String(i.agent.id)
                return tempId == a;
            });
            smplInteractants[a] = { x: tempInt.agent.pos.x, y: tempInt.agent.pos.y }
        });
        return [state.join(" "), smplInteractants];
    }


    /**
     * reinterpret the agents' coordinates to identify if the interactants got farther
     * or closer to the agent.
     * @param {Object} interactants
     * @return {Object} Result, list of the "action" took for each agent respect this agent
     */
    getResult(interactants) {
        let result = {}
        for (let ir in this.interactantsRegister) {
            let currentDist = NaN;
            let prevDist = Utils.dist(this.pos.x, this.pos.y, this.interactantsRegister[ir].x, this.interactantsRegister[ir].y);

            if (ir in interactants) {
                currentDist = Utils.dist(this.pos.x, this.pos.y, interactants[ir].x, interactants[ir].y);
            }

            // If I can't find the interactant in my new list, It assumes it is now out of agents' range
            if (currentDist == NaN) {
                result[ir] = -1;
            } else {
                result[ir] = Math.sign(prevDist - currentDist);
            }
        }
        return result;
    }


    /**
     * List each possible model tha the agente will consider and
     * Creates a list that will contain a quality value for each of the possible models.
     * @return {list} List with the quality values spaces
     */
    createQTable(sInteractants, hasLearned) {
        let models = [];
        let pdModels = {}

        this.cModelPermutations.forEach(permu => {
            let tempModel = [];
            permu.split(" ").forEach(c => {
                if (c in sInteractants || c == this.id) {
                    tempModel.push(c)
                } else {
                    tempModel.push("blanc");
                }
            });
            let tempModelS = tempModel.join(" ");
            if (!models.includes(tempModelS)) {
                models.push(tempModelS);
                pdModels[tempModelS] = this.getPerceivedColorDistanceFeatures(tempModel);
            }
        });

        let qualityList = new Array(models.length).fill(0);

        // If the agents has learned about models before
        if (hasLearned) {
            // The aggent takes the q-values from the previous explored models
            // And set the new models with similar characteristics that value
            for (let i = 0; i < models.length; i++) {
                let m = models[i];
                let nModel = pdModels[m];
                for (let j = 0; j < this.models.length; j++) {
                    let om = this.models[j];
                    let oModel = this.pdModels[om];
                    let equivalent = true;

                    for (let oc in oModel) {
                        if (oc in nModel && oModel[oc] != nModel[oc]) {
                            equivalent = false;
                        }
                    }
                    if (equivalent) {
                        qualityList[i] = this.qTable[j];
                        break;
                    }
                }
            }
        }
        this.models = models;
        this.pdModels = pdModels;

        // Pass an array of values to create a vector with the array dimensions.
        return qualityList;
    }


    /**
     * Calculates a reward based on two options
     * @param {Array} interactants the collection of interactans of this agent.
     * @return {Array} the representation of the state
     */
    calculateReward(result) {
        let reward = 0;
        //console.log(this.expectedResult)
        //console.log(result)
        if (this.expectedResult != {}) {
            for (let er in this.expectedResult) {

                if (!isNaN(this.expectedResult[er])) {
                    if (this.expectedResult[er] === result[er]) {
                        reward += 0.1;
                    } else {
                        reward -= 0.1;
                    }
                }
            }
            return reward;
        }
    }

    /**
     * Calculates a reward based on two options
     * @param {Array} interactants the collection of interactans of this agent.
     * @return {Array} the representation of the state
     */
    calculateInferedReward(result) {
        let iReward = [];

        // Points given by each prediction
        let ppA = {}
        if (this.expectedResult != {}) {
            for (let er in this.expectedResult) {
                if (!isNaN(this.expectedResult[er])) {
                    if (this.expectedResult[er] === result[er]) {
                        ppA[er] = 0.01;
                    } else {
                        ppA[er] = -0.01;
                    }
                }
            }
            let pdModel = this.pdModels[this.cMentalModel.join(' ')];

            for (let pdM in this.pdModels) {
                const tempPdM = this.pdModels[pdM];
                let tempReward = 0;

                for (let cpd in tempPdM) {
                    if (tempPdM[cpd] == pdModel[cpd] && !isNaN(ppA[cpd])) {
                        tempReward += ppA[cpd];
                    }
                }
                iReward.push(tempReward);
            }
            return iReward;
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
                    return 1 - Math.pow(0.97, delta);
                    break;
            }
        } else {
            console.log('index value exceeds color array length');
        }
    }



    /**
     * Translate a color model to a list of attributes based on the distances between the curren agent and the others
     * @param {Array} color simple order list of the colors 
     * @return {Object} list of value between 0 and 1, where 1 is the farthest perceived distance for each color in the model
     */
    getPerceivedColorDistanceFeatures(colorMentalModel) {
        let indexA = colorMentalModel.indexOf(this.id);
        let modelFeatures = {}

        for (let indexB = 0; indexB < colorMentalModel.length; indexB++) {
            if (indexB != indexA && colorMentalModel[indexB] != 'blanc') {
                let delta = Math.abs(indexA - indexB);
                let perceivedColorDistance;
                switch (this.sensibility) {
                    case 'linear':
                        perceivedColorDistance = delta / (colorMentalModel.length - 1);
                        break;
                    case 'chordal':
                        let subAngle = Math.PI * 2 / colorMentalModel.length;
                        let totalAngle = subAngle * delta;
                        if (totalAngle > Math.PI) {
                            totalAngle = Math.PI * 2 - totalAngle;
                        }
                        let distance = totalAngle / Math.PI;
                        perceivedColorDistance = distance;
                        break;
                    case 'exponential':
                        perceivedColorDistance = 1 - Math.pow(0.97, delta);
                        break;
                }
                modelFeatures[colorMentalModel[indexB]] = perceivedColorDistance;
            }
        }
        return modelFeatures;
    }



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
            let pdModel = this.pdModels[this.cMentalModel.join(' ')];
            let perceivedColorDistance = pdModel[i.id];

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
            if (currentDist > this.farthest) {
                this.expectedResult[i.id] = NaN;
            } else {
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