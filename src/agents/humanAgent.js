/**
Human agent. Extends Agent
@param {Number} x the x coordinate on canvas
@param {Number} y the y coordinate on canvas
@param {String} index the id of this agent
@param {String} theColor the color id of this agent
@param {String} colorPalette the color palette used by this agent
@param {String} sensibility a function (linear, exponential...) that represents the perceived proximity between colors from the reference point of this observer.
@param {Number} shortest scalar used by spatial mental model to determine what on canvas how near an agent wants to be from the most similar agent
@param {Number} farthest scalar used by spatial mental model to determine what on canvas how far away an agent was to be from the most dissimilar agent
*/
class Human extends Agent{

constructor (x, y, index, theColor, colorPalette, sensibility, shortest, farthest){
	super(x, y, index);

	this.colorValues = theColor;

	/** This agents' color Mental Model. This represents the unique way this agent perceives colors in the world*/
	this.cMentalModel = new ColorMentalModel(colorPalette, document.getElementById("sensibility").value);

	/** This agents' spacial Mental Model. This represents the unique way this agent perceives distances in the world*/
	this.sMentalModel = new SpatialMentalModel(shortest, farthest);

	// Finds the index of this agent's color inside its own color mental model
	this.cMentalModel.setMyIndex(this.colorValues);

	/** Visual perception angle in radians*/
	this.visualPerceptionAngle = Math.PI*3/4;

	/** Percentage of "color similarity" that triggers this agent to act. Value between 0 and 1. Where 1 means
	that all the colors fall within the range of colors that trigger actions. 0.7 means that only
	colors within 70% range of perceived colors trigger actions. */
	//this.colorTriggerBoundary = 1;

	// The lowest distance this agent starts perceiving something as far away. This is used in the alpha mapping
	// function of the visualization matrix
	this.farthest = farthest;

	// The amplification factor of interaction radius scope
	this.radiusFactor = 10;

}

/**
* Calls one interaction with other agents stored in its own collection of pairs.
* It is usually used in recursive structures. In this case, this function follows these
* steps: 
1) Record agent's current location,
2) Store agent's last position before moving, 
3) Filter pairs with whom to interact according to user settings,
4) If there is any interactant
4.1) Estimate the magnitude and direction of next step using this.calculateStep(), 
4.2) Verfiy if the change is worth to execute the movement. Threshold in user settings,
4.3) move or set done status to true.
5) If no interactants
5.1) Set done status to true.
*/
interact (){

	// Store my current position
	this.locations.push({x:this.pos.x, y:this.pos.y});

	// Store the last position before moving
	this.lastPos.set(this.pos);

	// get the interactants
	let interactants = this.retrieveInteractants();

	// Estimate the magnitude and direction of next step with all the current interactants
	// WARNING: This function internally updates spatial distances.
	// See function definition below
	if (interactants.length > 0){
		
		let nextPos = this.calculateStep(interactants);

		this.bearing = nextPos.heading();

		// Get change magnitude threshold using user settings 
		let magnitudeThreshold = document.getElementById("changeMagnitude").value * (this.sMentalModel.farthest - this.sMentalModel.shortest);
		magnitudeThreshold += this.sMentalModel.shortest;

		// Verfiy if the change is worth to execute the movement
		if (nextPos.mag() > Number(magnitudeThreshold)){
			this.iAmDone = false;
			// Move
			this.move2(nextPos.normalize());
		} else{
			this.iAmDone = true;
		}
	} else if (document.getElementById("rule").value == 'byField'){
		if (!this.iAmDone){
			this.bearing += 0.1;
		}
	} else {
		this.iAmDone = true;
	}
}

/**
* Estimate direction and magnitude of a step by adding the vectors towards each interactant
* @param {Array} interactants the collection of interactans of this agent.
* @return {p5.Vector} the vector
*/
calculateStep(interactants){

	let vector;

	for (let i of interactants) {
		i = i.agent;

		// Calculate vector magnitude

		// Use the mental model to calculate the perceived distance to each interactant
		let perceivedColorDistance = this.cMentalModel.getPerceivedColorDistance(i.colorValues);

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
		this.updateDistanceMap(i.id, spatialMag, currentDist);

		// for the first interactant
		if (!vector){
			// Calculate the angle between this and the pair agent
			let tmp =  Math.atan2(i.pos.y - this.pos.y, i.pos.x - this.pos.x);
			vector = new mainP5.createVector(Math.cos(tmp)*deltaDist, Math.sin(tmp)*deltaDist);
		} else {
			let tmp =  Math.atan2(i.pos.y - this.pos.y, i.pos.x - this.pos.x);
			let tmpV = new mainP5.createVector(Math.cos(tmp)*deltaDist, Math.sin(tmp)*deltaDist)
			vector.add(tmpV);
		}
	}
	if (vector == undefined){
		return new mainP5.createVector(0,0);
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
retrieveInteractants(otherAgents){

	let agents;
	if (!otherAgents){
		agents = this.getPairs();
	} else {
		agents = otherAgents;
	}

	// read the user choice
	let tmp = document.getElementById('rule').value;
	let val = document.getElementById("range");
	let interactants;
	switch(tmp){
		case 'nClosest':
		document.getElementById('sliderValue').innerHTML = val.value;
		interactants = Utils.chooseNClosest(this, Number(val.value),agents);
		break;
		case 'radius':
		document.getElementById('sliderValue').innerHTML = val.value * this.radiusFactor;
		interactants = Utils.chooseByRadius(this, Number(val.value) * this.radiusFactor, agents);
		break;
		case 'byField':
		document.getElementById('sliderValue').innerHTML = val.value * this.radiusFactor;
		interactants = Utils.chooseByField(this, Number(val.value) * this.radiusFactor, 'radius', agents);
		break;
		case 'all':
		interactants = this.resetInteractants();
		break;
	}
	return interactants.filter(this.isInteractant);
}
}
