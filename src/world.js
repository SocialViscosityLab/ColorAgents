/**
* The world is a collection of observers. If agents observe the world, it means that they are observing each other.
* Observations could be self referenced, meaning that one agent can have a reflexive interaction
*/
class World {

  /**
   * Constructor
   */
  constructor() {
    this.observers = [];
    this.ticks = 0;
    this.colors;
    this.referenceModel;
    // Boolean to registe if the permutations have been loaded
    this.permuLoaded = false;
  }

  /**
  * Subscribes an agent as observer to this world. https://pawelgrzybek.com/the-observer-pattern-in-javascript-explained/
  * @param {Agent} observer The agent that observes this world
  */
  subscribe(observer) {
    //if (observer instanceof Human || observer instanceof Nonhuman){
    this.observers.push(observer);
    // notify
    this.notifyObservers(this);
    //}
  }

  /**
  * Unsubscribes an agent from this world. https://pawelgrzybek.com/the-observer-pattern-in-javascript-explained/
  * @param {Agent} agent If agent is not undefined returns the collection of agents except this agent
  */
  unsubscribe(observer) {
    this.observers = this.observers.filter(subscriber => subscriber !== observer);
    // notify
    this.notifyObservers();
  }

  /**
  * Notifies all observers the latest version of this world
  * https://pawelgrzybek.com/the-observer-pattern-in-javascript-explained/
  */
  notifyObservers(world) {
    this.observers.forEach(function (element) {
      element.updateMyWorld(world);
    })
  }

  /**
  * Returns the collection of agents in the world. If 'exceptAgent' is provided, it returns the collection of agents except that agent
  * @param {Agent} exceptAgent If not undefined returns the collection of agents except this agent
  * @return the collection of agents in the world. If agent is not undefined returns the collection of agents except this agent
  */
  getAgents(exceptAgent) {
    if (exceptAgent) {
      return this.observers.filter(subscriber => subscriber !== exceptAgent);
    } else {
      return this.observers;
    }
  }

  /**
  * Returns the collection of human agents in the world. If agent is not undefined returns the collection of human agents except this agent
  * @param {Agent} agent If agent is not undefined returns the collection of agents except this agent
  * @return the collection of agents in the world. If agent is not undefined returns the collection of agents except this agent
  */
  getHumans(agent) {
    if (agent) {
      return this.observers.filter(subscriber => subscriber !== agent && (subscriber instanceof Human || subscriber instanceof NewHuman));//
    } else {
      return this.observers.filter(subscriber => (subscriber instanceof Human || subscriber instanceof NewHuman));
    }
  }

  /**
  * Returns the collection of human agents in the world. If agent is not undefined returns the collection of human agents except this agent
  * @param {Agent} agent If agent is not undefined returns the collection of agents except this agent
  * @return the collection of agents in the world. If agent is not undefined returns the collection of agents except this agent
  */
  getLearningAgents(agent) {
    if (agent) {
      return this.observers.filter(subscriber => subscriber !== agent && (subscriber instanceof NewHuman));//
    } else {
      return this.observers.filter(subscriber => (subscriber instanceof NewHuman));
    }
  }

  /**
  * Returns the collection of nonhumn agents in the world. If agent is not undefined returns the collection of nonhuman agents except this agent
  * @param {Agent} agent If agent is not undefined returns the collection of agents except this agent
  * @return the collection of agents in the world. If agent is not undefined returns the collection of agents except this agent
  */
  getNonhumans(agent) {
    if (agent) {
      return this.observers.filter(subscriber => subscriber !== agent && subscriber instanceof Nonhuman);
    } else {
      return this.observers.filter(subscriber => subscriber instanceof Nonhuman);
    }
  }

  /**
   * Calls interact() function on all world observers. It should be timed by a
   * Window setInterval() Method from the browser or the server.
   */
  runAgents(limit) {
    if (!limit){
      limit = Infinity;
    }
    if (world.getTicks() < limit) {
      Utils.startRecording(world.getTicks());
      for (var a = 0; a < this.observers.length; a++) {
        Utils.recordData(this.observers[a]);
        this.observers[a].interact();
      }
      Utils.endRecording();
      Utils.clearRecorder();
      this.ticks++;
      DOM.labels.ticksInWorld.innerHTML = this.ticks;
    }else {
      // At run completion 
      return true;
    }
  }


  /**
   * Clears the world's collection of observers
   */
  reset() {
    this.observers = [];
    this.ticks = 0;
  }

  /**
   * Gets the elapsed number of ticks ran while the main interval function has been enabled
   *
   * @return {Number} The ellapsed number of ticks
   */
  getTicks() {
    return this.ticks;
  }
}
