/**
* Notes:
* Urbana, May 2019
* 1. Social viscosity measures the evolution of where I am in contrast to where
* I want to be in relation to all my interactants
*
* 2.Social viscosity measures the contrast between where I am and where I want
* to be in relation to all my interactants over a period of time, i.e., the execution
* of a task or a practice.
*
* Santa Marta, June 2019
* 3. Social viscosity is estimated by contrasting "where I am" with "where I intend
* to be" in relation to all my interactants over the duration of an action, task or practice.
*
* The same could also be reframed:
* 4. The viscosity of a social practice is estimated by contrasting the situation
* agents "intended to be" with the situation they "ended" after the execution of
* social actions. The definition os "situation" encompasses the interactions with
* each interactant and with the world.
*/

class Metrics {
  constructor(world) {
    this.world = world;
    /** The metricsMap is a nested structure of key-value pairs. At the top of the
    structure there is a Map whose keys are timeStamps retrieved from the world's ticker. For
    each timeStamp there is a collection of all the interactions occurred at that
    moment organized by agents. Such inner collection is also a map of key-value
    pairs where the key is the agent and the pair is an array of interactions of that
    agent with all the others.
    */
    this.metricsMap = new Map();
    this.agents = world.getHumans();
    // Map with key: agent value: anotherMap with key: time tick, value: viscosity
    this.agentsViscosityData = new Map();
    // Map with key: time tick, value: viscosity
    this.globalViscosityData = new Map();
  }

  /**
  * This function stores the data from agents interaction in the main collection named
  * metricsMap. It is recursively called from a browser's setInterval function controlled
  * in the main.js file.
  */
  getMetricsData() {

    let innerMap = new Map();

    // Get interactions for each agent in current time
    for (let agent of this.agents) {
      this.getInteractions(innerMap, agent);
    }

    //save interactions for the current tick time.
    this.metricsMap.set(world.getTicks(), innerMap);

    for (let agent of this.agents) {
      this.recordAgentViscosityData(agent);
    }

    let vscsty = this.recordGlobalViscosityData();

    document.getElementById("viscosityInWorld").innerHTML = vscsty.toFixed(2);
  }

  /**
  * Private. Records agent viscosity data at the current tick
  * @param  {Agent} agent The agent to record data from
  */
  recordAgentViscosityData(agent) {
    let tmp = this.agentsViscosityData.get(agent);
    if (!tmp) {
      let tmpInnerMap = new Map();
      tmpInnerMap.set(world.getTicks(), this.viscosityAtFor(world.getTicks(), agent));
      this.agentsViscosityData.set(agent, tmpInnerMap);
    } else {
      tmp.set(world.getTicks(), this.viscosityAtFor(world.getTicks(), agent));
    }
  }

  /**
  * Private. Records global viscosity data at the current tick
  * @return  {Number} global Viscosity value at current tick
  */
  recordGlobalViscosityData() {
    let tmp = this.viscosityAt(world.getTicks());

    this.globalViscosityData.set(world.getTicks(), tmp);
    return tmp;
  }

  /**
  * Gets the interactions from the distancesMap of a given agent.
  * @param  {Map} innerMap The temporal innerMap storing the interactions occurred in a time tick
  * @param  {Agent} agent    The agent to which interactions want to be retrieved.
  */
  getInteractions(innerMap, agent) {
    // retrieve agent's interactants
    let interactants = agent.retrieveInteractants();

    let interactions = [];

    // Iterate over its interactants 'i' at the previous time step
    for (let interactant of interactants) {

      let intendedDist;

      try {
        // Take the intendend distances in the previous time step to each interactant
        intendedDist = agent.distancesMap.get(interactant.agent.id).spatialMag;
      }
      catch (error) {
        // It might be the case that at the current time these agents start an
        // inteaction. Therefore there is no stored spatialMag in the previuos
        // time tick. In that case the intendedDist is set to 0.
        intendedDist = 0;
      }

      // Take the current distance to each 'i'
      let currentDist = Utils.euclideanDist(agent, interactant.agent);

      // Calculate weighted difference
      let weightedDeltaDist = Math.abs(((currentDist - intendedDist) / intendedDist));

      // If the intendedDist == 0 then the weightedDeltaDist will be infinite.
      // That does not make sense because it would mean that Agent estimated to
      // be ininitely far away from the interactant. Thus, weightedDeltaDist is set to 0
      if (!isFinite(weightedDeltaDist)) {
        weightedDeltaDist = 0;
      }

      // Timetag it and record interaction
      interactions.push({ interactant: interactant.agent.id, spatialMag: intendedDist, currentDist: currentDist, weightedDifference: weightedDeltaDist });
    }

    //  store the interactions with each agent
    innerMap.set(agent, interactions);
  }

  /**
  * Retrieves the array of interactions stored in an innerMap, which in turn is
  * stored inside the metricsMap. The time is a key used to retrieve the corresponding
  * innerMap, agent is a key used to retrieve the corresponding array from the innerMap.
  * @param  {Number} time  The tick number from the sequence of stored interactions
  * @param  {Agent} agent The agent from which the interactions are retrieve.
  * @return {Array} The array of interactions stored for a given agent.
  */
  retrieveInteractionsAtFor(time, agent) {
    let rtn = this.metricsMap.get(time).get(agent);
    if (!rtn) {
      console.log("Interactions array missed at time: " + time + " for agent " + agent.id);
    }
    return rtn
  }

  /**
  * Retrieves the innerMap stored in the given key (time) from the metricsMap.
  * @param  {Number} time  The time tick of the sequence of stored interactions
  * @return {Map} The Map of interactions stored at the given time
  */
  retrieveInteractionsAt(time) {
    if (world.getTicks() > 0) {
      let rtn = this.metricsMap.get(time);
      if (!rtn) {
        console.log("Interaction map missed at time: " + time);
      }
      return rtn
    }
  }

  /**
  * Calculates the viscosity for all agents at a given moment in time
  * @param  {Number} time The tick counter value representing the moment in time from which viscosity wants to be calculated
  * @return {Number}      The viscosity value at time tick
  */
  viscosityAt(time) {
    // Get the innerMap of interactions at given time
    let interactions = this.retrieveInteractionsAt(time);

    let accumulated = 0;
    try {
      // iterate over each agent
      interactions.forEach((key, agent) => {
        accumulated += this.viscosityAtFor(time, agent);
      });

      // average by agents
      accumulated = accumulated / interactions.size;
    } catch (error) {
      console.log("Interaction undefined at time " + time);
    }

    // return averaged result
    return accumulated;
  }

  /**
  * Calculates the agent's viscosity at a given moment in time
  * @param  {Number} time The tick counter value representing the moment in time from which viscosity wants to be calculated
  * @param  {Agent} agent  The agent whose viscosity wants to be calculated
  * @return {Number}       The agent's viscosity value at tick time
  */
  viscosityAtFor(time, agent) {

    // Get the array of interactions at given time
    let interactions = this.retrieveInteractionsAtFor(time, agent);

    let innerAccumulate = 0;

    // iterate over the interactants
    for (let interactant of interactions) {

      // accumulate the weightedDeltaDist
      innerAccumulate += interactant.weightedDifference;
    };

    // average by getInteractants
    if (innerAccumulate != 0 && interactions.length > 0){
      innerAccumulate = innerAccumulate / interactions.length;
    }
    // return averaged result
    return innerAccumulate;
  }

  /**
  * Gets an array with the all the interactions at time tick.
  * Each entry has two pairs (id:agent.id, interactions:interactions) Interactions
  * is an array which entries are the interactions with these attributes:
  * currentDist, interactant, spatialMag, weightedDifference
  * @param  {Number} time The tick counter value representing the moment in time from which the matrix is composed
  * @return {Array}      The array of id:agent.id, interactions:interactions
  */
  getMatrixAt(time) {
    let innerMap = this.retrieveInteractionsAt(time);
    let rtn = [];
    if (world.getTicks() > 0) {
      try {
        innerMap.forEach((interactions, agent) => {
          rtn.push({ id: agent.id, interactions: interactions });
        });
      } catch (error) {
        console.log("Map collections not initialized at time " + time);
      }
    }
    return rtn;
  }

}
