class AgentColor{

	constructor (p5, index, theColor){
		this.x = Math.floor(Math.random() * p5.width)
		this.y = Math.floor(Math.random() * p5.height)
		this.id = index;
		this.pos = p5.createVector(this.x, this.y);
		//this.color = chroma(Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255));
		this.color = theColor;
		this.id = index;
		this.proximityGap = 300;
		this.speedFactor = 0.3;

		//
		this.agentDistancePairs=[];
	}

	show (p5){
		p5.fill(this.color.rgb());
		p5.noStroke();
		p5.ellipse(this.pos.x,this.pos.y,20,20);
	}

	move (p5){
		for (var i = 0; i < this.agentDistancePairs.length; i++) {
			var angle = p5.atan2(this.agentDistancePairs[i].agent.pos.y - this.pos.y, this.agentDistancePairs[i].agent.pos.x - this.pos.x); 
			var stepX = p5.cos(angle);
			var stepY = p5.sin(angle);

			if (p5.dist(this.pos.x, this.pos.y, this.agentDistancePairs[i].agent.pos.x, this.agentDistancePairs[i].agent.pos.y) > this.agentDistancePairs[i].pixelDistance) {
				this.pos.x +=  stepX * this.speedFactor;
				this.pos.y += stepY * this.speedFactor;
			} else {
				this.pos.x -=  stepX * this.speedFactor;
				this.pos.y -= stepY * this.speedFactor;
			}
		}

	}

	nearToFarther(p5,others){
		if (this.agentDistancePairs.length < others.length -1){
			// Look in the list who is the nearest one that is not myself
			for (var i = 0; i < others.length; i++) {
				var nearest = null;
				var shortestProximity;

				if (others[i].id != this.id){

					if (nearest == null){
						nearest = others[i];
						shortestProximity = p5.dist(this.pos.x, this.pos.y, others[i].pos.x, others[i].pos.y);
					} else {

						if (p5.dist(this.pos.x, this.pos.y, others[i].pos.x, others[i].pos.y) < shortestProximity){
							nearest = others[i];
							shortestProximity = p5.dist(this.pos.x, this.pos.y, others[i].pos.x, others[i].pos.y);
						}
					}

				// Estimate a pixelDistance to that agent based on the perceived color proximity
				var colorDistance = chroma.distance(this.color, others[i].color)/255;
				var pixelDistance = this.proximityGap * colorDistance;

				// Store the pixelDistance for that agent
				var tmp = {agent:nearest, pixelDistance:pixelDistance, colorDistance:colorDistance};
				this.agentDistancePairs.push(tmp);
			
				// Start the process again until the pixelDistance to all agents is estimated 
				}
			}
		}
	}

	visualizeInteractions(p5, others){
		for (var j= 0 ; j < this.agentDistancePairs.length ; j++) {
			p5.stroke(0,20);
			p5.line(this.agentDistancePairs[j].agent.pos.x,this.agentDistancePairs[j].agent.pos.y,this.pos.x,this.pos.y);
		}
	}

	meAgainstAll(p5, target){
		if (this.pos.x > 0 && this.pos.x < p5.width && this.pos.y > 0 && this.pos.y < p5.height){

			if (p5.dist(this.pos.x, this.pos.y, target.pos.x, target.pos.y) > this.proximityGap) {
				var angle = p5.atan2(target.pos.y - this.pos.y, target.pos.x - this.pos.x); 
				var stepX = p5.cos(angle);
				var stepY = p5.sin(angle);
				// estimate proximity
				var prox = chroma.distance(this.color, target.color)/255;
				//prox = p5.map(prox,0,1,1,-1) * this.speedFactor;

				this.pos.x +=  stepX * prox;
				this.pos.y += stepY * prox;
			}
		}
	}

	run (p5, others){
		for (var i = 0; i < others.length; i++) {
			if (others[i].id != this.id){
				// move
				this.meAgainstAll(p5,others[i]);
			}
		}
	}
}