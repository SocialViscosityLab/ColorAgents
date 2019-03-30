class Agent{
  constructor(x, y, id){
    // pos
		//this.pos = {x:x, y:y}
    // id
    this.id = id;
    // PVector current pos
    this.pos = globalP5.createVector(x,y);
    // lastPosition
    this.lastPos = globalP5.createVector(x,y);
    // bearing
    this.bearing = Math.random(0, Math.PI*2);
  }

  move(dist, destX, destY){
		// Calculate the angle between this and the pair agent
		var angle = Math.atan2(destY - this.pos.y, destX - this.pos.x);
		// Get step in x
		var stepX = Math.cos(angle) * dist * this.stepLengthFactor;
		// Get step in y
		var stepY = Math.sin(angle) * dist * this.stepLengthFactor;
    // move forward in x & y
    this.pos.x += stepX;
    this.pos.y += stepY;
	}
}
