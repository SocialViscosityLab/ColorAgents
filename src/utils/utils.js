/**
 * Abstract class with utility functions
 */

class Utils{

  /**
  * Euclidean distance between this agent and other agent
  */
  static euclideanDist(agentA, agentB){
    return this.dist(agentA.pos.x, agentA.pos.y, agentB.pos.x, agentB.pos.y);
  }

  /**
  * Adapted from Processing's map() if either the second or third parameter are omited, the function uses current values
  * of this.shortest and this.farthest
  */
  static dist(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow((x2-x1),2) + Math.pow((y2-y1),2));
  }

}
