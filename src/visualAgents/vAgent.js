/**
 * General class to plot agents on a p5.js canvas. This follows the  model view-controller pattern
 */
class VAgent{
  /**
   * Visual Agent constructor
   * @param {p5} p5    An instance of p5.js
   * @param {Agent} agent An instance of Agent
   */
  constructor(p5,agent){
    /** The p5.js instance*/
    this.p5 = p5;
    /** The agent instance*/
    this.agent = agent;
  }

  /**
	* Renders visual elements of this agent on screen
	*/
	show (){
		this.p5.fill(this.agent.colorValues.rgb(),10);
		// If my task is not completed to a satisfactory degree
		if (!this.agent.iAmDone){ // this.calcProgress() > this.iAmDoneThreshold
			// thin stroke
			this.p5.noStroke();
		}else{
			// thick stroke
			this.p5.stroke(this.agent.colorValues.rgb());
		}
		// draw ellipse
		this.p5.ellipse(this.agent.pos.x,this.agent.pos.y, 4);
		// black text
		this.p5.fill(0,50);
		// print agent ID
		this.p5.text(this.agent.id, this.agent.pos.x - 2,this.agent.pos.y - 11);
		this.p5.noFill();

		this.p5.stroke(this.agent.colorValues.rgb());
		this.p5.line(this.agent.pos.x,
                this.agent.pos.y,
                this.agent.pos.x + Math.cos(this.agent.bearing)*10,
                this.agent.pos.y + Math.sin(this.agent.bearing)*10);
	}

	/**
	* Shows the perception fields of agents
	*/
	showPerceptionField(){

		// stroke color
		this.p5.stroke(this.agent.colorValues.rgb()[0],this.agent.colorValues.rgb()[1],this.agent.colorValues.rgb()[2],50);

		// for radius
		if (document.getElementById('rule').value == 'radius'){
			this.p5.ellipse(this.agent.pos.x,this.agent.pos.y, (2* document.getElementById("range").value * this.agent.radiusFactor));
		}
		// for arcs
		if (document.getElementById('rule').value == 'byField'){
			let radius = Number(document.getElementById("range").value) * this.agent.radiusFactor;
			let nX = Math.cos(this.agent.bearing) * radius;
			let nY = Math.sin(this.agent.bearing) * radius;
			this.p5.fill(100,5);
			this.p5.line(this.agent.lastPos.x,
                  this.agent.lastPos.y,
                  this.agent.pos.x + nX,
                  this.agent.pos.y + nY);
			this.p5.arc(this.agent.lastPos.x, this.agent.lastPos.y,
                  radius*2, radius*2, this.agent.bearing - this.agent.visualPerceptionAngle/2,
                  this.agent.bearing + this.agent.visualPerceptionAngle/2,
                  this.p5.PIE);
			this.p5.noFill();
		}
	}

	/**
	* Show links between this and other agents with whom it interacts
	*/
	visualizeInteractions(){
		// for each pair
		for (let pair of this.agent.getHumanInteractants()) {
			// grey stroke
			this.p5.stroke(0,20);
			// draw an edge connecting this agent and its pair
			this.p5.line(pair.agent.pos.x + 2,
                  pair.agent.pos.y + 2,
                  this.agent.pos.x,
                  this.agent.pos.y);
		}
	}

	/**
	* Shows the trajectory
	*/
	showTrajectory(){
		this.p5.stroke(this.agent.colorValues.rgb()[0],this.agent.colorValues.rgb()[1],this.agent.colorValues.rgb()[2],100);
		this.p5.noFill();
		this.p5.beginShape();
		for(let l of this.agent.locations){
			this.p5.vertex(l.x, l.y);
		}
		this.p5.endShape();
	}

}
