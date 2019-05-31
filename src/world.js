/**
* The world is a collection of observers. If agents observe the world, it means that they are observing each other.
* Observations could be self referenced, meaning that one agent can have a reflexive interaction
*/
class World{

/**
 * Constructor
 */
  constructor(){
    this.observers = [];
  }

  /**
  * Subscribes an agent as observer to this world. https://pawelgrzybek.com/the-observer-pattern-in-javascript-explained/
  * @param {Agent} observer The agent that observes this world
  */
  subscribe(observer){
    if (observer instanceof Human || observer instanceof Nonhuman){
      this.observers.push(observer);
      // notify
      this.notifyObservers(this);
    }
  }

  /**
  * Unsubscribes an agent from this world. https://pawelgrzybek.com/the-observer-pattern-in-javascript-explained/
  * @param {Agent} agent If agent is not undefined returns the collection of agents except this agent
  */
  unsubscribe(observer){
    this.observers = this.observers.filter(subscriber => subscriber !== observer);
    // notify
    this.notifyObservers();
  }

  /**
  * Notifies all observers the latest version of this world
  * https://pawelgrzybek.com/the-observer-pattern-in-javascript-explained/
  */
  notifyObservers(world){
    this.observers.forEach(function(element){
      element.updateMyWorld(world);
    })
  }

  /**
  * Returns the collection of agents in the world. If agent is not undefined returns the collection of agents except this agent
  * @param {Agent} agent If agent is not undefined returns the collection of agents except this agent
  * @return the collection of agents in the world. If agent is not undefined returns the collection of agents except this agent
  */
  getAgents(agent){
    if (agent){
      return this.observers.filter(subscriber => subscriber !== agent);
    } else {
      return this.observers;
    }
  }

  /**
  * Returns the collection of human agents in the world. If agent is not undefined returns the collection of human agents except this agent
  * @param {Agent} agent If agent is not undefined returns the collection of agents except this agent
  * @return the collection of agents in the world. If agent is not undefined returns the collection of agents except this agent
  */
  getHumans(agent){
    if (agent){
      return this.observers.filter(subscriber => subscriber !== agent && subscriber instanceof Human);//
    } else {
        return this.observers.filter(subscriber => subscriber instanceof Human);
    }
  }

  /**
  * Returns the collection of nonhumn agents in the world. If agent is not undefined returns the collection of nonhuman agents except this agent
  * @param {Agent} agent If agent is not undefined returns the collection of agents except this agent
  * @return the collection of agents in the world. If agent is not undefined returns the collection of agents except this agent
  */
  getNonhumans(agent){
    if (agent){
      return this.observers.filter(subscriber => subscriber !== agent && subscriber instanceof Nonhuman);
    } else {
      return this.observers.filter(subscriber => subscriber instanceof Nonhuman);
    }
  }

/**
 * Calls interact() funciton on all world observers
 */
  runAgents(){
    for (var a = 0; a < this.observers.length; a++){
      this.observers[a].interact();
    }
  }

/**
 * Clears the world's collection of observers
 */
  reset(){
    this.observers = [];
  }
}
