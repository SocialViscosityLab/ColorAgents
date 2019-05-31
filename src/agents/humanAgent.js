/**
Human agent. Extends Agent
@param {Number} x the x coordinate on canvas
@param {Number} y the y coordinate on canvas
@param {String} index the id of this agent
@param {String} theColor the color id of this agent
@param {String} colorPalette the color palette used by this agent
@param {String} sensibility a function that represents the perceived proximity between colors from the reference point of this observer.
@param {Number} shortest used by spatial mental model to determine what proximity on canvas is close
@param {Number} farthest used by spatial mental model to determine what proximity on canvas is far away
*/
class Human extends Agent{

	constructor (x, y, index, theColor, colorPalette, sensibility, shortest, farthest){
		super(x, y, index);

		/**  A color defined as {name, chroma} */
		this.colorValues = theColor;

		/** Array with all the locations where this agent has been */
		this.locations=[];

		/** Array with all the latest distances to all other agents */
		this.distances=[];

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
		this.colorTriggerBoundary = 1;

		/** How fast agents move in the animation. This controls the length of the step. Set to 0.007 by default*/
		this.stepLengthFactor = 0.007;

		/** This boolean variable defines when this agent feels "comfortable" with all its interactants.
		It is true when all interactants are within the proximity boundary. It is used to control when this agents
		stops or resumes interactions*/
		this.iAmDone = false;

		/** The closest distance in pixels this agent want to be from nearby agents*/
		this.proximityPixelGap = 100;

		/** The radius of interaction scope*/
		this.radiusFactor = 10;
	}

	/**
	* The observer notify() function renamed as updateMyWorld. Instances of this class observe an instance of the world class
	* https://pawelgrzybek.com/the-observer-pattern-in-javascript-explained/
	*/
	updateMyWorld(world){
		// The world has changed!!! Update all the references to the world
		for(let h of world.getHumans(this)){
			if (!this.pairsWith(h)){
				this.addPair(h,false);
			}
		}
	}

	/**
	* Display visual elements of this agent on screen
	*/
	show (p5){
		p5.fill(this.colorValues.rgb(),10);
		// If my task is not completed to a satisfactory degree
		if (!this.iAmDone){ // this.calcProgress() > this.iAmDoneThreshold
			// thin stroke
			p5.noStroke();
		}else{
			// thick stroke
			p5.stroke(2);
		}
		// draw ellipse
		p5.ellipse(this.pos.x,this.pos.y, 4);
		// black text
		p5.fill(0,50);
		// print agent ID
		p5.text(this.id, this.pos.x - 2,this.pos.y - 11);
		p5.noFill();
	}

/**
 * Shows the perception fields of agents
 * @param  {P5} p5 An instance of P5.js
 */
	showPerceptionField(p5){
		// stroke color
		p5.stroke(this.colorValues.rgb()[0],this.colorValues.rgb()[1],this.colorValues.rgb()[2],50);
		// for radius
		if (document.getElementById('rule').value == 'radius'){
			p5.ellipse(this.pos.x,this.pos.y, (2*document.getElementById("range").value*this.radiusFactor));
		}
		// for arcs
		if (document.getElementById('rule').value == 'byField'){
			let radius = Number(document.getElementById("range").value) * this.radiusFactor;
			let nX = Math.cos(this.bearing) * radius;
			let nY = Math.sin(this.bearing) * radius;
			p5.fill(100,5);
			p5.line(this.lastPos.x, this.lastPos.y , this.pos.x + nX, this.pos.y + nY);
			p5.arc(this.lastPos.x, this.lastPos.y, radius*2, radius*2, this.bearing - this.visualPerceptionAngle/2, this.bearing + this.visualPerceptionAngle/2, p5.PIE);
			p5.noFill();
		}
	}

	/**
	* Show links between this and other agents with whom it interacts
	* @param  {P5} p5 An instance of P5.js
	*/
	visualizeInteractions(p5){
		// for each pair
		for (let pair of this.getHumanInteractants()) {
			// grey stroke
			p5.stroke(0,20);
			// draw an edge connecting this agent and its pair
			p5.line(pair.agent.pos.x + 2,pair.agent.pos.y + 2,this.pos.x,this.pos.y);
		}
	}

	/**
	* Shows the trajectory
	* @param  {P5} p5 An instance of P5.js
	*/
	showTrajectory(p5){
		p5.stroke(this.colorValues.rgb()[0],this.colorValues.rgb()[1],this.colorValues.rgb()[2],100);
		p5.noFill();
		p5.beginShape();
		for(let l of this.locations){
			p5.vertex(l.x, l.y);
		}
		p5.endShape();
	}

	/**
	* Call one interaction with other agents stored in its own collection of pairs. It is usually used in recursive structures
	*/
	interact (){
		// Define with whom to interact
		let interactants = this.getPairs();

		// filter pairs
		interactants = this.filterInteractants(interactants);

		// Store my current position
		this.locations.push({x:this.pos.x, y:this.pos.y});

		// store the last position before moving
		this.lastPos.set(this.pos);

		for (let i of interactants) {
			i = i.agent;
			/* this gate has this rationale: If the perceived difference between my color and other agent's is less than my
			threshold for action, then do act */
			let doAct = this.cMentalModel.isActionTrigger(i.colorValues, this.colorTriggerBoundary);

			if(doAct){
				// Use the mental model to calculate the perceived distance to each interactant
				let perceivedColorDistance = this.cMentalModel.getPerceivedColorDistance(i.colorValues);

				/*
				There are spatial distances between this agent's location and the interactants' locations. Such distances may not correspond to
				this agent's perceived color distance when converted into spatial distances. The reult of mapping of the perceived color
				distance into a spatial distance is named spatial magnitude. If the difference between the spatial magnitude and the spatial
				distance is negative, this agent should get closer to the other agent, and viceversa.

				This means that this agent should have a mechanism to transduce perceived color distance into the spatial distances. That is why we need
				a Spatial Mental Model.
				*/
				let spatialMag = this.sMentalModel.mapMagnitude(perceivedColorDistance);

				//Calculate the current spatial distance
				let currentDist = globalP5.dist(this.pos.x, this.pos.y, i.pos.x, i.pos.y);

				//Calculate the difference between the spatialMagnitude and the actual spatial distance
				// let deltaDist = currentDist - spatialMag;

				// Calculate the angle between this and the pair agent
				let angle = Math.atan2(i.pos.y - this.pos.y, i.pos.x - this.pos.x);

				this.updateDistances(i.id,spatialMag, currentDist);

				this.move((currentDist - spatialMag), angle);

				//console.log(this.id + " interacted with: "+ i.id);
			}
		}

		// Adjust the position and the bearing

		// update the bearing after being compared with all the interactants
		if(this.pos.x != this.lastPos.x && this.pos.y != this.lastPos.y){
			this.bearing = Math.atan2(this.pos.y-this.lastPos.y, this.pos.x-this.lastPos.x);
		}
	}

/**
 * Updates the collections of spatial magnitudes and pixel distances between this
 * agent and other agent identified by its id
 * @param  {String} id          Other agent's ID
 * @param  {Number} spatialMag  This agent's percived spatial magnitud to other's agent
 * @param  {Number} currentDist Current distance between this and other agent
 */
	updateDistances(id,spatialMag, currentDist){
		if (this.distances.length < 1){
			this.distances.push({id:id, spatialMag:spatialMag, currentDist:currentDist});
		} else {
			let index = -1;
			for (var i = 0; i < this.distances.length; i++) {
				if (this.distances[i].id == id){
					index = i;
					break;
				}
			}

			if(index != -1){
				this.distances[index].spatialMag = spatialMag;
				this.distances[index].currentDist = currentDist;
			} else {
				this.distances.push({id:id, spatialMag:spatialMag, currentDist:currentDist});
			}
		}
	}

	/**
	* Asign the subset of pairs to interact with. By default it assigns all of them
	*  @param {Array} agents The list of agents with whom this agent will interact. Agents in this list will be matched with
	*  this agent's list of pairs and set their {boolean} interactant parameter to TRUE.
	*  @return {Array} The list of "TRUE" interactants
	*/
	filterInteractants(agents){
		// read the user choice
		let tmp = document.getElementById('rule').value;
		let val = document.getElementById("range");
		let interactants;
		switch(tmp){
			case 'nClosest':
			document.getElementById('sliderValue').innerHTML = val.value;
			interactants = this.chooseNClosest(agents, Number(val.value));
			break;
			case 'radius':
			document.getElementById('sliderValue').innerHTML = val.value * this.radiusFactor;
			interactants = this.chooseByRadius(agents, val.value * this.radiusFactor);
			break;
			case 'byField':
			document.getElementById('sliderValue').innerHTML = val.value * this.radiusFactor;
			interactants = this.chooseByField(agents,'radius', val.value * this.radiusFactor);
			break;
			case 'all':
			interactants = this.resetInteractants();
			break;
		}
		return interactants.filter(this.isInteractant);
	}

	/**
	* Selects the euclidean closest q agents and sets them as the new interactants
	* @param {Array} agents the agents to validate proximity gap
	* @param {Number} n the amount of agents to be retrieved
	* @return {Array} The top 'n' closest interactants
	*/
	chooseNClosest(agents, n){
		let tempCollection = [];
		// calculate distance to all the pairs
		for(let i of agents){
			let proximity = this.sMentalModel.euclideanDist(this, i.agent);
			tempCollection.push({agent:i,prox:proximity});
		}
		// sort them by proximity
		tempCollection.sort(function(a,b){
			return a.prox-b.prox;
		});
		// sets the upper limit of n
		if (n > agents.length){
			n = agents.length;
		}
		// reset all the agents
		for (let a of agents) {
			a.interactant = false;
		}
		// enable the top N
		for (var i = 0; i < n; i++) {
			for (let a of agents) {
				if(_.isEqual(a, tempCollection[i].agent)){
					a.interactant = true;
				}
			}
		}
		return agents;
	}

	/**
	* Choose the ones inside a given radius
	* @param {Array} agents the agents to validate if they fall within the radius scope
	* @param r the lenght of the radius (scope) around this agent
	* @return {Array} The agents within the radius
	*/
	chooseByRadius(agents, r){
		// calculate distance to all the pairs
		for(let i of agents){
			let proximity = this.sMentalModel.euclideanDist(this, i.agent);
			if (proximity <= r){
				i.interactant = true;
			} else {
				i.interactant = false;
			}
		}
		return agents;
	}
	/**
	* Choose the agents in front of this agent. 'In front' is defined by the bearing of this agent
	* @param {Array} agents the agents to validate if they are in front of this agent
	* @param {String} modality the method used to retrieve interactants
	* @param {Number} k the lenght of the radius scope or the amount of nearby agents to be retrieved
	* @return {Array} The agents within the perception field
	*/
	chooseByField(agents, modality, k){
		switch (modality){
			case 'radius':
			// get them by radius
			agents = this.chooseByRadius(agents, k);
			break;
			case 'nCloser':
			// get them by proximity
			agents = this.chooseNClosest(agents, k);
			break;
		}
		//filter interactants by perception scope
		//console.log("  upper: "+ (this.bearing + this.visualPerceptionAngle/2));
		//console.log("  lower: "+ (this.bearing - this.visualPerceptionAngle/2));
		for (let a of agents) {
			if (a.interactant == true){
				let angleBetween = Math.atan2(a.agent.pos.y - this.pos.y, a.agent.pos.x - this.pos.x);
				if ((this.bearing - (this.visualPerceptionAngle/2)) < angleBetween && angleBetween < (this.bearing + (this.visualPerceptionAngle/2))){
					a.interactant = true;
				} else{
					a.interactant = false;
				}
			}
		}
		return agents;
	}
}
