/**
Human agent that extends Agent
@param x the x coordinate on canvas
@param y the y coordinate on canvas
@param index the id of this agent
@param theColor the color id of this agent
@param colorPalette the color palette used by this agent
@param shortest used by spatial mental model to determine what proximity on canvas is close
@param farthest used by spatial mental model to determine what proximity on canvas is far away
*/
class Human extends Agent{

	constructor (x, y, index, theColor, colorPalette, colorMapping, shortest, farthest){
		super(x, y, index);

		//this.colorValues {name, chroma}
		this.colorValues = theColor;

		// the location where this agent has been
		this.locations=[];

		// this agents cMentalModel. This represents the unique way this agent perceives colors in the world
		this.cMentalModel = new ColorMentalModel(colorPalette, colorMapping);

		// this agents sMentalModel. This represents the unique way this agent perceives distances in the world
		this.sMentalModel = new SpatialMentalModel(shortest, farthest);

		// set the index of this color inside the color mental model
		this.cMentalModel.setMyIndex(this.colorValues);

		// visual perception angle
		this.visualPerceptionAngle = Math.PI*3/4;

		/* Percentage of "color similarity" that triggers this agent to act. Value between 0 and 1. Where 1 means
		that all the colors fall within the range of colors that trigger actions. 0.7 means that only
		colors within 70% range of perceived colors trigger actions. */
		this.colorTriggerBoundary = 1;

		// How fast agents move in the animation. This controls the length of the step.
		this.stepLengthFactor = 0.007;

		// True when all interactants are within the proximity boundary
		this.iAmDone = false;

		// The closest distance in pixels this agent want to be from nearby agents
		this.proximityPixelGap = 100;

		// controls the diameter of radius scope
		this.radiusFactor = 10;
	}

	/**
	* The observer notify() function renamed as updateMyWorld. Instances of this class observe an instance of the world class
	* https://pawelgrzybek.com/the-observer-pattern-in-javascript-explained/
	*/
	updateMyWorld(world){
		// The world has changed!!! Update all the references to the world
		console.log(this.id);
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
		p5.fill(0,100);
		// print agent ID
		p5.text(this.id, this.pos.x - 2,this.pos.y - 11);
		p5.noFill();
		p5.stroke(this.colorValues.rgb());
		// if (this.interactants.length > 1){
		// 	p5.ellipse(this.pos.x,this.pos.y, (2*document.getElementById("range").value*this.radiusFactor)/ (this.interactants.length));
		// }else{
		// 	p5.ellipse(this.pos.x,this.pos.y, (2*document.getElementById("range").value*this.radiusFactor));
		//
		if (document.getElementById('rule').value == 'radius' || document.getElementById('rule').value == 'byField'){
			this.drawHeading(p5);
		}
	}

	drawHeading(p5, lngth){
		let radius = Number(document.getElementById("range").value) * this.radiusFactor;
		let nX = Math.cos(this.bearing) * radius;
		let nY = Math.sin(this.bearing) * radius;
		p5.fill(100,5);
		p5.line(this.lastPos.x, this.lastPos.y , this.pos.x + nX, this.pos.y + nY);
		p5.arc(this.lastPos.x, this.lastPos.y, radius*2, radius*2, this.bearing - this.visualPerceptionAngle/2, this.bearing + this.visualPerceptionAngle/2);
		p5.noFill();
	}

	/**
	* Show links between this and other agents with whom it interacts
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
	*/
	showTrajectory(p5){
		p5.stroke(this.colorValues.rgb());
		p5.noFill();
		p5.beginShape();
		for(let l of this.locations){
			p5.vertex(l.x, l.y);
		}
		p5.endShape();
	}

	/**
	* Interact with other agents
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
				//Calculate the difference between the spatialMagnitude and the actual spatial distance
				let currentDist = this.sMentalModel.dist(this.pos.x, this.pos.y, i.pos.x, i.pos.y);
				// Adjust the position
				this.move((currentDist - spatialMag), i.pos.x, i.pos.y);
			}
		}
		// update the bearing after being compared with all the interactants
		if(this.pos.x != this.lastPos.x && this.pos.y != this.lastPos.y){
			this.bearing = Math.atan2(this.pos.y-this.lastPos.y, this.pos.x-this.lastPos.x);
		}
	}

	/**
	* Asign the subset of pairs to interact with. By default it assigns all of them
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
		// function isInteractant(element){
		// 	return element.interactant == true;
		// }
		return interactants.filter(this.isInteractant);
	}

	/**
	* Selects the euclidean closest q agents and sets them as the new interactants
	* @param n the amount of agents to be retrieved
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
	* @param r the lenght of the radius (scope) around this agent
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
	Choose the agents ahead of this agent. 'Ahead' is defined by the bearing of this agent
	* @param modality the method used to retrieve interactants
	* @param k the lenght of the radius scope or the amount of nearby agents to be retrieved
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
			let i = a.agent;
			let angleBetween = Math.atan2(i.pos.y - this.pos.y, i.pos.x - this.pos.x);
			if ((this.bearing - this.visualPerceptionAngle/2) < angleBetween && angleBetween < (this.bearing + this.visualPerceptionAngle/2)){
				a.interactant = true;
			} else{
				a.interactant = false;
			}
		}
		return agents;
	}
}
